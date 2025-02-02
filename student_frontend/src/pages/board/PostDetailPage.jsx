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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 관리자 권한 체크
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setIsAdmin(userData.authorities?.includes('ROLE_ADMIN') || false);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setIsAdmin(false);
      }
    }

    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
        const postResponse = response.data;

        const postsResponse = await axios.get(`http://localhost:8080/api/posts/board/1?page=0&size=100`);
        const posts = postsResponse.data.dtoList;
        const currentIndex = posts.findIndex(post => post.id === parseInt(postId));

        if (currentIndex > 0) {
          setPrevPostId(posts[currentIndex - 1].id);
          setPrevPostTitle(posts[currentIndex - 1].title);
        } else {
          setPrevPostId(null);
          setPrevPostTitle('없음');
        }

        if (currentIndex < posts.length - 1) {
          setNextPostId(posts[currentIndex + 1].id);
          setNextPostTitle(posts[currentIndex + 1].title);
        } else {
          setNextPostId(null);
          setNextPostTitle('없음');
        }

        setPost(postResponse);
      } catch (err) {
        console.error('Error fetching post:', err);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDeletePost = async () => {
    if (!isAdmin) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('loggedInUser'));
      const token = userData.token;

      await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('게시물이 삭제되었습니다.');
      navigate('/board');
    } catch (err) {
      console.error('Error deleting post:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('관리자 권한이 필요하거나 로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleEditPost = () => {
    if (!isAdmin) {
      alert('관리자만 수정할 수 있습니다.');
      return;
    }
    navigate(`/post/${postId}/edit`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {post && (
        <>
          <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
          <div className="text-sm text-gray-500 mb-4">
            작성일: {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <p className="text-gray-600 whitespace-pre-wrap mb-8">{post.content}</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <button
                onClick={() => prevPostId && navigate(`/post/${prevPostId}`)}
                className={`block w-full text-left text-blue-600 hover:text-blue-800 ${!prevPostId ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!prevPostId}
              >
                이전 글: {prevPostTitle}
              </button>
              <button
                onClick={() => nextPostId && navigate(`/post/${nextPostId}`)}
                className={`block w-full text-left text-blue-600 hover:text-blue-800 ${!nextPostId ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!nextPostId}
              >
                다음 글: {nextPostTitle}
              </button>
            </div>

            <button
              onClick={() => navigate('/board')}
              className="block text-blue-600 hover:text-blue-800"
            >
              목록으로 가기
            </button>

            {isAdmin && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleDeletePost}
                  className="text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
                <button
                  onClick={handleEditPost}
                  className="text-blue-600 hover:text-blue-800"
                >
                  수정
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PostDetailPage;
