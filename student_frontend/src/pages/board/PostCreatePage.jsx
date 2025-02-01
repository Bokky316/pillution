import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostCreatePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:8080/api/posts', {
                title,
                content,
                category: '소식', // 기본 카테고리
            });

            navigate('/posts'); // 등록 후 게시물 목록으로 이동
        } catch (err) {
            console.error('Error creating post:', err);
        }
    };

    return (
        <div>
            <h2>게시글 등록</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    제목:
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>
                <br />
                <label>
                    내용:
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} />
                </label>
                <br />
                <button type="submit">등록</button>
            </form>
        </div>
    );
}

export default PostCreatePage;