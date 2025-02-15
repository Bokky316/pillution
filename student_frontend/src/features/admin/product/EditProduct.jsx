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
} from '@mui/material';
import { API_URL } from "@/utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesByIngredient } from '@features/product/productApi';
import { clearSelectedCategories } from '@/store/productSlice';
import '@/styles/AddProduct.css';

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
        mainImageUrl: '',
        categoryIds: [],
        ingredientIds: [],
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchIngredients();

                const productResponse = await fetch(`${API_URL}products/${productId}/dto`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                });

                if (!productResponse.ok) {
                    const errorData = await productResponse.json();
                    throw new Error(errorData.message || `제품 정보를 가져오는데 실패했습니다.`);
                }

                const productData = await productResponse.json();

                setProduct({
                    name: productData.name || '',
                    description: productData.description || '',
                    price: productData.price || '',
                    stock: productData.stock || '',
                    active: productData.active !== undefined ? productData.active : true,
                    mainImageUrl: productData.mainImageUrl || '',
                    categoryIds: productData.categories ? productData.categories.map(cat => cat.id) : [],
                    ingredientIds: productData.ingredients ? productData.ingredients.map(ing => ing.id) : [],
                });

                if (productData.mainImageUrl) {
                    setImagePreviewUrl(getAbsoluteImageUrl(productData.mainImageUrl));
                }

                // 영양성분에 따른 카테고리 불러오기
                if (productData.ingredients && productData.ingredients.length > 0) {
                    const ingredientIds = productData.ingredients.map(ing => ing.id);
                    dispatch(fetchCategoriesByIngredient(ingredientIds));
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: (name === 'price' || name === 'stock') ? Number(value) : value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
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

    const handleImageDelete = () => {
        setImageFile(null);
        setImagePreviewUrl('');
        setProduct(prev => ({ ...prev, mainImageUrl: '' }));
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        const formData = new FormData();
        formData.append("imageFile", imageFile);

        try {
            const response = await axios.post(`${API_URL}products/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                },
            });
            return response.data.imageUrl;
        } catch (error) {
            console.error("이미지 업로드 실패:", error);
            alert("이미지 업로드에 실패했습니다.");
            return null;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        let uploadedImageUrl = product.mainImageUrl;
        if (imageFile) {
            uploadedImageUrl = await uploadImage();
            if (uploadedImageUrl === null) {
                return;
            }
        }

        const updateData = {
            name: product.name,
            description: product.description,
            price: Number(product.price),
            stock: parseInt(product.stock, 10),
            active: product.active,
            mainImageUrl: uploadedImageUrl,
            ingredientIds: product.ingredientIds,
        };

        try {
            const updateProductResponse = await axios.put(`${API_URL}products/${productId}`, updateData, {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (updateProductResponse.status === 200) {
                const updateCategoryResponse = await axios.put(
                    `${API_URL}products/${productId}/categories`,
                    product.categoryIds,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${token}`
                        },
                        credentials: 'include'
                    }
                );

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
        <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>상품 수정</h2>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="상품명"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>영양성분</InputLabel>
                    <Select
                        multiple
                        value={product.ingredientIds}
                        onChange={handleIngredientChange}
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

                <h3>선택된 카테고리</h3>
                {selectedCategories.length > 0 ? (
                    <ul>
                        {selectedCategories.map((category, index) => (
                            <li key={index}>{category.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p>선택된 카테고리가 없습니다.</p>
                )}

                <TextField
                    fullWidth
                    label="가격"
                    name="price"
                    type="number"
                    value={product.price}
                    onChange={handleInputChange}
                    required
                    margin="normal"
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
                />

                <Box sx={{ mt: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>상품 이미지</InputLabel>
                    <div className="image-upload-container">
                        <div className="image-upload-box">
                            {imagePreviewUrl ? (
                                <>
                                    <img
                                        className="image-preview"
                                        src={imagePreviewUrl}
                                        alt="상품 이미지 미리보기"
                                    />
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleImageDelete}
                                        sx={{ mt: 2 }}
                                    >
                                        이미지 삭제
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <input
                                        className="file-input"
                                        type="file"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <span>상품 이미지 선택</span>
                                </>
                            )}
                        </div>
                    </div>
                </Box>

                <FormControl fullWidth margin="normal">
                    <InputLabel>활성 상태</InputLabel>
                    <Select
                        name="active"
                        value={product.active}
                        onChange={handleInputChange}
                    >
                        <MenuItem value={true}>활성화</MenuItem>
                        <MenuItem value={false}>비활성화</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button type="submit" variant="contained" color="primary">
                        저장
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate('/adminpage/products')}
                    >
                        취소
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default EditProduct;