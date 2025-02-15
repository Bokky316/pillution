import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { API_URL } from '../../../constant';
import { useNavigate } from 'react-router-dom';
import '@/styles/AddProduct.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesByIngredient } from '@features/product/productApi';
import { clearSelectedCategories } from '@/redux/productSlice';

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

    const [images, setImages] = useState({
        mainImage: null,
    });
    const [imagePreviews, setImagePreviews] = useState({
        mainImage: null,
    });
    // 카테고리 목록을 저장할 state
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);  // 영양성분 목록 저장


    useEffect(() => {
        if (selectedCategories?.length > 0) { // ✅ undefined 방지
            setProduct(prev => ({
                ...prev,
                categoryIds: selectedCategories.map(cat => cat.id),
            }));
        }
    }, [selectedCategories]);

    useEffect(() => {
        console.log("🔍 [DEBUG] fetchIngredients 실행!");
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log("🔍 [DEBUG] 요청 URL:", `${API_URL}ingredients`);

            const response = await fetch(`${API_URL}ingredients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('영양성분 목록을 불러오는 데 실패했습니다.');

            const data = await response.json();
            console.log("✅ [DEBUG] API 응답 데이터:", data);

            setIngredients(Array.isArray(data) ? data : []);
            console.log("✅ [DEBUG] 저장된 영양성분:", ingredients);  // ⚠️ 주의: 상태 업데이트 직후에는 반영 안 될 수도 있음!

        } catch (error) {
            console.error("❌ [ERROR] 영양성분 데이터 로딩 실패:", error);
            alert(error.message);
        }
    };

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
        ...prev,
        [name]: (name === 'price' || name === 'stock') ? Number(value) : value,
        }));
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('imageFile', file);

        const response = await fetch(`${API_URL}products/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('이미지 업로드에 실패했습니다.');
        }

        const data = await response.json();
        return data.imageUrl; // 업로드된 이미지 URL 반환
    };

    const handleCategoryChange = (e) => {
        const { value } = e.target;
        setProduct(prev => ({
            ...prev,
            categoryIds: value
        }));
    };

    const handleIngredientChange = (e) => {
            const selectedIngredients = e.target.value;
            setProduct(prev => ({ ...prev, ingredientIds: selectedIngredients }));

            if (selectedIngredients.length === 0) {
                dispatch(clearSelectedCategories()); // 선택된 카테고리 초기화
                return;
            }

            dispatch(fetchCategoriesByIngredient(selectedIngredients)); // API 요청
        };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setImages(prev => ({
                ...prev,
                [name]: files[0]
            }));
            setImagePreviews(prev => ({
                ...prev,
                [name]: URL.createObjectURL(files[0])
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 이미지 업로드
            let imageUrl = '';
            if (images.mainImage) {
                imageUrl = await uploadImage(images.mainImage);
            }

            // 상품 데이터 전송
            const productData = { ...product, mainImageUrl: imageUrl };
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`${API_URL}products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('상품 추가에 실패했습니다.');
            }

            const createdProduct = await response.json();

                    // 별도의 카테고리 업데이트 API 호출
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
        <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>상품 추가</h2>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="상품명"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>영양성분</InputLabel>
                    <Select multiple value={product.ingredientIds} onChange={handleIngredientChange}>
                        {Array.isArray(ingredients) && ingredients.length > 0 ? (
                            ingredients.map(ing => (
                                <MenuItem key={ing.id} value={ing.id}>{ing.ingredientName}</MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>영양성분을 불러오는 중...</MenuItem>
                        )}
                    </Select>
                </FormControl>
                <h3>선택된 카테고리</h3>
                {selectedCategories.length > 0 ? (  // ✅ undefined 방지
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
                <Box sx={{ mt: 2 }}>
                    <InputLabel sx={{ mb: 1 }}>상품 이미지</InputLabel>
                    <div className="image-upload-container">
                        <div className="image-upload-box">
                            <input
                                className="file-input"
                                type="file"
                                name="mainImage"
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                            {imagePreviews.mainImage ? (
                                <img className="image-preview" src={imagePreviews.mainImage} alt="Preview" />
                            ) : (
                                <span>상품 이미지 선택</span>
                            )}
                        </div>
                    </div>
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
