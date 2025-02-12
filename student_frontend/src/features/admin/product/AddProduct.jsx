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

    const [imageFiles, setImageFiles] = useState(Array(5).fill(null)); // 이미지 파일들을 담을 state 로 변경
    const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null)); // 이미지 미리보기들을 담을 state 로 변경
    const navigate = useNavigate();

    // 카테고리 목록을 저장할 state
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // 컴포넌트가 마운트될 때 카테고리 목록을 가져옴
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

    const handleImageChange = (e, index) => {
            const file = e.target.files[0];
                    if (file) {
                        const newImageFiles = [...imageFiles]; // imageFiles 복사본 생성
                        newImageFiles[index] = file; // 특정 index 에 파일 저장
                        setImageFiles(newImageFiles); // imageFiles 상태 업데이트

                        const previewUrl = URL.createObjectURL(file); // 미리보기 URL 생성
                        const newImagePreviews = [...imagePreviews]; // imagePreviews 복사본 생성
                        newImagePreviews[index] = previewUrl; // 특정 index 에 미리보기 URL 저장
                        setImagePreviews(newImagePreviews); // imagePreviews 상태 업데이트
                    } else {
                        // 파일 선택 취소 시, 해당 index 의 파일 및 미리보기 URL 제거
                        const newImageFiles = [...imageFiles];
                        newImageFiles[index] = null;
                        setImageFiles(newImageFiles);
                        const newImagePreviews = [...imagePreviews];
                        newImagePreviews[index] = null;
                        setImagePreviews(newImagePreviews);
                    }
                };

            // 이미지 삭제 핸들러
                const handleImageDelete = (indexToDelete) => {
                    const newImageFiles = [...imageFiles];
                    newImageFiles[indexToDelete] = null;
                    setImageFiles(newImageFiles);
                    const newImagePreviews = [...imagePreviews];
                    newImagePreviews[indexToDelete] = null;
                    setImagePreviews(newImagePreviews);
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

                // 이미지 파일들을 FormData 에 추가
                imageFiles.forEach(file => formData.append('imageFiles', file));


                const token = localStorage.getItem('accessToken');

                const response = await fetch(`${API_URL}products`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: formData, // FormData 를 body 로 사용
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('상품 추가에 실패했습니다.');
                }

                const createdProduct = await response.json();

                const updateResponse = await fetch(`${API_URL}products/${createdProduct.id}/categories`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json', // ✅ Content-Type 명시적으로 설정
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
                                <Box sx={{ mt: 3, mb: 3 }}> {/* margin 조정 */}
                                    <Typography variant="h6" gutterBottom>대표 이미지</Typography> {/* 타이틀 추가 */}
                                    <Typography variant="body2" color="textSecondary" gutterBottom>상품을 대표하는 이미지를 선택해주세요.</Typography> {/* 설명 추가 */}
                                    <div className="image-upload-box">
                                        <input
                                            className="file-input"
                                            type="file"
                                            name="mainImageFile" // name 변경 (mainImageFile)
                                            onChange={(e) => handleImageChange(e, 0)} // index 0 (대표 이미지)
                                            accept="image/*"
                                        />
                                        {imagePreviews[0] ? (
                                            <Box position="relative" display="inline-block"> {/* Box 컴포넌트로 감싸고 position: relative 설정 */}
                                                <img className="image-preview" src={imagePreviews[0]} alt="대표 이미지 미리보기" />
                                                <IconButton // 이미지 삭제 버튼 추가
                                                    onClick={() => handleImageDelete(0)}
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
                                <Box sx={{ mt: 3, mb: 3 }}> {/* margin 조정 */}
                                    <Typography variant="h6" gutterBottom>상세 이미지 (추가)</Typography> {/* 타이틀 추가 */}
                                    <Typography variant="body2" color="textSecondary" gutterBottom>상품 상세 정보를 보여주는 이미지를 추가해주세요. (최대 4장)</Typography> {/* 설명 추가 */}
                                    <Grid container spacing={2}> {/* Grid 컨테이너 사용 */}
                                        {[...Array(4)].map((_, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}> {/* Grid item 사용, 반응형 레이아웃 */}
                                                <div className="image-upload-box">
                                                    <input
                                                        className="file-input"
                                                        type="file"
                                                        name={`detailImageFile${index + 1}`} // name 변경 (detailImageFile1, detailImageFile2...)
                                                        onChange={(e) => handleImageChange(e, index + 1)} // index 1, 2, 3, 4 (상세 이미지)
                                                        accept="image/*"
                                                    />
                                                    {imagePreviews[index + 1] ? ( // index 1 부터 미리보기 표시
                                                        <Box position="relative" display="inline-block"> {/* Box 컴포넌트로 감싸고 position: relative 설정 */}
                                                            <img className="image-preview" src={imagePreviews[index + 1]} alt={`상세 이미지 미리보기 ${index + 1}`} />
                                                            <IconButton // 이미지 삭제 버튼 추가
                                                                onClick={() => handleImageDelete(index + 1)}
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
