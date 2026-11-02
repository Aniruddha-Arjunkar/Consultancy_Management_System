package com.shulventures.consultancymanagement.repository;

import com.shulventures.consultancymanagement.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByDateBetweenOrderByDateDesc(
            LocalDate fromDate,
            LocalDate endDate
    );
}