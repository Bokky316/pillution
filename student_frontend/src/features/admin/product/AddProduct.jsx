import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Chip,
    Stack,
    Paper, // Paper 추가
    Grid,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { API_URL } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import '@/styles/AddProduct.css'; // 스타일은 유지
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesByIngredient } from '@features/product/productApi';
import { clearSelectedCategories } from '@/store/productSlice';

const AddProduct = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedCategories = useSelector((state) => state.products.selectedCategories) || [];

    const [product, setProduct] = useState({
        categoryIds: [],
        ingredientIds: [],
        name: '',
        price: '',
        stock: '',
        description: '',
        active: true,
    });

    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [detailImageFiles, setDetailImageFiles] = useState(Array(4).fill(null));
    const [detailImagePreviews, setDetailImagePreviews] = useState(Array(4).fill(null));
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        if (selectedCategories?.length > 0) {
            setProduct(prev => ({
                ...prev,
                categoryIds: selectedCategories.map(cat => cat.id),
            }));
        }
    }, [selectedCategories]);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
      // fetchIngredients 함수 내용 (기존 코드 유지)
      try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`${API_URL}ingredients`, {
              method: 'GET',
              headers: {
                  'Authorization': token ? `Bearer ${token}` : '',
              },
              credentials: 'include'
          });

          if (!response.ok) throw new Error('영양성분 목록을 불러오는 데 실패했습니다.');

          const data = await response.json();
          setIngredients(Array.isArray(data) ? data : []);

      } catch (error) {
          console.error("영양성분 데이터 로딩 실패:", error);
          alert(error.message);
      }
    };

    const handleChange = (e) => {
      // handleChange 함수 내용 (기존 코드 유지)
      const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: (name === 'price' || name === 'stock') ? Number(value) : value,
        }));
    };

    const handleIngredientChange = (e) => {
      // handleIngredientChange 함수 내용 (기존 코드 유지)
      const selectedIngredients = e.target.value;
        setProduct(prev => ({ ...prev, ingredientIds: selectedIngredients }));

        if (selectedIngredients.length === 0) {
            dispatch(clearSelectedCategories());
            return;
        }

        dispatch(fetchCategoriesByIngredient(selectedIngredients));
    };

    const handleMainImageChange = (e) => {
      // handleMainImageChange 함수 내용 (기존 코드 유지)
      const file = e.target.files[0];
        setMainImageFile(file);
        if (file) {
            setMainImagePreview(URL.createObjectURL(file));
        } else {
            setMainImagePreview(null);
        }
    };

    const handleDetailImageChange = (e, index) => {
      // handleDetailImageChange 함수 내용 (기존 코드 유지)
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

    const handleMainImageDelete = () => {
      // handleMainImageDelete 함수 내용 (기존 코드 유지)
      setMainImageFile(null);
        setMainImagePreview(null);
    };

    const handleDetailImageDelete = (indexToDelete) => {
      // handleDetailImageDelete 함수 내용 (기존 코드 유지)
      const newDetailImageFiles = [...detailImageFiles];
        const newDetailImagePreviews = [...detailImagePreviews];

        newDetailImageFiles[indexToDelete] = null;
        newDetailImagePreviews[indexToDelete] = null;

        setDetailImageFiles(newDetailImageFiles);
        setDetailImagePreviews(newDetailImagePreviews);
    };

    const handleSubmit = async (event) => {
        // handleSubmit 함수 내용 (기존 코드 유지)
        event.preventDefault();

        const formData = new FormData();
        const productData = {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            active: product.active,
            ingredientIds: product.ingredientIds,
            categoryIds: product.categoryIds
        };
        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        if (mainImageFile) {
            formData.append('mainImageFile', mainImageFile);
        } else {
            formData.append('mainImageFile', new Blob([], { type: 'image/png' }));
        }

        detailImageFiles.forEach((file, index) => {
            if (file) {
                formData.append(`detailImageFiles`, file);
            }
        });

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`상품 업데이트 실패: ${response.status}`);
            }

            alert('상품이 성공적으로 업데이트되었습니다.');
            navigate('/adminPage/products');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('상품 업데이트 중 오류가 발생했습니다.');
        }
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px', borderRadius: '12px' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}>상품 추가</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="상품명"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                    variant="outlined" // Material-UI 스타일 적용
                />
                <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel>영양성분</InputLabel>
                    <Select
                        multiple
                        value={product.ingredientIds}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    required
                    margin="normal"
                    variant="outlined"
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
                    variant="outlined"
                />
                <Box sx={{ mt: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>대표 이미지</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        상품을 대표하는 이미지를 선택해주세요.
                    </Typography>
                    <div className="image-upload-box">
                        <input
                            className="file-input"
                            type="file"
                            name="mainImageFile"
                            onChange={handleMainImageChange}
                            accept="image/*"
                        />
                        {mainImagePreview ? (
                            <Box position="relative" display="inline-block">
                                <img className="image-preview" src={mainImagePreview} alt="대표 이미지 미리보기" />
                                <IconButton
                                    onClick={handleMainImageDelete}
                                    sx={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ) : (
                            // 이 부분을 좀 더 Material-UI 스타일로 (선택적으로)
                            <Box
                                sx={{
                                    p: 2,
                                    border: '1px dashed grey',
                                    borderRadius: 1,
                                    textAlign: 'center',
                                    color: 'grey.600',
                                }}
                            >
                                대표 이미지 선택
                            </Box>
                        )}
                    </div>
                </Box>

                <Box sx={{ mt: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>상세 이미지 (추가)</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        상품 상세 정보를 보여주는 이미지를 추가해주세요. (최대 4장)
                    </Typography>
                    <Grid container spacing={2}>
                        {[...Array(4)].map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <div className="image-upload-box">
                                    <input
                                        className="file-input"
                                        type="file"
                                        name={`detailImageFile${index + 1}`}
                                        onChange={(e) => handleDetailImageChange(e, index)}
                                        accept="image/*"
                                    />
                                    {detailImagePreviews[index] ? (
                                        <Box position="relative" display="inline-block">
                                            <img
                                                className="image-preview"
                                                src={detailImagePreviews[index]}
                                                alt={`상세 이미지 미리보기 ${index + 1}`}
                                            />
                                            <IconButton
                                                onClick={() => handleDetailImageDelete(index)}
                                                sx={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        // 이 부분도 Material-UI 스타일 (선택적)
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
                    <Button type="submit" variant="contained" color="primary" sx={{ textTransform: 'none' }}>저장</Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate('/adminpage/products')}
                        sx={{ textTransform: 'none' }} // ProductList 버튼 스타일
                    >
                        취소
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default AddProduct;