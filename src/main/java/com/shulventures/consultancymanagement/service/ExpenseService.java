package com.shulventures.consultancymanagement.service;

import com.shulventures.consultancymanagement.dto.expense.CreateExpenseRequest;
import com.shulventures.consultancymanagement.dto.expense.ExpenseResponse;
import com.shulventures.consultancymanagement.entity.Expense;
import com.shulventures.consultancymanagement.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Transactional
    public ExpenseResponse create(CreateExpenseRequest request) {
        Expense expense = new Expense();
        expense.setExpenses(request.expenses().trim());
        expense.setServices(request.services().trim());
        expense.setAmount(request.amount().toPlainString());
        expense.setDate(request.date());
        expense.setPaymentGateway(request.paymentGateway());
        expense.setBranch(request.branch());

        return toResponse(expenseRepository.save(expense));
    }

    private ExpenseResponse toResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getExpenses(),
                expense.getServices(),
                expense.getAmount(),
                expense.getDate(),
                expense.getPaymentGateway(),
                expense.getBranch()
        );
    }


    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAll(
            LocalDate fromDate,
            LocalDate endDate
    ) {
        List<Expense> expenses;

        if (fromDate == null && endDate == null) {
            expenses = expenseRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "date")
            );
        } else {
            if (fromDate == null || endDate == null) {
                throw new IllegalArgumentException(
                        "Select both a start date and an end date."
                );
            }

            if (fromDate.isAfter(endDate)) {
                throw new IllegalArgumentException(
                        "The start date must be on or before the end date."
                );
            }

            expenses = expenseRepository.findByDateBetweenOrderByDateDesc(
                    fromDate,
                    endDate
            );
        }

        return expenses.stream()
                .map(this::toResponse)
                .toList();
    }
}
