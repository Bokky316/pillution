package com.javalab.student.service;

import com.javalab.student.dto.PageRequestDTO;
import com.javalab.student.dto.PageResponseDTO;
import com.javalab.student.dto.StudentDto;
import com.javalab.student.dto.StudentFormDto;

public interface StudentService {

    StudentDto createStudent(StudentFormDto studentFormDto);

    StudentDto updateStudent(Long id, StudentFormDto studentFormDto);

    StudentDto getStudentById(Long id);

    public PageResponseDTO<StudentDto> getAllStudents(PageRequestDTO pageRequestDTO);

    void deleteStudent(Long id);
}
