package com.shulventures.consultancymanagement.controller;

import com.shulventures.consultancymanagement.dto.expense.CreateExpenseRequest;
import com.shulventures.consultancymanagement.dto.expense.ExpenseResponse;
import com.shulventures.consultancymanagement.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'EXPENSES_ADD')"
    )
    public ExpenseResponse createExpense(
            @Valid @RequestBody CreateExpenseRequest request
    ) {
        return expenseService.create(request);
    }



    @GetMapping
    @PreAuthorize(
            "@permissionService.hasPage(authentication, 'ACCOUNTS', 'EXPENSES_VIEW')"
    )
    public List<ExpenseResponse> getExpenses(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return expenseService.getAll(fromDate, endDate);
    }
}