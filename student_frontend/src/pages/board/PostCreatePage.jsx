import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
 DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

function PostCreatePage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "공지사항", // 게시판 선택
    boardId: 1, // 기본값 설정
    subCategory: "", // FAQ 하위 카테고리
    authorId: null,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const faqCategories = ["전체", "제품", "회원정보", "주문/결제", "교환/반품", "배송", "기타"];

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setIsAdmin(userData.authorities?.includes("ROLE_ADMIN") || false);
        setFormData((prev) => ({
          ...prev,
          authorId: userData.id || 1,
        }));
      } catch (e) {
        console.error("Error parsing user data:", e);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증 ✅
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // 자주 묻는 질문 게시판일 경우 하위 카테고리 선택 필수 ✅
    if (formData.category === "자주 묻는 질문" && !formData.subCategory) {
      alert("FAQ 카테고리를 선택해주세요.");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("loggedInUser"));
      const token = userData.token;

      const boardId = formData.category === "공지사항" ? 1 : 2;

      // 카테고리 설정 로직 개선 ✅
      const finalCategory =
        formData.category === "자주 묻는 질문" ? formData.subCategory : formData.category;

      const response = await axios.post(
        "http://localhost:8080/api/posts",
        {
          title: formData.title,
          content: formData.content,
          boardId: boardId,
          category: finalCategory, // 수정된 부분
          authorId: formData.authorId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("게시물이 등록되었습니다!");
        navigate("/board");
        console.log({
          title: formData.title,
          content: formData.content,
          boardId: boardId,
          category: finalCategory, // ✅ 서버로 전송되는 카테고리 확인
          authorId: formData.authorId,
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("관리자 권한이 필요하거나 로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("게시물 등록에 실패했습니다.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmCancel = () => {
    setOpenDialog(false);
    navigate("/board");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (!isAdmin) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Typography variant="h6" color="error" align="center">
          관리자만 게시글을 등록할 수 있습니다.
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="primary" onClick={() => navigate("/board")}>
            목록으로 돌아가기
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h4" align="center" gutterBottom>
        게시글 등록
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box mb={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>게시판 선택</InputLabel>
            <Select name="category" value={formData.category} onChange={handleChange} label="게시판 선택">
              <MenuItem value="공지사항">공지사항</MenuItem>
              <MenuItem value="자주 묻는 질문">자주 묻는 질문</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {formData.category === "자주 묻는 질문" && (
          <Box mb={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>카테고리 선택</InputLabel>
              <Select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                label="카테고리 선택"
              >
                {faqCategories.map((faqCategory) => (
                  <MenuItem key={faqCategory} value={faqCategory}>
                    {faqCategory}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Box mb={3}>
          <TextField
            fullWidth
            label="제목"
            name="title"
            variant="outlined"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            label="내용"
            name="content"
            variant="outlined"
            multiline
            rows={6}
            value={formData.content}
            onChange={handleChange}
            required
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="contained" color="primary" type="submit">
            등록
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
            취소
          </Button>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>취소 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmCancel} color="secondary">
            네
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            아니요
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PostCreatePage;
