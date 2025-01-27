package com.javalab.student.service;

import com.javalab.student.dto.PageRequestDTO;
import com.javalab.student.dto.PageResponseDTO;
import com.javalab.student.dto.StudentDto;
import com.javalab.student.dto.StudentFormDto;
import com.javalab.student.entity.Student;
import com.javalab.student.repository.StudentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final ModelMapper modelMapper;

    public StudentServiceImpl(StudentRepository studentRepository, ModelMapper modelMapper) {
        this.studentRepository = studentRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public StudentDto createStudent(StudentFormDto studentFormDto) {
        Student student = modelMapper.map(studentFormDto, Student.class);
        Student savedStudent = studentRepository.save(student);
        return modelMapper.map(savedStudent, StudentDto.class);
    }

    @Override
    public StudentDto updateStudent(Long id, StudentFormDto studentFormDto) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // DTO 데이터를 엔티티로 매핑
        modelMapper.map(studentFormDto, existingStudent);

        Student updatedStudent = studentRepository.save(existingStudent);
        return modelMapper.map(updatedStudent, StudentDto.class);
    }

    @Override
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return modelMapper.map(student, StudentDto.class);
    }

//    @Override
//    public List<StudentDto> getAllStudents() {
//        return studentRepository.findAll().stream()
//                .map(student -> modelMapper.map(student, StudentDto.class))
//                .collect(Collectors.toList());
//    }
    public PageResponseDTO<StudentDto> getAllStudents(PageRequestDTO pageRequestDTO) {
        // Pageable 생성
        Pageable pageable = pageRequestDTO.getPageable("id");

        // 데이터 조회 (Page 객체 사용)
        Page<Student> result = studentRepository.findAll(pageable);

        // Page -> PageResponseDTO 변환
        List<StudentDto> dtoList = result.getContent().stream()
                .map(this::convertEntityToDto)
                .collect(Collectors.toList());

        return PageResponseDTO.<StudentDto>builder()
                .dtoList(dtoList)
                .total((int) result.getTotalElements())
                .pageRequestDTO(pageRequestDTO)
                .build();
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    /**
     * DB에서 읽어온 Student 엔티티를 StudentDto로 변환해서 컨트롤러로 반환
     * @param student
     * @return
     */
    private StudentDto convertEntityToDto(Student student) {
        return StudentDto.builder()
                .id(student.getId())
                .name(student.getName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .address(student.getAddress())
                .age(student.getAge())
                .build();
    }

}
