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
    Typography,
    Chip,
    Stack,
    Paper,
    Card,
    CardContent,
    Snackbar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { API_URL } from "@/utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesByIngredient } from '@features/product/productApi';
import { clearSelectedCategories } from '@/store/productSlice';
import '@/styles/AddProduct.css'; // 스타일 유지

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedCategories = useSelector((state) => state.products.selectedCategories) || [];
    const token = localStorage.getItem('accessToken');

    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        active: true,
        categoryIds: [],
        ingredientIds: [],
    });

    // ✅ 대표 이미지 관련 state
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);

    // ✅ 상세 이미지 관련 state
    const [detailImageFiles, setDetailImageFiles] = useState(Array(4).fill(null)); // 상세 이미지 4개 배열로 초기화
    const [detailImagePreviews, setDetailImagePreviews] = useState(Array(4).fill(null)); // 상세 이미지 미리보기 4개 배열로 초기화

    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 알림창과 대화상자를 위한 상태 추가
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    const getAbsoluteImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        const baseUrl = API_URL.substring(0, API_URL.indexOf('/api'));
        return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
    };

    const fetchIngredients = async () => {
        try {
            const response = await fetch(`${API_URL}ingredients`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('영양성분 목록을 불러오는 데 실패했습니다.');

            const data = await response.json();
            setIngredients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("영양성분 데이터 로딩 실패:", error);
            setError(error.message);
            setSnackbarMessage(error.message);
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(clearSelectedCategories());

                const ingredientsResponse = await fetch(`${API_URL}ingredients`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                if (!ingredientsResponse.ok) {
                    throw new Error('영양성분 데이터를 가져오는 데 실패했습니다.');
                }

                const ingredientsData = await ingredientsResponse.json();
                setIngredients(Array.isArray(ingredientsData) ? ingredientsData : []);

                const productResponse = await fetch(`${API_URL}products/${productId}/dto`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                if (!productResponse.ok) {
                    throw new Error('제품 데이터를 가져오는 데 실패했습니다.');
                }

                const productData = await productResponse.json();
                console.log("✅ Received product data:", productData);

                setProduct({
                    name: productData.name || '',
                    description: productData.description || '',
                    price: productData.price || '',
                    stock: productData.stock || '',
                    active: productData.active !== undefined ? productData.active : true,
                    categoryIds: productData.categories ? productData.categories.map(cat => cat.id) : [],
                    ingredientIds: [],
                    ingredients: productData.ingredients || [],
                });

                // ✅ 이미지 URL을 미리보기 상태에 설정
                if (productData.mainImageUrl) {
                    setMainImagePreview(getAbsoluteImageUrl(productData.mainImageUrl));
                } else {
                    setMainImagePreview(null); // 대표 이미지 URL이 없을 경우 null 설정 명시적으로
                }

                if (productData.productImgList) {
                    const detailImageUrls = productData.productImgList
                        .filter(img => img.imageType === '상세')
                        .sort((a, b) => a.imageIndex - b.imageIndex)
                        .map(img => getAbsoluteImageUrl(img.imageUrl));

                    // ✅ detailImagePreviews 배열 길이를 4로 맞춤
                    const paddedDetailImagePreviews = Array(4).fill(null);
                    detailImageUrls.forEach((url, index) => {
                        if (index < 4) {
                            paddedDetailImagePreviews[index] = url;
                        }
                    });
                    setDetailImagePreviews(paddedDetailImagePreviews);
                } else {
                    setDetailImagePreviews(Array(4).fill(null)); // 상세 이미지 리스트가 없을 경우 null로 채움
                }


            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
                setSnackbarMessage("상품 정보를 불러오는 중 오류가 발생했습니다.");
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId, token, dispatch]);

    useEffect(() => {
        if (selectedCategories?.length > 0) {
            setProduct(prev => ({
                ...prev,
                categoryIds: selectedCategories.map(cat => cat.id),
            }));
        }
    }, [selectedCategories]);

    useEffect(() => {
        if (product.ingredients && ingredients.length > 0) {
            const selectedIds = ingredients
                .filter(ing => product.ingredients.includes(ing.ingredientName))
                .map(ing => ing.id);
            setProduct(prev => ({ ...prev, ingredientIds: selectedIds }));
        }
    }, [product.ingredients, ingredients]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: (name === 'price' || name === 'stock') ? Number(value) : value,
        }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        setMainImageFile(file);
        if (file) {
            setMainImagePreview(URL.createObjectURL(file));
        } else {
            setMainImagePreview(null);
        }
    };

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

    const handleMainImageDelete = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}products/${productId}/images?imageType=대표`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('대표 이미지 삭제 실패');
            }

            setMainImageFile(null);
            setMainImagePreview(null);
            setSnackbarMessage('대표 이미지가 삭제되었습니다.');
            setSnackbarOpen(true);

        } catch (error) {
            console.error("Error deleting main image:", error);
            setSnackbarMessage('대표 이미지 삭제 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    };

    const handleDetailImageDelete = async (indexToDelete) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}products/${productId}/images?imageType=상세&imageIndex=${indexToDelete + 1}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
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
            setSnackbarMessage('상세 이미지가 삭제되었습니다.');
            setSnackbarOpen(true);

        } catch (error) {
            console.error("Error deleting detail image:", error);
            setSnackbarMessage('상세 이미지 삭제 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    };

    const handleIngredientChange = (e) => {
        const selectedIngredients = e.target.value;
        setProduct(prev => ({ ...prev, ingredientIds: selectedIngredients }));

        if (selectedIngredients.length === 0) {
            dispatch(clearSelectedCategories());
            return;
        }

        dispatch(fetchCategoriesByIngredient(selectedIngredients));
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleSubmitConfirm = async () => {
        setDialogOpen(false);
        await handleSubmitAction();
    };

    const handleSubmitAction = async () => {
        const formData = new FormData();

        const productData = {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            active: product.active,
            ingredientIds: product.ingredientIds
        };
        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        if (mainImageFile) {
            formData.append('mainImageFile', mainImageFile);
        }

        detailImageFiles.forEach((file, index) => {
            if (file) {
                formData.append(`detailImageFiles`, file);
            }
        });

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`상품 업데이트 실패: ${response.status}`);
            }

            setSnackbarMessage('상품이 성공적으로 업데이트되었습니다.');
            setSnackbarOpen(true);
            setTimeout(() => {
                navigate('/adminPage/products');
            }, 1000);
        } catch (error) {
            console.error('Error updating product:', error);
            setSnackbarMessage('상품 업데이트 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Paper
            elevation={2}
            sx={{
                padding: '24px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                maxWidth: '800px',
                margin: '24px auto',
                boxSizing: 'border-box',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                        fontWeight: 600,
                        color: '#1a237e',
                    }}
                >
                    상품 수정
                </Typography>
            </Box>
            <Card variant="outlined" sx={{ mb: 3, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Box component="form" onSubmit={(e) => {
                        e.preventDefault();
                        setDialogOpen(true);
                    }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="상품명"
                            name="name"
                            value={product.name}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                            variant="outlined"
                        />

                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel>영양성분</InputLabel>
                            <Select
                                multiple
                                value={product.ingredientIds || []}
                                onChange={handleIngredientChange}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const ingredient = ingredients.find(ing => ing.id === value);
                                            return ingredient ? <Chip key={value} label={ingredient.ingredientName} /> : null;
                                        })}
                                    </Box>
                                )}
                            >
                                 {Array.isArray(ingredients) && ingredients.length > 0 ? (
                                    ingredients.map(ing => (
                                        <MenuItem key={ing.id} value={ing.id}>
                                            {ing.ingredientName}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>영양성분을 불러오는 중...</MenuItem>
                                )}
                            </Select>
                        </FormControl>

                         <Box sx={{ mt: 2, mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>선택된 카테고리</Typography>
                            {selectedCategories.length > 0 ? (
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {selectedCategories.map((category, index) => (
                                        <Chip key={index} label={category.name} variant="outlined" />
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="textSecondary">선택된 카테고리가 없습니다.</Typography>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            label="가격"
                            name="price"
                            type="number"
                            value={product.price}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="재고"
                            name="stock"
                            type="number"
                            value={product.stock}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="상품 상세 내용"
                            name="description"
                            value={product.description}
                            onChange={handleInputChange}
                            required
                            multiline
                            rows={4}
                            margin="normal"
                            variant="outlined"
                        />

                        {/* 대표 이미지 영역 */}
                        <Box sx={{ mt: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>대표 이미지</Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                상품을 대표하는 이미지를 선택해주세요.
                            </Typography>
                            <div className="image-upload-box" style={{ border: '1px dashed #ced4da', borderRadius: '4px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                                <input
                                    className="file-input"
                                    type="file"
                                    name="mainImageFile"
                                    onChange={handleMainImageChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="main-image-input"
                                />
                                <label htmlFor="main-image-input">
                                    {mainImagePreview ? (
                                        <Box position="relative" display="inline-block">
                                            <img className="image-preview" src={mainImagePreview} alt="대표 이미지 미리보기" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
                                            <IconButton
                                                onClick={handleMainImageDelete}
                                                sx={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                p: 2,
                                                border: '1px dashed grey',
                                                borderRadius: 1,
                                                textAlign: 'center',
                                                color: 'grey.600',
                                            }}
                                        >
                                            대표 이미지 선택/변경
                                        </Box>
                                    )}
                                </label>
                            </div>
                        </Box>

                        {/* 상세 이미지 영역 */}
                        <Box sx={{ mt: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>상세 이미지 (추가)</Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                상품 상세 정보를 보여주는 이미지를 추가해주세요. (최대 4장)
                            </Typography>
                            <Grid container spacing={2}>
                                {detailImagePreviews.map((previewUrl, index) => (
                                    previewUrl &&
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                        <div className="image-upload-box" style={{ border: '1px dashed #ced4da', borderRadius: '4px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                                            <input
                                                className="file-input"
                                                type="file"
                                                name={`detailImageFile${index + 1}`}
                                                onChange={(e) => handleDetailImageChange(e, index)}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                id={`detail-image-input-${index}`}
                                            />
                                            <label htmlFor={`detail-image-input-${index}`}>
                                                <Box position="relative" display="inline-block">
                                                    <img className="image-preview" src={previewUrl} alt={`상세 이미지 미리보기 ${index + 1}`} style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '4px' }} />
                                                    <IconButton
                                                        onClick={() => handleDetailImageDelete(index)}
                                                        sx={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </label>
                                        </div>
                                    </Grid>
                                ))}
                                {[...Array(4 - detailImagePreviews.filter(preview => preview).length)].map((_, index) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={`empty-${index}`}>
                                        <div className="image-upload-box" style={{ border: '1px dashed #ced4da', borderRadius: '4px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                                            <input
                                                className="file-input"
                                                type="file"
                                                name={`detailImageFile${detailImagePreviews.filter(preview => preview).length + index + 1}`}
                                                onChange={(e) => handleDetailImageChange(e, detailImagePreviews.filter(preview => preview).length + index)}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                id={`detail-image-input-${detailImagePreviews.filter(preview => preview).length + index}`}
                                            />
                                            <label htmlFor={`detail-image-input-${detailImagePreviews.filter(preview => preview).length + index}`}>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        border: '1px dashed grey',
                                                        borderRadius: 1,
                                                        textAlign: 'center',
                                                        color: 'grey.600',
                                                    }}
                                                >
                                                    상세 이미지 추가
                                                </Box>
                                            </label>
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
                                onChange={handleInputChange}
                                label="상품 활성화"
                            >
                                <MenuItem value={true}>활성화</MenuItem>
                                <MenuItem value={false}>비활성화</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Button type="submit" variant="contained" color="primary" sx={{ textTransform: 'none' }}>저장</Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate('/adminPage/products')}
                                sx={{ textTransform: 'none' }}
                            >
                                취소
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Snackbar for notifications */}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleCloseSnackbar}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />

            {/* Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    상품 수정
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        상품 정보를 수정하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubmitConfirm} sx={{ color: '#29B6F6' }} autoFocus>
                        확인
                    </Button>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: '#EF5350' }}>
                        취소
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default EditProduct;