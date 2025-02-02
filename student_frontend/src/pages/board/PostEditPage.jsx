import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';

function PostEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',  // 게시판 구분 (공지사항/자주 묻는 질문)
    subCategory: '전체'  // FAQ 카테고리
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const faqCategories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

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

        // boardId를 기준으로 category 설정 (1: 공지사항, 2: FAQ)
        const category = post.boardId === 1 ? '공지사항' : '자주 묻는 질문';

        setFormData({
          title: post.title,
          content: post.content,
          category: category,
          subCategory: post.category || '전체', // FAQ의 경우 서버에서 받은 카테고리 사용
          boardId: post.boardId
        });
      } catch (err) {
        console.error('Error fetching post:', err);
        alert('게시물을 불러오는데 실패했습니다.');
        navigate('/board');
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // FAQ 게시판일 때 카테고리 선택 필수
    if (formData.category === '자주 묻는 질문' && !formData.subCategory) {
      alert('FAQ 카테고리를 선택해주세요.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('loggedInUser'));
      const token = userData.token;

      // 현재 게시글 정보 먼저 가져오기
      const currentPost = await axios.get(`http://localhost:8080/api/posts/${postId}`);
      const originalAuthorId = currentPost.data.authorId;

      const boardId = formData.category === '공지사항' ? 1 : 2;
      const finalCategory = formData.category === '자주 묻는 질문' ? formData.subCategory : formData.category;

      const updateData = {
        title: formData.title,
        content: formData.content,
        boardId: boardId,
        category: finalCategory,
        authorId: originalAuthorId  // 원본 게시글의 작성자 ID 사용
      };

      console.log('Update request data:', updateData); // 요청 데이터 로깅

      const response = await axios.put(
        `http://localhost:8080/api/posts/${postId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response); // 응답 데이터 로깅

      alert('게시물이 수정되었습니다.');
      navigate('/board');  // 수정된 부분: 항상 /board로 이동
    } catch (err) {
      console.error('Error updating post:', err);
      if (err.response) {
        console.log('Error response data:', err.response.data); // 에러 응답 데이터 로깅
        console.log('Error response status:', err.response.status);
      }
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('관리자 권한이 필요하거나 로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('수정에 실패했습니다. 에러: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <Box className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">게시물 수정</h2>

      <Box component="form" onSubmit={handleSubmit} className="space-y-6">
        <FormControl fullWidth variant="outlined" className="mb-4">
          <InputLabel>게시판</InputLabel>
          <Select
            name="category"
            value={formData.category}
            disabled={true}  // 게시판 선택 비활성화
            label="게시판"
          >
            <MenuItem value="공지사항">공지사항</MenuItem>
            <MenuItem value="자주 묻는 질문">자주 묻는 질문</MenuItem>
          </Select>
        </FormControl>

        {formData.category === "자주 묻는 질문" && (
          <FormControl fullWidth variant="outlined" className="mb-4">
            <InputLabel>카테고리 선택</InputLabel>
            <Select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              label="카테고리 선택"
            >
              {faqCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          fullWidth
          label="제목"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mb-4"
        />

        <TextField
          fullWidth
          label="내용"
          name="content"
          value={formData.content}
          onChange={handleChange}
          multiline
          rows={10}
          className="mb-4"
        />

        <Box className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            수정하기
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
        </Box>
      </Box>
    </Box>
  );
}

export default PostEditPage;