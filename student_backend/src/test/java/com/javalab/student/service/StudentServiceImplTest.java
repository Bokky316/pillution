package com.javalab.student.service;

import com.javalab.student.dto.StudentDto;
import com.javalab.student.dto.StudentFormDto;
import com.javalab.student.entity.Student;
import com.javalab.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Mockito 활성화
class StudentServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private StudentServiceImpl studentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("학생 생성 테스트")
    void createStudentTest() {
        // Given, 화면에서 전달되는 데이터로 가정
        StudentFormDto studentFormDto = new StudentFormDto();
        studentFormDto.setName("John Doe");
        studentFormDto.setEmail("john.doe@example.com");
        // 생성된 학생 객체를 반환하도록 설정
        Student savedStudent = new Student();
        savedStudent.setId(1L); // 저장된 학생의 ID를 1로 설정
        // modelMapper가 studentFormDto를 student로 변환하도록 설정
        when(modelMapper.map(studentFormDto, Student.class)).thenReturn(savedStudent);
        when(studentRepository.save(savedStudent)).thenReturn(savedStudent);

        // When
        StudentDto result = studentService.createStudent(studentFormDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(studentRepository).save(savedStudent);
    }

    @Test
    @DisplayName("학생 조회 테스트")
    void getStudentByIdTest() {
        // Given
        Long id = 1L;
        Student student = new Student();
        student.setId(id);
        when(studentRepository.findById(id)).thenReturn(Optional.of(student));

        // When
        StudentDto result = studentService.getStudentById(id);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        verify(studentRepository).findById(id);
    }

//    @Test
//    @DisplayName("학생 목록 조회 테스트")
//    void getAllStudentsTest() {
//        // Given
//        when(studentRepository.findAll()).thenReturn(List.of(new Student(), new Student()));
//
//        // When
//        List<StudentDto> result = studentService.getAllStudents();
//
//        // Then
//        assertThat(result).hasSize(2);
//        verify(studentRepository).findAll();
//    }

    @Test
    @DisplayName("학생 삭제 테스트")
    void deleteStudentTest() {
        // Given
        Long id = 1L;
        doNothing().when(studentRepository).deleteById(id);

        // When
        studentService.deleteStudent(id);

        // Then
        verify(studentRepository).deleteById(id);
    }
}
