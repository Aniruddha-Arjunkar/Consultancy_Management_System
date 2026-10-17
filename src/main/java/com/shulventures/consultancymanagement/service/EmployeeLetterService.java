package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.entity.Employee;
import com.shulventures.consultancymanagement.repository.EmployeeRepository;
import com.shulventures.consultancymanagement.security.BranchPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;
import java.util.Set;

import org.openpdf.text.Chunk;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.Image;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.BaseFont;
import org.openpdf.text.pdf.ColumnText;
import org.openpdf.text.pdf.PdfContentByte;
import org.openpdf.text.pdf.PdfPageEventHelper;
import org.openpdf.text.pdf.PdfTemplate;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


@Service
@RequiredArgsConstructor
public class EmployeeLetterService {

    private static final Set<String> SUPPORTED_LETTER_TYPES = Set.of(
            "offer",
            "appointment",
            "relieving",
            "experience",
            "internship",
            "web_developer_internship"
    );

    private final EmployeeRepository employeeRepository;
    private final BranchPermissionService branchPermissionService;

    public Employee getEmployeeForLetter(
            Long employeeId,
            String letterType,
            Authentication authentication
    ) {
        String normalizedType = letterType == null
                ? ""
                : letterType.trim().toLowerCase(Locale.ROOT);

        if (!SUPPORTED_LETTER_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException("Select a valid letter type.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found."
                ));

        if (!branchPermissionService.hasBranchAccess(
                authentication,
                employee.getBranch()
        )) {
            throw new AccessDeniedException(
                    "You cannot generate a letter for an employee from this branch."
            );
        }

        return employee;
    }

//====================================================================================

    public byte[] generateLetterPdf(
            Long employeeId,
            String letterType,
            Authentication authentication
    ) {
        Employee employee = getEmployeeForLetter(
                employeeId,
                letterType,
                authentication
        );

        String body = buildLetterBody(employee, letterType);

        return createPdf(employee, letterType, body);
    }

    private String buildLetterBody(Employee employee, String letterType) {
        return switch (letterType.trim().toLowerCase(Locale.ROOT)) {
            case "offer" -> buildOfferBody(employee);
            case "appointment" -> buildAppointmentBody(employee);
            case "relieving" -> buildRelievingBody(employee);
            case "experience" -> buildExperienceBody(employee);
            case "internship" -> buildInternshipBody(employee);
            case "web_developer_internship" ->
                    buildWebDeveloperInternshipBody(employee);
            default -> throw new IllegalArgumentException(
                    "Select a valid letter type."
            );
        };
    }


//====================================================================================

    public byte[] createPdf(
            Employee employee,
            String letterType,
            String body
    ) {
        String type = letterType.trim().toLowerCase(Locale.ROOT);

        Document document = new Document(
                PageSize.A4,
                42,
                42,
                150,
                50
        );

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try {
            byte[] letterhead = loadLetterhead();

            PdfWriter writer = PdfWriter.getInstance(document, output);
            PdfTemplate totalPages =
                    writer.getDirectContent().createTemplate(40, 12);
            writer.setPageEvent(new LetterheadFooter(letterhead, totalPages));

            document.open();

            Font normalFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
            Font boldFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font headingFont = new Font(Font.HELVETICA, 14, Font.BOLD);

            String reference = "SHUL/EMP/"
                    + type.substring(0, Math.min(3, type.length())).toUpperCase(Locale.ROOT)
                    + "/"
                    + String.format("%03d", employee.getId());

            Paragraph refAndDate = new Paragraph();
            refAndDate.add(new Phrase("Ref - " + reference, normalFont));
            refAndDate.add(new Phrase(
                    "                                           Date: "
                            + getLetterDate(employee, type),
                    normalFont
            ));
            refAndDate.setSpacingAfter(14);
            document.add(refAndDate);

            if (!type.equals("internship") && !type.equals("experience")) {
                document.add(new Paragraph("To,", normalFont));

                String title = employee.getTitle() == null
                        || employee.getTitle().isBlank()
                        ? "Ms."
                        : employee.getTitle();

                document.add(new Paragraph(
                        title + " " + safe(employee.getCustName()),
                        boldFont
                ));

                if (employee.getCustAddress1() != null
                        && !employee.getCustAddress1().isBlank()) {
                    addBody(document, employee.getCustAddress1(), normalFont);
                }

                document.add(Chunk.NEWLINE);
            }

            String heading = switch (type) {
                case "internship" -> "INTERNSHIP COMPLETION CERTIFICATE";
                case "experience" -> "TO WHOMSOEVER IT MAY CONCERN";
                case "relieving" -> "Relieving Letter";
                default -> "";
            };

            if (!heading.isBlank()) {
                Paragraph headingParagraph = new Paragraph(heading, headingFont);
                headingParagraph.setAlignment(Element.ALIGN_CENTER);
                headingParagraph.setSpacingAfter(12);
                document.add(headingParagraph);
            }

            if (type.equals("offer")) {
                document.add(new Paragraph(
                        "Sub: Offer for the post of - "
                                + safe(employee.getDesignation()),
                        boldFont
                ));
                document.add(Chunk.NEWLINE);
            } else if (type.equals("appointment")) {
                document.add(new Paragraph(
                        "Subject: Appointment for post of "
                                + safe(employee.getDesignation()),
                        boldFont
                ));
                document.add(Chunk.NEWLINE);
            }

            addBody(document, body, normalFont);

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("For Shul Ventures Pvt. Ltd.", normalFont));
            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("Atul Urkude", normalFont));
            document.add(new Paragraph("Director", normalFont));

            document.close();
            return output.toByteArray();

        } catch (IOException | DocumentException exception) {
            throw new IllegalStateException(
                    "Could not generate the employee letter PDF.",
                    exception
            );
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
    }

//=======================================================================================

    private byte[] loadLetterhead() throws IOException {
        ClassPathResource resource =
                new ClassPathResource("assets/letterhead.png");

        try (InputStream input = resource.getInputStream()) {
            return input.readAllBytes();
        }
    }

    private String getLetterDate(Employee employee, String letterType) {
        LocalDate date = switch (letterType) {
            case "offer" -> employee.getJoiningDate();
            case "appointment" -> employee.getJoiningDate() == null
                    ? null
                    : employee.getJoiningDate().plusDays(7);
            case "relieving", "experience", "internship",
                 "web_developer_internship" -> employee.getReleaseDate();
            default -> null;
        };

        if (date == null) {
            date = LocalDate.now();
        }

        int day = date.getDayOfMonth();
        String suffix = (day >= 11 && day <= 13)
                ? "th"
                : switch (day % 10) {
            case 1 -> "st";
            case 2 -> "nd";
            case 3 -> "rd";
            default -> "th";
        };

        return day + suffix + " "
                + date.format(DateTimeFormatter.ofPattern(
                "MMMM, yyyy",
                Locale.ENGLISH
        ));
    }

    private void addBody(
            Document document,
            String text,
            Font font
    ) throws DocumentException {
        if (text == null || text.isBlank()) {
            return;
        }

        for (String line : text.split("\\R", -1)) {
            if (line.isBlank()) {
                document.add(Chunk.NEWLINE);
                continue;
            }

//          Paragraph paragraph = new Paragraph(line, font);
            Font lineFont = line.matches("^\\d+\\. .+")
                    ? new Font(Font.HELVETICA, 11, Font.BOLD | Font.UNDERLINE)
                    : font;

            Paragraph paragraph = new Paragraph(line, lineFont);
            paragraph.setLeading(0, 1.35f);
            paragraph.setSpacingAfter(3);
            document.add(paragraph);
        }
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private static class LetterheadFooter extends PdfPageEventHelper {
        private final byte[] letterhead;
        private final PdfTemplate totalPages;
        private final BaseFont footerFont;

        private LetterheadFooter(byte[] letterhead, PdfTemplate totalPages)
                throws DocumentException, IOException {
            this.letterhead = letterhead;
            this.totalPages = totalPages;
            this.footerFont = BaseFont.createFont(
                    BaseFont.HELVETICA,
                    BaseFont.WINANSI,
                    BaseFont.NOT_EMBEDDED
            );
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                Image image = Image.getInstance(letterhead);
                image.scaleToFit(PageSize.A4.getWidth(), 112);
                image.setAbsolutePosition(
                        0,
                        PageSize.A4.getHeight() - image.getScaledHeight()
                );
                writer.getDirectContentUnder().addImage(image);

                PdfContentByte canvas = writer.getDirectContent();
                float centerX = (document.left() + document.right()) / 2;

                ColumnText.showTextAligned(
                        canvas,
                        Element.ALIGN_CENTER,
                        new Phrase("Page " + writer.getPageNumber() + " / "),
                        centerX - 12,
                        22,
                        0
                );

                canvas.addTemplate(totalPages, centerX + 13, 18);

            } catch (Exception exception) {
                throw new IllegalStateException(
                        "Could not add the letterhead to the PDF.",
                        exception
                );
            }
        }

        @Override
        public void onCloseDocument(PdfWriter writer, Document document) {
            totalPages.beginText();
            totalPages.setFontAndSize(footerFont, 9);
            totalPages.setTextMatrix(0, 0);
            totalPages.showText(String.valueOf(writer.getPageNumber() - 1));
            totalPages.endText();
        }
    }

//=====================================================================================

    private String buildOfferBody(Employee employee) {
        String title = employee.getTitle() == null
                || employee.getTitle().isBlank()
                ? "Ms."
                : employee.getTitle();

        String name = safe(employee.getCustName());
        String designation = safe(employee.getDesignation());

        String salary = employee.getPackageName() == null
                || employee.getPackageName().isBlank()
                ? "0"
                : employee.getPackageName().trim();

        LocalDate reportingDate = employee.getJoiningDate() == null
                ? LocalDate.now()
                : employee.getJoiningDate();

        return "Dear " + title + " " + name + ",\n\n"
                + "This has reference to your application for the above post "
                + "and the subsequent interview we had with you.\n\n"
                + "In this regard, we are pleased to offer you the position of \""
                + designation
                + "\" for Shul Ventures Pvt. Ltd., Nagpur.\n\n"
                + "Your Monthly pay scale as mutually discussed and agreed will be INR "
                + salary
                + "/- per month + 5% incentives on revenue generated by you.\n\n"
                + "Your reporting date is " + formatEmployeeDate(reportingDate)
                + " at 10.00 a.m. at office.\n\n"
                + "Best wishes,";
    }



//=========================================================================================

    private String buildAppointmentBody(Employee employee) {
        String title = employee.getTitle() == null
                || employee.getTitle().isBlank()
                ? "Ms."
                : employee.getTitle();

        String name = safe(employee.getCustName());
        String designation = safe(employee.getDesignation());

        LocalDate joiningDate = employee.getJoiningDate() == null
                ? LocalDate.now()
                : employee.getJoiningDate();

        String joiningDateText = formatEmployeeDate(joiningDate);

        return """
            Dear %s %s,

            We are pleased to offer you the position of %s with Shul Ventures Pvt. Ltd. on the following terms and conditions:

            1. Commencement of Employment
            Your employment will be effective from %s.

            2. Job Title
            Your job title will be %s and you will report to the concerned reporting authority assigned by the management.

            3. Employee Agreement
            - Ms. %s on joining the company from %s, undertakes to stay in employment with Shul Ventures Pvt. Ltd. for a minimum period of 6 Months (excluding notice period). Hence excluding the notice period, the minimum duration of employment would be 6 Months.

            - Ms. %s undertakes not to leave the service of the company, for any whatsoever reason for a minimum period of 6 Months from the date of joining the services of the company.

            - In case %s for any reason leaves the services of the company before the said period of 6 Months, then Shul Ventures Pvt. Ltd. will not provide Experience Letter & Relieving Letter to Ms. %s under any circumstances.

            4. Salary
            - Employees are paid Monthly on or about 4th day of each Month. If the regularly scheduled payroll date falls on Sunday, the Shul will attempt to deliver Salary on Monday. If the payroll date falls on Holiday, the Shul will attempt to deliver Salary on the next working day after the holiday.

            - All reasonable expenses arising out of employment shall be reimbursed assuming that the same have been authorized prior to be incurred by appropriate receipts.

            5. Hours of Work
            The workweek is generally from Monday through Saturday, with normal operating hours from 10:00 A.M. to 6:30 P.M. with 30 Minutes for lunch.

            6. Attendance & Punctuality
            It is important for you to report to work on time and to avoid unnecessary absences. The SHUL recognizes that illness or other circumstances beyond your control may cause you to be absent from work from time to time. However, frequent absenteeism or tardiness may result in disciplinary action, up to and including discharge.

            You are expected to report at your workstation at 10:00 AM on each day. On delayed, you must need to do overtime and cover delayed minutes before leaving the office.

            Regular delays in reporting to work will result in disciplinary action up to and including discharge from your employment.

            7. Leave / Holidays
            - The Employee is entitled to take 12 casual Leaves in a Year [Only 1 in a Month].

            In the event that Employee is absent from work due to sickness or injury for more than 3 consecutive days Employee must need to submit Medical Certificate from their doctor.

            In the event that Employee is absent from work without giving any prior intimation, it will result in disciplinary action up to and including termination of the employment.

            8. Orientation & Training
            To help you become familiar with the SHUL and our way of doing things, the SHUL will provide an orientation and training session within the first few days after you begin work. Some of the content of the session will depend in large part on the nature of your responsibilities, while other parts will be applicable to all employees. In addition, the SHUL may periodically offer additional training or educational programs. Some programs may be voluntary, while others will be required.

            9. Performance of Duties
            The Employee agrees that during the Employment Period, he/she shall devote his/her full business time to the business affairs of the SHUL and shall perform the duties assigned to him/her faithfully and efficiently, and shall endeavor, to the best of his/her abilities to achieve the goals and adhere to the parameters set by the SHUL.

            10. Obligation of the Employee
            - Upon execution of joining, the Employee shall not engage in any sort of theft, fraud, misrepresentation or any other illegal act neither in the employment space nor outside the premise of employment. If he/she shall do so, the SHUL shall not be liable for such an act done at his own risk.

            - The Employee further promises to never engage in any theft of the Employer's property or attempt to defraud the Employer in any manner.

            - The Employee shall always ensure that his/her conduct is in accordance with all the rules, regulations and policies of the SHUL as notified from time to time.

            - The Employee shall not take up part-time or full-time employment or consultation with any other party or be involved in any other business during the term of his/her employment with the SHUL.

            11. Competing Businesses
            During the part of organization the Employee agrees not to engage in any employment, consulting, or other activity involving that competes with the business, proposed business or business interests of the Employer, without the Employer's prior written consent.

            12. Confidentiality
            The Employee acknowledges and agrees that in the course of performing your duties, you must maintain the confidentiality of business strategies and clientele information and will not violate the policies. In the event of disclosure of any such information to a Person, Firm or Organization, it will straightly result into termination of your employment.

            The Employer owns any intellectual property created by the Employee during the course of the employment, or in relation to a certain field, and he shall thereon have all the necessary rights to retain it. After termination of employment, Employee shall not impose any rights on the intellectual property created. Any source code, software or other intellectual property developed, including but not limited to website design or functionality that was created by the employee, during the course of employment, shall belong to the Employer.

            13. Leaving the Company
            If you wish to resign your employment with the SHUL, we request that you notify your Manager of your anticipated departure date at least 1 Month in advance. This notice should be in the form of a written mail.

            14. Acceptance of Offer
            Please confirm your acceptance of this Contract of Employment by signing and returning the duplicate copy.

            We welcome you, and look forward to receiving your acceptance and to working with you.
            """.formatted(
                title,
                name,
                designation,
                joiningDateText,
                designation,
                name,
                joiningDateText,
                name,
                name,
                name,
                name
        );
    }

//=================================================================================

    private String formatEmployeeDate(LocalDate date) {
        int day = date.getDayOfMonth();

        String suffix = (day >= 11 && day <= 13)
                ? "th"
                : switch (day % 10) {
            case 1 -> "st";
            case 2 -> "nd";
            case 3 -> "rd";
            default -> "th";
        };

        return day + suffix + " "
                + date.format(DateTimeFormatter.ofPattern(
                "MMMM, yyyy",
                Locale.ENGLISH
        ));
    }

//=============================================================================

    private String buildRelievingBody(Employee employee) {
        String name = safe(employee.getCustName());

        String resignationDate = formatEmployeeDate(
                employee.getResignationDate() == null
                        ? LocalDate.now()
                        : employee.getResignationDate()
        );

        String releaseDate = formatEmployeeDate(
                employee.getReleaseDate() == null
                        ? LocalDate.now()
                        : employee.getReleaseDate()
        );

        String joiningDate = formatEmployeeDate(
                employee.getJoiningDate() == null
                        ? LocalDate.now()
                        : employee.getJoiningDate()
        );

        String designation = safe(employee.getDesignation());

        return "Dear " + name + ",\n\n"
                + "This is to formally inform you that your resignation dated "
                + resignationDate
                + " has been accepted, and your last working day with Shul Ventures Pvt. Ltd. was "
                + releaseDate + ".\n\n"
                + "We would like to confirm that you have been relieved from your duties as \""
                + designation
                + "\" in Shul Ventures Pvt. Ltd. You were employed with us as \""
                + designation + "\" from " + joiningDate + " to " + releaseDate + ".\n\n"
                + "During your tenure, you have successfully completed your assigned "
                + "responsibilities and contributed to the organization. We confirm that "
                + "you have completed all the required formalities and handed over your "
                + "duties and responsibilities.\n\n"
                + "We appreciate your efforts and wish you all the best for your future endeavor.\n\n"
                + "Best wishes,";
    }

//=====================================================================================

    private String buildExperienceBody(Employee employee) {
        String title = employee.getTitle() == null
                || employee.getTitle().isBlank()
                ? "Ms."
                : employee.getTitle();

        String name = safe(employee.getCustName());
        String designation = safe(employee.getDesignation());

        String joiningDate = formatEmployeeDate(
                employee.getJoiningDate() == null
                        ? LocalDate.now()
                        : employee.getJoiningDate()
        );

        String releaseDate = formatEmployeeDate(
                employee.getReleaseDate() == null
                        ? LocalDate.now()
                        : employee.getReleaseDate()
        );

        return "This is to certify that " + title + " " + name
                + " was employed with our organization Shul Ventures Pvt. Ltd. as an \""
                + designation + "\" from " + joiningDate + " to " + releaseDate + ".\n\n"
                + "During her tenure with us, " + title + " " + name
                + " demonstrated professionalism, dedication and commitment towards her "
                + "responsibilities. She was actively involved in managing her assigned "
                + "responsibilities and consistently exhibited strong communication, "
                + "coordination and organizational skills.\n\n"
                + "She is an efficient and assiduous professional with exemplary conduct. "
                + "Throughout her association with the organization, she showed adequate "
                + "leadership qualities, maintained an excellent track record, and her "
                + "positive attitude contributed to her team members and the organization too.\n\n"
                + "Her sincere approach to work and continuous pursuit of professional "
                + "excellence were truly commendable.\n\n"
                + "We appreciate her sincere work, dedication and contributions to the "
                + "organization and wish her continued success in her future endeavors.\n\n"
                + "Best wishes,";
    }


//=====================================================================================

    private String buildInternshipBody(Employee employee) {
        String title = employee.getTitle() == null
                || employee.getTitle().isBlank()
                ? "Ms."
                : employee.getTitle();

        String name = safe(employee.getCustName());

        String startDate = formatEmployeeDate(
                employee.getJoiningDate() == null
                        ? LocalDate.now()
                        : employee.getJoiningDate()
        );

        String endDate = formatEmployeeDate(
                employee.getReleaseDate() == null
                        ? LocalDate.now()
                        : employee.getReleaseDate()
        );

        return "This is to certify that " + title + " " + name
                + " has successfully completed her internship with our organization "
                + "Shul Ventures Pvt. Ltd. as a Human Resource Intern from "
                + startDate + " to " + endDate + ".\n\n"
                + "During her tenure, she gained valuable hands-on experience in "
                + "recruitment, sourcing, candidate analysis, and client coordination. "
                + "She demonstrated a strong understanding of HR processes and "
                + "consistently delivered quality work.\n\n"
                + "Throughout her internship, " + title + " " + name
                + " exceeded expectations through her performance, dedication, and "
                + "eagerness to learn. She effectively carried out her responsibilities.\n\n"
                + "She has successfully completed her industrial training in the field "
                + "of Human Resource Management under the guidance of Shul Ventures Pvt. Ltd.\n\n"
                + title + " " + name
                + " has been a sincere, efficient, and cooperative team member. We "
                + "appreciate her contributions to the organization.\n\n"
                + "We wish her continued success in all her future endeavors.\n\n"
                + "Best Wishes,";
    }


//=========================================================================================

    private String buildWebDeveloperInternshipBody(Employee employee) {
        String title = employee.getTitle() == null
                || employee.getTitle().isBlank()
                ? "Ms."
                : employee.getTitle();

        String name = safe(employee.getCustName());

        String startDate = formatEmployeeDate(
                employee.getJoiningDate() == null
                        ? LocalDate.now()
                        : employee.getJoiningDate()
        );

        String endDate = formatEmployeeDate(
                employee.getReleaseDate() == null
                        ? LocalDate.now()
                        : employee.getReleaseDate()
        );

        return "This is to certify that " + title + " " + name
                + " has worked as an Industrial Intern at the position of Intern - "
                + "Web Development with our organization Shul Ventures Pvt. Ltd. from "
                + startDate + " to " + endDate + ".\n\n"
                + "During her internship tenure, she displayed a professional attitude, "
                + "sincerity, and a strong willingness to learn. She was involved in "
                + "development activities and effectively supported the project requirements.\n\n"
                + "Her key responsibilities included:\n"
                + "- Planning and requirement analysis during the initial project phases.\n"
                + "- Front-end development using HTML, CSS, and JavaScript.\n"
                + "- Assisting the development team in back-end programming using PHP.\n"
                + "- Managing and handling databases using MySQL.\n"
                + "- Contributing to various phases of the software development lifecycle.\n"
                + "- Ensuring design and development compliance with project specifications.\n"
                + "- Applying problem-solving and analytical skills to resolve technical challenges.\n"
                + "- Designing and developing features and modules for web-based applications.\n"
                + "- Demonstrating a results-oriented approach while meeting assigned timelines.\n\n"
                + "Throughout her internship " + title + " " + name
                + " showed adequate leadership qualities that contributed to her team "
                + "members and the organization too.\n\n"
                + "We wish her all the best in her future endeavors.\n\n"
                + "Best wishes,";
    }


}