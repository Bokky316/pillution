package com.javalab.student.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
@Builder
public class StudentDto {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private int age;
}
