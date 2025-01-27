package com.javalab.student.repository;

import com.javalab.student.entity.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class StudentRepositoryTest {

    @Autowired
    private StudentRepository studentRepository;

    /**
     * 학생 저장 메소드
     */
    private Student createStudent(String name, String email, String phone, String address, int age) {
        return Student.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .age(age)
                .build();
    }

    /**
     * 학생 100명을 생성하는 메소드
     */
    private List<Student> createMultipleStudents() {
        List<Student> students = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            students.add(createStudent(
                    "Student " + i,
                    "student" + i + "@example.com",
                    "010-1234-567" + i,
                    "Address " + i,
                    1 + i
            ));
        }
        return students;
    }

    @Test
    @DisplayName("학생 저장 테스트")
    //@Commit
    void saveStudentTest() {
        // Given
        Student student = createStudent("hong", "hong@example.com", "010-1234-5678", "Address 1", 25);

        // When
        Student savedStudent = studentRepository.save(student);

        // Then
        assertThat(savedStudent).isNotNull();
        assertThat(savedStudent.getId()).isNotNull();
        assertThat(savedStudent.getName()).isEqualTo("hong");
        assertThat(savedStudent.getEmail()).isEqualTo("hong@example.com");
    }

    @Test
    @DisplayName("학생 목록 생성 및 조회 테스트")
    @Commit
    void findAllStudentsTest() {
        // Given
        List<Student> students = createMultipleStudents();
        studentRepository.saveAll(students);

        // When
        Iterable<Student> retrievedStudents = studentRepository.findAll();

        // Then
        assertThat(retrievedStudents).hasSize(100);
    }

    @Test
    @DisplayName("학생 조회 테스트")
    void findStudentByIdTest() {
        // Given, db에 없는 데이터로 테스트할것
        Student student = createStudent("hong2", "hong2@example.com", "010-1234-5678", "Address 1", 25);
        Student savedStudent = studentRepository.save(student);

        // When
        Optional<Student> foundStudent = studentRepository.findById(savedStudent.getId());

        // Then
        assertThat(foundStudent).isPresent();
        assertThat(foundStudent.get().getName()).isEqualTo("hong2");
        assertThat(foundStudent.get().getEmail()).isEqualTo("hong2@example.com");
    }

    @Test
    @DisplayName("학생 업데이트 테스트")
    //@Commit
    void updateStudentTest() {
        // Given, db에 없는 데이터로 테스트할것
        Student student = createStudent("hong4", "hong4@example.com", "010-1234-5678", "Address 1", 25);
        Student savedStudent = studentRepository.save(student);

        // When
        savedStudent.setName("Updated Name hong4");
        savedStudent.setEmail("updated.email@example.com");
        Student updatedStudent = studentRepository.save(savedStudent);

        // Then
        assertThat(updatedStudent.getName()).isEqualTo("Updated Name hong4");
        assertThat(updatedStudent.getEmail()).isEqualTo("updated.email@example.com");
    }

    @Test
    @DisplayName("학생 삭제 테스트")
    //@Commit
    void deleteStudentTest() {
        // Given
        Student student = createStudent("Delete Me", "delete.me@example.com", "010-9999-9999", "Delete Address", 30);
        Student savedStudent = studentRepository.save(student);

        // When
        studentRepository.deleteById(savedStudent.getId());
        Optional<Student> deletedStudent = studentRepository.findById(savedStudent.getId());

        // Then
        assertThat(deletedStudent).isNotPresent();
    }

}
