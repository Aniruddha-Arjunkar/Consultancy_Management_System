package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.entity.GstInvoice;
import com.shulventures.consultancymanagement.repository.GstInvoiceRepository;
import com.shulventures.consultancymanagement.repository.InterviewPlacementRepository;
import lombok.RequiredArgsConstructor;
import java.awt.Color;
import org.openpdf.text.Chunk;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.Image;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.Rectangle;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class GstInvoicePdfService {

    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private final GstInvoiceRepository gstInvoiceRepository;
    private final InterviewPlacementRepository placementRepository;

    public byte[] generate(Long invoiceId) {
        GstInvoice invoice = gstInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("GST invoice not found."));

        LocalDate serviceDate = invoice.getJoiningDateSnapshot();
        if (serviceDate == null) serviceDate = invoice.getInvoiceDate();
        if (invoice.getJoiningDateSnapshot() == null
                && invoice.getPlacementInterviewId() != null) {
            serviceDate = placementRepository.findById(invoice.getPlacementInterviewId())
                    .map(placement -> placement.getJoiningDate())
                    .filter(date -> date != null)
                    .orElse(serviceDate);
        }

        Document document = new Document(PageSize.A4, 28, 28, 26, 26);
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, output);
            document.open();

            Font bodyFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
            Font boldFont = new Font(Font.HELVETICA, 9, Font.BOLD);
            Font smallFont = new Font(Font.HELVETICA, 8, Font.NORMAL);
            Font headingFont = new Font(Font.HELVETICA, 18, Font.BOLD | Font.UNDERLINE);

            addCompanyHeader(document, bodyFont, boldFont);
            addRule(document, new Color(153, 222, 165));

            Paragraph title = new Paragraph("TAX INVOICE", headingFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(14);
            title.setSpacingAfter(18);
            document.add(title);

            document.add(new Paragraph(
                    "Invoice Date: " + displayDate(invoice.getInvoiceDate()), boldFont
            ));
            Paragraph number = new Paragraph(
                    "Invoice No: " + safe(invoice.getInvoiceNumber()), boldFont
            );
            number.setSpacingBefore(8);
            number.setSpacingAfter(12);
            document.add(number);

            Paragraph invoiceTo = new Paragraph("Invoice To:", boldFont);
            invoiceTo.setSpacingAfter(5);
            document.add(invoiceTo);
            addAddressTable(document, invoice, bodyFont, boldFont);
            addItemsTable(document, invoice, serviceDate, bodyFont, boldFont, smallFont);

            Paragraph generated = new Paragraph(
                    "(This is system generated PDF; signature & stamp not required)",
                    smallFont
            );
            generated.setAlignment(Element.ALIGN_CENTER);
            generated.setSpacingBefore(16);
            generated.setSpacingAfter(10);
            document.add(generated);
            addFooter(document, bodyFont, smallFont);

            document.close();
            return output.toByteArray();
        } catch (DocumentException | IOException exception) {
            throw new IllegalStateException("Could not generate the GST invoice PDF.", exception);
        } finally {
            if (document.isOpen()) document.close();
        }
    }

    private void addCompanyHeader(Document document, Font body, Font bold)
            throws DocumentException, IOException {
        PdfPTable header = new PdfPTable(new float[]{1.05f, 1.2f});
        header.setWidthPercentage(100);
        header.setSpacingAfter(7);

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Image logo = Image.getInstance(loadLogo());
        logo.scaleToFit(72, 58);
        PdfPTable brand = new PdfPTable(new float[]{0.55f, 1.45f});
        brand.setWidthPercentage(100);
        PdfPCell markCell = new PdfPCell(logo, true);
        markCell.setBorder(Rectangle.NO_BORDER);
        markCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        brand.addCell(markCell);
        PdfPCell wordmarkCell = new PdfPCell();
        wordmarkCell.setBorder(Rectangle.NO_BORDER);
        wordmarkCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph wordmark = new Paragraph(
                "Shul Ventures Pvt. Ltd.",
                new Font(Font.HELVETICA, 17, Font.BOLD, new Color(0, 85, 128))
        );
        wordmarkCell.addElement(wordmark);
        brand.addCell(wordmarkCell);
        logoCell.addElement(brand);
        header.addCell(logoCell);

        PdfPCell companyCell = new PdfPCell();
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        companyCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Paragraph companyName = new Paragraph("Shul Ventures Pvt. Ltd.", bold);
        companyName.setAlignment(Element.ALIGN_RIGHT);
        companyCell.addElement(companyName);
        Paragraph companyDetails = new Paragraph(
                "Bank A/C Number: 920020001745664\n"
                        + "IFSC: UTIB0001242\n"
                        + "Bank Name: AXIS Bank Ltd.\n"
                        + "Branch: Swavalambi Nagar, Nagpur\n"
                        + "GSTIN: 27ABACS2141Q1Z3",
                body
        );
        companyDetails.setAlignment(Element.ALIGN_RIGHT);
        companyCell.addElement(companyDetails);
        header.addCell(companyCell);
        document.add(header);
    }

    private void addAddressTable(
            Document document,
            GstInvoice invoice,
            Font body,
            Font bold
    ) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{1, 1});
        table.setWidthPercentage(100);
        table.setSpacingAfter(14);
        addHeaderCell(table, "Billing Address", bold);
        addHeaderCell(table, "Shipping Address", bold);

        String address = safe(invoice.getShippingAddressSnapshot());
        String gstLine = "GSTIN: " + safe(invoice.getCompanyGstNumberSnapshot());
        addCell(table, safe(invoice.getCompanyNameSnapshot()) + "\n" + address + "\n" + gstLine,
                body, Element.ALIGN_LEFT, Color.WHITE);
        addCell(table, safe(invoice.getCompanyNameSnapshot()) + "\n" + address + "\n" + gstLine,
                body, Element.ALIGN_LEFT, Color.WHITE);
        document.add(table);
    }

    private void addItemsTable(
            Document document,
            GstInvoice invoice,
            LocalDate serviceDate,
            Font body,
            Font bold,
            Font small
    ) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{1.05f, 1.15f, 2.4f, 1.25f});
        table.setWidthPercentage(100);
        table.setSpacingBefore(2);
        table.setWidths(new float[]{1.05f, 1.15f, 2.4f, 1.25f});

        addHeaderCell(table, "Service", bold);
        addHeaderCell(table, "Joining Date", bold);
        addHeaderCell(table, "Description", bold);
        addHeaderCell(table, "Service Charges", bold);

        addCell(table, "Consultant", body, Element.ALIGN_CENTER, Color.WHITE);
        addCell(table, displayDate(serviceDate), body, Element.ALIGN_CENTER, Color.WHITE);
        addCell(table, "Consultancy services", body, Element.ALIGN_CENTER, Color.WHITE);
        addCell(table, "₹" + money(invoice.getAmount()), body, Element.ALIGN_RIGHT, Color.WHITE);

        if ("igst".equals(invoice.getGstType())) {
            addTaxRow(table, "IGST (18%)", invoice.getIgst(), body);
        } else if ("exclusive".equals(invoice.getGstType())
                || "inclusive".equals(invoice.getGstType())) {
            addTaxRow(table, "CGST (9%)", invoice.getCgst(), body);
            addTaxRow(table, "SGST (9%)", invoice.getSgst(), body);
        }

        PdfPCell totalLabel = new PdfPCell(new Phrase("Total Amount", bold));
        totalLabel.setColspan(3);
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalLabel.setBackgroundColor(new Color(194, 240, 240));
        totalLabel.setPadding(8);
        table.addCell(totalLabel);
        addCell(table, "₹" + money(invoice.getTotalAmount()), bold,
                Element.ALIGN_RIGHT, new Color(194, 240, 240));

        PdfPCell wordsCell = new PdfPCell(new Phrase(
                "(In Words: " + amountInWords(invoice.getTotalAmount()) + " Only)", bold
        ));
        wordsCell.setColspan(4);
        wordsCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        wordsCell.setPadding(9);
        table.addCell(wordsCell);
        document.add(table);
    }

    private void addTaxRow(PdfPTable table, String label, BigDecimal amount, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setColspan(3);
        labelCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        labelCell.setPadding(7);
        table.addCell(labelCell);
        addCell(table, "₹" + money(amount), font, Element.ALIGN_RIGHT, Color.WHITE);
    }

    private void addFooter(Document document, Font body, Font small)
            throws DocumentException {
        addRule(document, new Color(153, 222, 165));
        PdfPTable contact = new PdfPTable(new float[]{1, 1, 1});
        contact.setWidthPercentage(100);
        addCell(contact, "+91-9764385996", body, Element.ALIGN_LEFT, Color.WHITE, false);
        addCell(contact, "www.shulventures.com", body, Element.ALIGN_CENTER, Color.WHITE, false);
        addCell(contact, "support@shulventures.com", body, Element.ALIGN_RIGHT, Color.WHITE, false);
        document.add(contact);

        Paragraph address = new Paragraph(
                "Shree Ganesh Apartment, Ring Road, Plot No. 32, above Rajat Wines, "
                        + "Khamla, Nagpur, Maharashtra 440015",
                small
        );
        address.setAlignment(Element.ALIGN_CENTER);
        address.setSpacingBefore(8);
        document.add(address);

        Paragraph cin = new Paragraph("CIN: U74999MH2018PTC308404", small);
        cin.setAlignment(Element.ALIGN_CENTER);
        cin.setSpacingBefore(3);
        document.add(cin);
        addRule(document, new Color(153, 222, 165));
    }

    private void addRule(Document document, Color color) throws DocumentException {
        PdfPTable rule = new PdfPTable(1);
        rule.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase(Chunk.NEWLINE));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setFixedHeight(3);
        cell.setBackgroundColor(color);
        rule.addCell(cell);
        document.add(rule);
    }

    private void addHeaderCell(PdfPTable table, String value, Font font) {
        addCell(table, value, font, Element.ALIGN_CENTER, new Color(0, 85, 128));
    }

    private void addCell(
            PdfPTable table,
            String value,
            Font font,
            int alignment,
            Color background
    ) {
        addCell(table, value, font, alignment, background, true);
    }

    private void addCell(
            PdfPTable table,
            String value,
            Font font,
            int alignment,
            Color background,
            boolean border
    ) {
        PdfPCell cell = new PdfPCell(new Phrase(safe(value), font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(7);
        cell.setBackgroundColor(background);
        if (!border) cell.setBorder(Rectangle.NO_BORDER);
        if (background.equals(new Color(0, 85, 128))) {
            cell.setPhrase(new Phrase(safe(value), new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE)));
        }
        table.addCell(cell);
    }

    private byte[] loadLogo() throws IOException {
        ClassPathResource resource = new ClassPathResource("assets/shul-logo.png");
        try (var input = resource.getInputStream()) {
            return input.readAllBytes();
        }
    }

    private String displayDate(LocalDate date) {
        return date == null ? "—" : DISPLAY_DATE.format(date);
    }

    private String money(BigDecimal amount) {
        return (amount == null ? BigDecimal.ZERO : amount).setScale(2).toPlainString();
    }

    private String safe(Object value) {
        return value == null ? "" : value.toString();
    }

    private String amountInWords(BigDecimal amount) {
        BigDecimal value = (amount == null ? BigDecimal.ZERO : amount)
                .setScale(2, RoundingMode.HALF_UP);
        BigInteger rupees = value.toBigInteger();
        int paise = value.remainder(BigDecimal.ONE).movePointRight(2).abs().intValue();
        String words = "Rupees " + indianNumberWords(rupees);
        if (paise > 0) words += " And " + underThousand(paise) + " Paise";
        return words;
    }

    private String indianNumberWords(BigInteger number) {
        long value = number.longValue();
        if (value == 0) return "Zero";
        StringBuilder result = new StringBuilder();
        long crore = value / 10_000_000;
        value %= 10_000_000;
        long lakh = value / 100_000;
        value %= 100_000;
        long thousand = value / 1_000;
        value %= 1_000;
        if (crore > 0) result.append(underThousand((int) crore)).append(" Crore ");
        if (lakh > 0) result.append(underThousand((int) lakh)).append(" Lakh ");
        if (thousand > 0) result.append(underThousand((int) thousand)).append(" Thousand ");
        if (value > 0) result.append(underThousand((int) value));
        return result.toString().trim();
    }

    private String underThousand(int number) {
        String[] ones = {"Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"};
        String[] teens = {"Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
        String[] tens = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
        StringBuilder words = new StringBuilder();
        if (number >= 100) {
            words.append(ones[number / 100]).append(" Hundred");
            number %= 100;
            if (number > 0) words.append(" and ");
        }
        if (number >= 20) {
            words.append(tens[number / 10]);
            if (number % 10 > 0) words.append(" ").append(ones[number % 10]);
        } else if (number >= 10) {
            words.append(teens[number - 10]);
        } else if (number > 0) {
            words.append(ones[number]);
        }
        return words.toString();
    }
}
