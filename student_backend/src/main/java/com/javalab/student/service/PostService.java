package com.javalab.student.service;

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

    public Post createPost(PostDto postDto) {
        Board board = boardRepository.findById(postDto.getBoardId())
                .orElseThrow(() -> new EntityNotFoundException("해당 게시판이 존재하지 않습니다."));

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setBoard(board);
        post.setAuthorId(postDto.getAuthorId());

        if (StringUtils.isEmpty(post.getTitle())) {
            throw new IllegalArgumentException("제목은 필수 입력 항목입니다.");
        }

        if (post.getTitle().length() > 255) {
            throw new IllegalArgumentException("제목은 255자를 초과할 수 없습니다.");
        }

        post.setTitle(sanitizeInput(post.getTitle()));
        post.setContent(sanitizeInput(post.getContent()));

        return postRepository.save(post);
    }

    public Post updatePost(Long postId, PostDto postDTO) {
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글이 존재하지 않습니다."));

        if (!existingPost.getAuthorId().equals(postDTO.getAuthorId())) {
            throw new UnauthorizedException("게시글 수정 권한이 없습니다.");
        }

        existingPost.setTitle(postDTO.getTitle());
        existingPost.setContent(postDTO.getContent());

        return postRepository.save(existingPost);
    }

    public Page<PostDto> getPostsByBoardWithPaging(Long boardId, Pageable pageable) {
        Page<Post> postPage = postRepository.findByBoardId(boardId, pageable);
        return postPage.map(PostDto::fromEntity);
    }

    public List<PostDto> searchPosts(Long boardId, String keyword) {
        return postRepository.searchByBoardIdAndKeyword(boardId, keyword).stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());
    }

    private String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        return input.replaceAll("<[^>]*>", "");
    }
}
