package com.javalab.student.controller;

import com.javalab.student.dto.PostDto;
import com.javalab.student.entity.Post;
import com.javalab.student.service.PostService;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    // 소식 게시판 데이터 가져오기 (boardId = 1)
    @GetMapping("/news")
    public ResponseEntity<Page<PostDto>> getNewsPosts(
            @RequestParam int page,
            @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostDto> posts = postService.getPostsByBoardWithPaging(1L, pageable);
        return ResponseEntity.ok(posts);
    }

    // 자주 묻는 질문 게시판 데이터 가져오기 (boardId = 2)
    @GetMapping("/faq")
    public ResponseEntity<Page<PostDto>> getFaqPosts(
            @RequestParam int page,
            @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostDto> posts = postService.getPostsByBoardWithPaging(2L, pageable);
        return ResponseEntity.ok(posts);
    }

    // 기존 페이징 방식 유지
    @GetMapping("/board/{boardId}/paged")
    public ResponseEntity<Page<PostDto>> getPostsByBoardWithPaging(
            @PathVariable Long boardId,
            @RequestParam int page,
            @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostDto> posts = postService.getPostsByBoardWithPaging(boardId, pageable);
        return ResponseEntity.ok(posts);
    }

    // 기존 검색 기능 유지
    @GetMapping("/board/{boardId}/search")
    public ResponseEntity<List<PostDto>> searchPosts(
            @PathVariable Long boardId,
            @RequestParam String keyword) {
        List<PostDto> posts = postService.searchPosts(boardId, keyword);
        return ResponseEntity.ok(posts);
    }

    // 게시글 생성 (관리자만 가능)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDto> createPost(@RequestBody PostDto postDto) {
        Post savedPost = postService.createPost(postDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PostDto.fromEntity(savedPost));
    }

    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long id,
            @RequestBody PostDto postDTO) {
        Post updatedPost = postService.updatePost(id, postDTO);
        return ResponseEntity.ok(PostDto.fromEntity(updatedPost));
    }
}
