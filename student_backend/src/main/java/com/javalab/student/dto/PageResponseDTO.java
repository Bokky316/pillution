package com.javalab.student.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

/**
 * 페이징 처리에 필요한 정보를 포함 하고, 응답 데이터(목록)를 담기 위한
 * DTO(Data Transfer Object) 클래스
 * 생성자에 빌더패턴 적용
 *  - 이 클래스 속성들이 너무 많아서 다는 필요 없고 핵심적 으로
 *    외부에서 전달될 값들로 변경되야 할 속성 들만 빌더 패턴으로
 *    사용하기 위해서 생성자에만 빌더 패턴 적용.
 *  - 세터 메소드 없음.
 */
@Getter
@ToString
public class PageResponseDTO<E> {

    private int page;
    private int size;
    private int total;

    //시작 페이지 번호
    private int start;
    //끝 페이지 번호
    private int end;

    //이전 페이지의 존재 여부
    private boolean prev;
    //다음 페이지의 존재 여부
    private boolean next;

    // 페이지에 보여줄 목록 데이터
    private List<E> dtoList;

    /*
      1. 이 빌더 패턴이 적용된 생성자는 제네릭 타입의
        파라미터(List<E>) 가 있기 때문에 호출할 때 제네릭 파라미터를
        명시적으로 전달해야 한다.
      2. @Builder(builderMethodName = "withAll")
       - 이 builder()메소드 이름을 withAll로 하겠다.
         withAll 주석처리하면 builder()로 사용해야 함.
      3. 생성자에만 빌더 패턴을 정의하면 생성자의 매개변수만 외부에서
         빌더 메소드로 값을 할당할 수 있고 그 외의 멤버 변수는 할당 불가
      4. @Builder 어노테이션 주석처리하면 일반적인 방식으로
        객체 생성해야 함.
      5. PageRequestDTO에는 사용자가 요청한 페이징 관련 정보가 있음.
     */
    @Builder//(builderMethodName = "withAll")
    public PageResponseDTO(PageRequestDTO pageRequestDTO,
                           List<E> dtoList,
                           int total){
        if(total <= 0){
            return;
        }
        // 페이지 요청정보에서 요청페이지, 사이즈 얻기
        this.page = pageRequestDTO.getPage(); // 요청페이지
        this.size = pageRequestDTO.getSize(); // 요청사이즈
        this.total = total; // 전체 게시물수

        // 목록(게시물, 사용자 등)
        // ##############################
        this.dtoList = dtoList;
        // ##############################

        /*
          페이징 관련 정보 만들기
         */
        this.end =   (int)(Math.ceil(this.page / 10.0 )) *  10;
        this.start = this.end - 9;
        int last =  (int)(Math.ceil((total/(double)size)));
        this.end =  end > last ? last: end;
        this.prev = this.start > 1;
        this.next =  total > this.end * this.size;
    }
}
