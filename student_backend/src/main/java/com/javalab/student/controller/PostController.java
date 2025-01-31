package com.javalab.student.controller;

import com.javalab.student.dto.PageRequestDTO;
import com.javalab.student.dto.PageResponseDTO;
import com.javalab.student.dto.PostDto;
import com.javalab.student.entity.Post;
import com.javalab.student.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@Slf4j
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // 게시글 등록
    @PostMapping
    public ResponseEntity<PostDto> createPost(@RequestBody @Valid PostDto postDto) {
        return ResponseEntity.ok(postService.createPost(postDto));
    }

    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(@PathVariable("id") Long id, @RequestBody @Valid PostDto postDto) {
        return ResponseEntity.ok(postService.updatePost(id, postDto));
    }

    // 게시글 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPostById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    // 페이징 처리된 게시글 목록 조회 (게시판별)
    @GetMapping("/board/{boardId}")
    public ResponseEntity<PageResponseDTO<PostDto>> getPostsByBoard(
            @PathVariable("boardId") Long boardId,
            @ModelAttribute PageRequestDTO pageRequestDTO) {

        PageResponseDTO<PostDto> responseDTO = postService.getPostsByBoard(boardId, pageRequestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    // 게시글 검색
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<PostDto>> searchPosts(@ModelAttribute PageRequestDTO pageRequestDTO) {
        log.info("검색 키워드 : " + pageRequestDTO.getKeyword() + ", 페이지 : " + pageRequestDTO.getPage() + " " + pageRequestDTO.getSize());

        PageResponseDTO<PostDto> responseDTO = postService.searchPosts(pageRequestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
