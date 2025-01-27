package com.javalab.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

/**
 * 목록 출력과 같은 페이지 에서 페이징 관련된 정보 저장 역할.
 *  - 데이터베이스에 조회할 때 페이징 관련 정보를 제공함.
 */
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageRequestDTO {
    // @Builder.Default : 빌더 패턴 사용시 초기값 지정
    // 지정하지 않으면 기본값이 0으로 초기화됨.
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 20;
    private String type; // 검색의 종류 t,c, w, tc,tw, twc
    private String keyword;
    public String[] getTypes(){
        if(type == null || type.isEmpty()){
            return null;
        }
        return type.split(""); // "tcw" -> ["t", "c", "w"]
    }

    /*
      페이징 관련된 정보 조회
      이 메소드만 호출하면 페이징 관련 정보를 담고 있는 Pageable을
      얻을 수 있음.
     */
    public Pageable getPageable(String...props) {
        Pageable pg = PageRequest.of(this.page, this.size, Sort.by(props).descending());
        return pg;
    }

    private String link;

    public String getLink() {
        if(link == null){
            StringBuilder builder = new StringBuilder();
            builder.append("page=" + this.page);
            builder.append("&size=" + this.size);
            if(type != null && type.length() > 0){
                builder.append("&type=" + type);
            }
            if(keyword != null){
                try {
                    builder.append("&keyword=" + URLEncoder.encode(keyword,"UTF-8"));
                } catch (UnsupportedEncodingException e) {
                }
            }
            link = builder.toString();
        }
        return link;
    }



}
