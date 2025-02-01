import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [prevPostId, setPrevPostId] = useState(null);
  const [prevPostTitle, setPrevPostTitle] = useState('');
  const [nextPostId, setNextPostId] = useState(null);
  const [nextPostTitle, setNextPostTitle] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 상태 추가

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
        const postResponse = response.data;

        // 이전/다음 게시물 ID 및 제목 가져오기
        const postsResponse = await axios.get(`http://localhost:8080/api/posts/board/1?page=0&size=100`);
        const posts = postsResponse.data.dtoList;
        const currentIndex = posts.findIndex(post => post.id === parseInt(postId));

        if (currentIndex > 0) {
          setPrevPostId(posts[currentIndex - 1].id);
          setPrevPostTitle(posts[currentIndex - 1].title);
        } else {
          // 첫 번째 게시물일 경우
          setPrevPostId(null);
          setPrevPostTitle('없음');
        }

        if (currentIndex < posts.length - 1) {
          setNextPostId(posts[currentIndex + 1].id);
          setNextPostTitle(posts[currentIndex + 1].title);
        } else {
          // 마지막 게시물일 경우
          setNextPostId(null);
          setNextPostTitle('없음');
        }

        setPost(postResponse);

        // 사용자 역할 확인 (예시: 로컬 스토리지에서 사용자 정보 가져오기)
        const userRole = localStorage.getItem('userRole');
        setIsAdmin(userRole === 'ADMIN');
      } catch (err) {
        console.error('Error fetching post:', err);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDeletePost = async () => {
    if (!isAdmin) return; // 관리자가 아닐 경우 기능 비활성화

    try {
      await axios.delete(`http://localhost:8080/api/posts/${postId}`);
      navigate('/posts'); // 삭제 후 게시물 목록으로 이동
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleEditPost = () => {
    if (!isAdmin) return; // 관리자가 아닐 경우 기능 비활성화

    navigate(`/post/${postId}/edit`); // 수정 페이지로 이동
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{post?.title}</h2>
      <div className="text-sm text-gray-500 mb-4">
        작성일: {post && new Date(post.createdAt).toLocaleDateString()}
      </div>
      {/* 줄바꿈 스타일 적용 */}
      <p className="text-gray-600" style={{ whiteSpace: "pre-wrap" }}>{post?.content}</p>

      <div className="mt-4">
        <button
          style={{ display: 'block', cursor: 'pointer' }}
          onClick={() => prevPostId && navigate(`/post/${prevPostId}`)}
          className={`text-blue-600 hover:text-blue-800 ${!prevPostId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          이전 글: {prevPostTitle}
        </button>
        <button
          style={{ display: 'block', marginTop: '10px', cursor: 'pointer' }}
          onClick={() => nextPostId && navigate(`/post/${nextPostId}`)}
          className={`text-blue-600 hover:text-blue-800 ${!nextPostId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          다음 글: {nextPostTitle}
        </button>

        {/* 목록으로 가기 버튼 */}
        <button
          style={{ display: 'block', marginTop: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/news')}
          className="text-blue-600 hover:text-blue-800"
        >
          목록으로 가기
        </button>

        {isAdmin && (
          <div style={{ marginTop: '20px' }}>
            <button
              style={{ display: 'block', cursor: 'pointer' }}
              onClick={handleDeletePost}
              className="text-red-600 hover:text-red-800"
            >
              삭제
            </button>
            <button
              style={{ display: 'block', marginTop: '10px', cursor: 'pointer' }}
              onClick={handleEditPost}
              className="text-blue-600 hover:text-blue-800"
            >
              수정
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetailPage;
