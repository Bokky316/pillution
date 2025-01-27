package com.javalab.student.controller;

import com.javalab.student.dto.PageRequestDTO;
import com.javalab.student.dto.PageResponseDTO;
import com.javalab.student.dto.StudentDto;
import com.javalab.student.dto.StudentFormDto;
import com.javalab.student.service.StudentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@Slf4j
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // 학생 등록
    @PostMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDto> createStudent(@RequestBody @Valid StudentFormDto studentFormDto) {
        return ResponseEntity.ok(studentService.createStudent(studentFormDto));
    }

    // 학생 수정
    @PutMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable("id") Long id, @RequestBody @Valid StudentFormDto studentFormDto) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentFormDto));
    }

    // 학생 정보 조회
    @GetMapping("/{id}")
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable("id") Long id) {
        log.info("학생 정보 조회 : " + id);
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // 페이징 처리된 학생 목록 조회
    @GetMapping
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<PageResponseDTO<StudentDto>> getAllStudents(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        PageRequestDTO pageRequestDTO = PageRequestDTO.builder()
                .page(page)
                .size(size)
                .build();
        log.info("페이지 : " + pageRequestDTO.getPage() + " " + pageRequestDTO.getSize());

        PageResponseDTO<StudentDto> responseDTO = studentService.getAllStudents(pageRequestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    // 학생 삭제
    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable("id") Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
