import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Grid, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { API_URL } from '../../../constant';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

const AddProduct = () => {
    const [product, setProduct] = useState({
        categoryIds: [],
        ingredientIds: [],
        name: '',
        price: '',
        stock: '',
        description: '',
        active: true,
    });

    // ✅ 대표 이미지 관련 state
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    // ✅ 상세 이미지 관련 state
    const [detailImageFiles, setDetailImageFiles] = useState(Array(4).fill(null)); // 상세 이미지 4개 배열로 초기화
    const [detailImagePreviews, setDetailImagePreviews] = useState(Array(4).fill(null)); // 상세 이미지 미리보기 4개 배열로 초기화

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                throw new Error('카테고리 목록을 불러오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('카테고리 목록을 불러오는 중 오류가 발생했습니다.', error);
            alert(error.message);
        }
    };

    const availableIngredients = [
        { id: 1, name: '성분1' },
        { id: 2, name: '성분2' },
        { id: 3, name: '성분3' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: (name === 'price' || name === 'stock') ? Number(value) : value,
        }));
    };


    const handleCategoryChange = (e) => {
        const { value } = e.target;
        setProduct(prev => ({
            ...prev,
            categoryIds: value
        }));
    };

    const handleIngredientChange = (e) => {
        const { value } = e.target;
        setProduct(prev => ({
            ...prev,
            ingredientIds: value
        }));
    };

    // ✅ 대표 이미지 변경 핸들러
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        setMainImageFile(file);
        if (file) {
            setMainImagePreview(URL.createObjectURL(file));
        } else {
            setMainImagePreview(null);
        }
    };

    // ✅ 상세 이미지 변경 핸들러
    const handleDetailImageChange = (e, index) => {
        const file = e.target.files[0];
        const newDetailImageFiles = [...detailImageFiles];
        const newDetailImagePreviews = [...detailImagePreviews];

        if (file) {
            newDetailImageFiles[index] = file;
            newDetailImagePreviews[index] = URL.createObjectURL(file);
        } else {
            newDetailImageFiles[index] = null;
            newDetailImagePreviews[index] = null;
        }

        setDetailImageFiles(newDetailImageFiles);
        setDetailImagePreviews(newDetailImagePreviews);
    };


    // ✅ 대표 이미지 삭제 핸들러
    const handleMainImageDelete = () => {
        setMainImageFile(null);
        setMainImagePreview(null);
    };

    // ✅ 상세 이미지 삭제 핸들러
    const handleDetailImageDelete = (indexToDelete) => {
        const newDetailImageFiles = [...detailImageFiles];
        const newDetailImagePreviews = [...detailImagePreviews];

        newDetailImageFiles[indexToDelete] = null;
        newDetailImagePreviews[indexToDelete] = null;

        setDetailImageFiles(newDetailImageFiles);
        setDetailImagePreviews(newDetailImagePreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('name', product.name);
            formData.append('description', product.description);
            formData.append('price', product.price);
            formData.append('stock', product.stock);
            formData.append('active', product.active);
            product.categoryIds.forEach(categoryId => formData.append('categoryIds', categoryId));
            product.ingredientIds.forEach(ingredientId => formData.append('ingredientIds', ingredientId));

            // ✅ 대표 이미지를 'mainImageFile' 키로 FormData에 추가
            if (mainImageFile) {
                formData.append('mainImageFile', mainImageFile);
            }

            // ✅ 상세 이미지들을 'detailImageFiles' 키로 FormData에 추가
            detailImageFiles.forEach(file => {
                if (file) {
                    formData.append('detailImageFiles', file);
                }
            });


            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${API_URL}products`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('상품 추가에 실패했습니다.');
            }

            const createdProduct = await response.json();

            const updateResponse = await fetch(`${API_URL}products/${createdProduct.id}/categories`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify(product.categoryIds),
                credentials: 'include'
            });

            if (!updateResponse.ok) {
                throw new Error('카테고리 업데이트에 실패했습니다.');
            }

            alert('상품이 성공적으로 추가되었습니다.');
            navigate('/adminpage/products');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2>상품 추가</h2>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>카테고리</InputLabel>
                    <Select
                        name="categoryIds"
                        value={product.categoryIds}
                        onChange={handleCategoryChange}
                        multiple
                        required
                    >
                        {categories.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label="상품명"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="가격"
                    name="price"
                    type="number"
                    value={product.price}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="재고"
                    name="stock"
                    type="number"
                    value={product.stock}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="상품 상세 내용"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                    margin="normal"
                />
                {/* ✅ 대표 이미지 영역 */}
                <Box sx={{ mt: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>대표 이미지</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>상품을 대표하는 이미지를 선택해주세요.</Typography>
                    <div className="image-upload-box">
                        <input
                            className="file-input"
                            type="file"
                            name="mainImageFile"
                            // ✅ handleMainImageChange 핸들러 사용
                            onChange={handleMainImageChange}
                            accept="image/*"
                        />
                        {/* ✅ mainImagePreview state 사용 */}
                        {mainImagePreview ? (
                            <Box position="relative" display="inline-block">
                                <img className="image-preview" src={mainImagePreview} alt="대표 이미지 미리보기" />
                                <IconButton
                                    // ✅ handleMainImageDelete 핸들러 사용
                                    onClick={handleMainImageDelete}
                                    sx={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ) : (
                            <span>대표 이미지 선택</span>
                        )}
                    </div>
                </Box>

                {/* ✅ 상세 이미지 영역 */}
                <Box sx={{ mt: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>상세 이미지 (추가)</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>상품 상세 정보를 보여주는 이미지를 추가해주세요. (최대 4장)</Typography>
                    <Grid container spacing={2}>
                        {[...Array(4)].map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <div className="image-upload-box">
                                    <input
                                        className="file-input"
                                        type="file"
                                        name={`detailImageFile${index + 1}`}
                                        // ✅ handleDetailImageChange 핸들러 사용, index 전달
                                        onChange={(e) => handleDetailImageChange(e, index)}
                                        accept="image/*"
                                    />
                                    {/* ✅ detailImagePreviews state 와 index 사용 */}
                                    {detailImagePreviews[index] ? (
                                        <Box position="relative" display="inline-block">
                                            <img className="image-preview" src={detailImagePreviews[index]} alt={`상세 이미지 미리보기 ${index + 1}`} />
                                            <IconButton
                                                // ✅ handleDetailImageDelete 핸들러 사용, index 전달
                                                onClick={() => handleDetailImageDelete(index)}
                                                sx={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <span>상세 이미지 추가</span>
                                    )}
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel shrink htmlFor="active-select">상품 활성화</InputLabel>
                    <Select
                        id="active-select"
                        name="active"
                        value={product.active}
                        onChange={handleChange}
                        label="상품 활성화"
                    >
                        <MenuItem value={true}>활성화</MenuItem>
                        <MenuItem value={false}>비활성화</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button type="submit" variant="contained" color="primary">저장</Button>
                    <Button variant="outlined" color="secondary" onClick={() => navigate('/adminpage/products')}>취소</Button>
                </Box>
            </form>
        </Box>
    );
};

export default AddProduct;