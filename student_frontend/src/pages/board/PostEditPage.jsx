import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function PostEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 관리자 권한 체크
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setIsAdmin(userData.authorities?.includes('ROLE_ADMIN') || false);
        if (!userData.authorities?.includes('ROLE_ADMIN')) {
          alert('관리자만 접근할 수 있습니다.');
          navigate('/board');
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        navigate('/board');
      }
    } else {
      navigate('/login');
    }

    // 게시물 데이터 가져오기
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
        const post = response.data;
        setTitle(post.title);
        setContent(post.content);
      } catch (err) {
        console.error('Error fetching post:', err);
        alert('게시물을 불러오는데 실패했습니다.');
        navigate('/board');
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('loggedInUser'));
      const token = userData.token;

      await axios.put(
        `http://localhost:8080/api/posts/${postId}`,
        {
          title,
          content,
          boardId: 1  // 게시판 ID는 현재 고정값입니다
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('게시물이 수정되었습니다.');
      navigate(`/post/${postId}`);
    } catch (err) {
      console.error('Error updating post:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('관리자 권한이 필요하거나 로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('수정에 실패했습니다.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">게시물 수정</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            수정하기
          </button>
          <button
            type="button"
            onClick={() => navigate(`/post/${postId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostEditPage;