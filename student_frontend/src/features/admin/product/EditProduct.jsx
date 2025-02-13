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

    // ✅ 대표 이미지 관련 state
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    // ✅ 상세 이미지 관련 state
    const [detailImageFiles, setDetailImageFiles] = useState(Array(4).fill(null)); // 상세 이미지 4개 배열로 초기화
    const [detailImagePreviews, setDetailImagePreviews] = useState(Array(4).fill(null)); // 상세 이미지 미리보기 4개 배열로 초기화

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

                // 대표 이미지와 상세 이미지 분리 처리 및 state 업데이트
                if (productData.productImgList && productData.productImgList.length > 0) {
                    const mainImage = productData.productImgList.find(img => img.imageType === '대표');
                    if (mainImage) {
                        setMainImagePreview(getAbsoluteImageUrl(mainImage.imageUrl));
                    } else {
                        setMainImagePreview(null); // 대표 이미지 없는 경우 null 설정 명시적으로 추가
                    }

                    const detailImages = productData.productImgList.filter(img => img.imageType !== '대표');
                    const detailPreviews = detailImages.map(img => getAbsoluteImageUrl(img.imageUrl));
                    const initialDetailPreviews = Array(4).fill(null);
                    detailPreviews.forEach((preview, index) => {
                        if (index < 4) {
                            initialDetailPreviews[index] = preview;
                        }
                    });
                    setDetailImagePreviews(initialDetailPreviews);
                } else {
                    setMainImagePreview(null); // 이미지 없는 경우 대표 이미지 미리보기 null 로 명시적으로 초기화
                    setDetailImagePreviews(Array(4).fill(null)); // 이미지 없는 경우 상세 이미지 미리보기 null 배열로 명시적으로 초기화
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

    // ✅ 대표 이미지 삭제 핸들러 수정 (API 호출 추가)
        const handleMainImageDelete = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_URL}products/${productId}/images?imageType=대표`, { // 백엔드 API 호출 (DELETE 요청)
                    method: 'DELETE',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json', // 명시적으로 Content-Type 설정
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('대표 이미지 삭제 실패');
                }

                setMainImageFile(null);
                setMainImagePreview(null);
                alert('대표 이미지가 삭제되었습니다.'); // 성공 알림 추가

            } catch (error) {
                console.error("Error deleting main image:", error);
                alert('대표 이미지 삭제 중 오류가 발생했습니다.'); // 실패 알림 추가
            }
        };

        // ✅ 상세 이미지 삭제 핸들러 수정 (API 호출 추가, index 파라미터 추가)
        const handleDetailImageDelete = async (indexToDelete) => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_URL}products/${productId}/images?imageType=상세&imageIndex=${indexToDelete + 1}`, { // 백엔드 API 호출 (DELETE 요청), imageIndex 쿼리 파라미터 추가 (1부터 시작)
                    method: 'DELETE',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json', // 명시적으로 Content-Type 설정
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('상세 이미지 삭제 실패');
                }

                const newDetailImageFiles = [...detailImageFiles];
                const newDetailImagePreviews = [...detailImagePreviews];

                newDetailImageFiles[indexToDelete] = null;
                newDetailImagePreviews[indexToDelete] = null;

                setDetailImageFiles(newDetailImageFiles);
                setDetailImagePreviews(newDetailImagePreviews);
                alert('상세 이미지가 삭제되었습니다.'); // 성공 알림 추가


            } catch (error) {
                console.error("Error deleting detail image:", error);
                alert('상세 이미지 삭제 중 오류가 발생했습니다.'); // 실패 알림 추가
            }
        };

    const handleCategoryChange = (e) => {
        setSelectedCategoryIds(e.target.value);
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('stock', product.stock);
        formData.append('active', product.active);
        selectedCategoryIds.forEach(categoryId => formData.append('categoryIds', categoryId));

        // ✅ 대표 이미지를 'mainImageFile' 키로 FormData에 추가 (mainImageFile state 사용)
                if (mainImageFile) { // ✅ mainImageFile 이 있는 경우만 추가
                    formData.append('mainImageFile', mainImageFile);
                }

                // ✅ 상세 이미지들을 'detailImageFiles' 키로 FormData에 추가 (detailImageFiles state 사용)
                detailImageFiles.forEach(file => {
                    if (file) { // ✅ file 이 있는 경우만 추가
                        formData.append('detailImageFiles', file);
                    }
                });


                try {
                    const updateProductResponse = await axios.put(`${API_URL}products/${productId}`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            'Authorization': `Bearer ${token}`
                        },
                        credentials: 'include'
                    });

                    if (updateProductResponse.status === 200) {
                        alert("상품이 성공적으로 업데이트되었습니다.");
                        navigate('/adminpage/products');
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

                {/* 대표 이미지 영역 */}
                <Box sx={{ mt: 3, mb: 3 }} className="main-image-section">
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
                        {mainImagePreview && (
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
                        )}
                    </div>
                </Box>

                {/* 상세 이미지 영역 */}
                <Box sx={{ mt: 3, mb: 3 }} className="detail-image-section">
                    <Typography variant="h6" gutterBottom>상세 이미지 (추가)</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>상품 상세 정보를 보여주는 이미지를 추가해주세요. (최대 4장)</Typography>
                    <Grid container spacing={2}>
                        {detailImagePreviews.map((previewUrl, index) => (
                            previewUrl &&
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
                                    <Box position="relative" display="inline-block">
                                        <img className="image-preview" src={previewUrl} alt={`상세 이미지 미리보기 ${index + 1}`} />
                                        <IconButton
                                            // ✅ handleDetailImageDelete 핸들러 사용, index 전달
                                            onClick={() => handleDetailImageDelete(index)}
                                            sx={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </div>
                            </Grid>
                        ))}
                        {[...Array(4 - detailImagePreviews.filter(preview => preview).length)].map((_, index) => ( // 상세 이미지 슬롯 부족분 채우기
                            <Grid item xs={12} sm={6} md={4} lg={3} key={`empty-${index}`}>
                                <div className="image-upload-box">
                                    <input
                                        className="file-input"
                                        type="file"
                                        name={`detailImageFile${detailImagePreviews.filter(preview => preview).length + index + 1}`}
                                        // ✅ handleDetailImageChange 핸들러 사용, index 계산하여 전달
                                        onChange={(e) => handleDetailImageChange(e, detailImagePreviews.filter(preview => preview).length + index)}
                                        accept="image/*"
                                    />
                                    <span>상세 이미지 추가</span>
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