import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Grid,
    IconButton,
    Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { API_URL } from "../../../constant";
import axios from "axios";
import './AddProduct.css';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        active: true,
    });

    const [imageFiles, setImageFiles] = useState(Array(5).fill(null));
    const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null));
    const [categories, setCategories] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAbsoluteImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        const baseUrl = API_URL.substring(0, API_URL.indexOf('/api'));
        return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesResponse, productResponse] = await Promise.all([
                    fetch(`${API_URL}categories`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        credentials: 'include'
                    }),
                    fetch(`${API_URL}products/${productId}/dto`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        credentials: 'include'
                    })
                ]);

                if (!categoriesResponse.ok) {
                    const errorData = await categoriesResponse.json();
                    throw new Error(errorData.message || '카테고리 정보를 가져오는데 실패했습니다.');
                }
                if (!productResponse.ok) {
                    const errorData = await productResponse.json();
                    throw new Error(errorData.message || `제품 정보를 가져오는데 실패했습니다. (상태 코드: ${productResponse.status})`);
                }

                const categoriesData = await categoriesResponse.json();
                const productData = await productResponse.json();

                setCategories(categoriesData);

                setProduct({
                    name: productData.name || '',
                    description: productData.description || '',
                    price: productData.price || '',
                    stock: productData.stock || '',
                    active: productData.active !== undefined ? productData.active : true,
                });

                const categoryIds = productData.categories
                    ? productData.categories.map((catName) => {
                        const category = categoriesData.find(c => c.name === catName);
                        return category ? category.id : null;
                    })
                    : [];

                setSelectedCategoryIds(categoryIds.filter(id => id !== null));

                if (productData.productImgList && productData.productImgList.length > 0) {
                    const previews = productData.productImgList.map(img => getAbsoluteImageUrl(img.imageUrl));
                    setImagePreviews(previews);
                }


            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: name === 'active' ? value : value,
        }));
    };

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newImageFiles = [...imageFiles];
            newImageFiles[index] = file;
            setImageFiles(newImageFiles);

            const previewUrl = URL.createObjectURL(file);
            const newImagePreviews = [...imagePreviews];
            newImagePreviews[index] = previewUrl;
            setImagePreviews(newImagePreviews);
        } else {
            const newImageFiles = [...imageFiles];
            newImageFiles[index] = null;
            setImageFiles(newImageFiles);
            const newImagePreviews = [...imagePreviews];
            newImagePreviews[index] = null;
            setImagePreviews(newImagePreviews);
        }
    };

    const handleImageDelete = (indexToDelete) => {
        setImageFiles(imageFiles.filter((_, index) => index !== indexToDelete));
        setImagePreviews(imagePreviews.filter((_, index) => index !== indexToDelete));
    };

    const handleCategoryChange = (e) => {
        setSelectedCategoryIds(e.target.value);
    };

    const uploadImage = async () => { /* ... */ };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('stock', product.stock);
        formData.append('active', product.active);
        selectedCategoryIds.forEach(categoryId => formData.append('categoryIds', categoryId));

        imageFiles.forEach(file => formData.append('imageFiles', file));


        try {
            const updateProductResponse = await axios.put(`${API_URL}products/${productId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (updateProductResponse.status === 200) {
                const updateCategoryResponse = await axios.put(`${API_URL}products/${productId}/categories`, selectedCategoryIds, { /* ... */ });

                if (updateCategoryResponse.status === 200) {
                    alert("상품이 성공적으로 업데이트되었습니다.");
                    navigate('/adminpage/products');
                } else {
                    throw new Error(`카테고리 업데이트 실패: ${updateCategoryResponse.status}`);
                }
            } else {
                throw new Error(`상품 업데이트 실패: ${updateProductResponse.status}`);
            }

        } catch (error) {
            console.error("Error updating product:", error);
            alert("상품 업데이트 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Box sx={{ maxWidth: '800px', margin: '50px auto', padding: '20px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }} className="edit-product-container">
            <h2 className="edit-product-title">상품 수정</h2>
            <form className="edit-product-form" onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="multiple-checkbox-label">카테고리</InputLabel>
                    <Select
                        labelId="multiple-checkbox-label"
                        id="multiple-checkbox"
                        multiple
                        value={selectedCategoryIds}
                        onChange={handleCategoryChange}
                        renderValue={(selected) => {
                            return categories
                                .filter((category) => selected.includes(category.id))
                                .map((category) => category.name)
                                .join(', ');
                        }}
                    >
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                <Checkbox checked={selectedCategoryIds.includes(category.id)} />
                                <ListItemText primary={category.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField fullWidth label="상품명" name="name" value={product.name} onChange={handleInputChange} required margin="normal" />
                <TextField fullWidth label="가격" name="price" type="number" value={product.price} onChange={handleInputChange} required margin="normal" />
                <TextField fullWidth label="재고" name="stock" type="number" value={product.stock} onChange={handleInputChange} required margin="normal" />
                <TextField fullWidth label="상품 상세 내용" name="description" value={product.description} onChange={handleInputChange} required multiline rows={4} margin="normal" />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="active-checkbox-label">활성 상태</InputLabel>
                    <Select
                        labelId="active-checkbox-label"
                        id="active-checkbox"
                        name="active"
                        value={product.active}
                        onChange={handleInputChange}
                    >
                        <MenuItem value={true}>활성</MenuItem>
                        <MenuItem value={false}>비활성</MenuItem>
                    </Select>
                </FormControl>

                {/* ✅ 대표 이미지 영역 (AddProduct.jsx 와 동일) */}
                <Box sx={{ mt: 3, mb: 3 }} className="main-image-section">
                    <Typography variant="h6" gutterBottom>대표 이미지</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>상품을 대표하는 이미지를 선택해주세요.</Typography>
                    <div className="image-upload-box">
                        <input
                            className="file-input"
                            type="file"
                            name="mainImageFile"
                            onChange={(e) => handleImageChange(e, 0)}
                            accept="image/*"
                        />
                        {imagePreviews[0] ? (
                            <Box position="relative" display="inline-block">
                                <img className="image-preview" src={imagePreviews[0]} alt="대표 이미지 미리보기" />
                                <IconButton
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

                {/* ✅ 상세 이미지 영역 (AddProduct.jsx 와 동일) */}
                <Box sx={{ mt: 3, mb: 3 }} className="detail-image-section">
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
                                        onChange={(e) => handleImageChange(e, index + 1)}
                                        accept="image/*"
                                    />
                                    {imagePreviews[index + 1] ? (
                                        <Box position="relative" display="inline-block">
                                            <img className="image-preview" src={imagePreviews[index + 1]} alt={`상세 이미지 미리보기 ${index + 1}`} />
                                            <IconButton
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


                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button type="submit" variant="contained" color="primary" sx={{ width: '48%' }}>저장</Button>
                    <Button variant="outlined" color="secondary" sx={{ width: '48%' }} onClick={() => navigate('/adminpage/products')}>취소</Button>
                </Box>
            </form>
        </Box>
    );
};

export default EditProduct;