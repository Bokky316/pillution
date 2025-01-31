package com.javalab.student.service;

import com.javalab.student.dto.PageRequestDTO;
import com.javalab.student.dto.PageResponseDTO;
import com.javalab.student.dto.PostDto;
import com.javalab.student.entity.Board;
import com.javalab.student.entity.Post;
import com.javalab.student.exception.UnauthorizedException;
import com.javalab.student.repository.BoardRepository;
import com.javalab.student.repository.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final BoardRepository boardRepository;

    public PostDto createPost(PostDto postDto) {
        Board board = boardRepository.findById(postDto.getBoardId())
                .orElseThrow(() -> new EntityNotFoundException("해당 게시판이 존재하지 않습니다."));

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setBoard(board);
        post.setAuthorId(postDto.getAuthorId());

        validatePost(post);

        Post savedPost = postRepository.save(post);
        return PostDto.fromEntity(savedPost);
    }

    public PostDto updatePost(Long postId, PostDto postDto) {
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글이 존재하지 않습니다."));

        if (!existingPost.getAuthorId().equals(postDto.getAuthorId())) {
            throw new UnauthorizedException("게시글 수정 권한이 없습니다.");
        }

        existingPost.setTitle(postDto.getTitle());
        existingPost.setContent(postDto.getContent());

        validatePost(existingPost);

        Post updatedPost = postRepository.save(existingPost);
        return PostDto.fromEntity(updatedPost);
    }

    public PostDto getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글이 존재하지 않습니다."));
        return PostDto.fromEntity(post);
    }

    public PageResponseDTO<PostDto> getPostsByBoard(Long boardId, PageRequestDTO pageRequestDTO) {
        Pageable pageable = pageRequestDTO.getPageable("id");
        Page<Post> result = postRepository.findByBoardId(boardId, pageable);
        List<PostDto> dtoList = result.getContent().stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());

        return PageResponseDTO.<PostDto>builder()
                .pageRequestDTO(pageRequestDTO)
                .dtoList(dtoList)
                .total((int) result.getTotalElements())
                .build();
    }

    public PageResponseDTO<PostDto> searchPosts(PageRequestDTO pageRequestDTO) {
        Pageable pageable = pageRequestDTO.getPageable("id");

        // String[] 타입의 검색 조건(type)을 String으로 변환
        String types = pageRequestDTO.getTypes() != null ? String.join("", pageRequestDTO.getTypes()) : null;

        Page<Post> result = postRepository.searchByMultipleFields(types, pageRequestDTO.getKeyword(), pageable);

        List<PostDto> dtoList = result.getContent().stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());

        return PageResponseDTO.<PostDto>builder()
                .pageRequestDTO(pageRequestDTO)
                .dtoList(dtoList)
                .total((int) result.getTotalElements())
                .build();
    }

    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new EntityNotFoundException("해당 게시글이 존재하지 않습니다.");
        }
        postRepository.deleteById(id);
    }

    private void validatePost(Post post) {
        if (StringUtils.isEmpty(post.getTitle())) {
            throw new IllegalArgumentException("제목은 필수 입력 항목입니다.");
        }

        if (post.getTitle().length() > 255) {
            throw new IllegalArgumentException("제목은 255자를 초과할 수 없습니다.");
        }

        post.setTitle(sanitizeInput(post.getTitle()));
        post.setContent(sanitizeInput(post.getContent()));
    }

    private String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        return input.replaceAll("<[^>]*>", "");
    }
}
