package com.javalab.student.util;

import com.javalab.student.dto.PageRequestDTO;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class PageRequestDTOUtil {

    public static Pageable getPageable(PageRequestDTO pageRequestDTO) {
        Sort sort = Sort.by("id").descending(); // 기본 정렬: id 내림차순 (최신순)

        // 검색 조건 (type, keyword) 에 따라 정렬 방식 변경 가능 (예: 이름 검색 시 이름 오름차순 정렬 등)
        // 필요하다면 PageRequestDTO 에 sortField, sortDirection 필드 추가하여 동적으로 정렬 조건 설정

        Pageable pageable = PageRequest.of(pageRequestDTO.getPage(), pageRequestDTO.getSize(), sort);
        return pageable;
    }
}