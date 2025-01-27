package com.javalab.student.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StudentFormDto {

    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name must be at most 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^010-\\d{4}-\\d{4}$",
            message = "Phone number should be in the format 010-XXXX-XXXX"
    )
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 100, message = "Address must be at most 100 characters")
    private String address;

    @Positive(message = "Age must be a positive number")
    private int age;
}
