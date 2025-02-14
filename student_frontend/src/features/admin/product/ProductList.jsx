import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { API_URL } from "../../../constant";
import { useNavigate } from "react-router-dom";
import ViewProduct from './ViewProduct';


const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [totalRows, setTotalRows] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterType, setFilterType] = useState('전체');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('상품명');
    const [appliedSearchText, setAppliedSearchText] = useState('');
    const [appliedSearchField, setAppliedSearchField] = useState('상품명');
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        if (filterType === '카테고리') {
            fetchCategories();
        } else {
            setCategories([]);
            setSelectedCategory('');
        }
    }, [filterType, token]);

    useEffect(() => {
        fetchProductsData();
    }, [paginationModel, filterType, selectedCategory, appliedSearchText, appliedSearchField]);


    const fetchCategories = () => {
        fetch(`${API_URL}categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('카테고리 조회 실패');
            }
            return response.json();
        })
        .then(data => {
            setCategories(Array.isArray(data) ? data : []);
        })
        .catch(err => {
            console.error("카테고리 조회 실패:", err);
            setCategories([]);
        });
    }
    const fetchProductsData = () => {
        setLoading(true);
        const { page, pageSize } = paginationModel;
        let url = `${API_URL}products/paged?page=${page}&size=${pageSize}`; // 기본 URL (페이징 지원)

        if (appliedSearchText.trim() !== '') {
            url = `${API_URL}products/search?page=${page}&size=${pageSize}&field=${encodeURIComponent(appliedSearchField)}&query=${encodeURIComponent(appliedSearchText)}`;
        } else if (filterType === '카테고리' && selectedCategory) {
            url = `${API_URL}products/filter-by-category/paged?categoryId=${selectedCategory}&page=${page}&size=${pageSize}`; // 페이징 지원 URL
        }

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    setProducts([]);
                    setTotalRows(0);
                    return;
                }
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received product data:', data);

            if (data && data.content && Array.isArray(data.content)) {
                setProducts(data.content);
                setTotalRows(data.totalElements);
            } else {
                // 전체 목록 조회 시, data가 배열일 경우 (Page 객체가 아닐 경우)
                if (Array.isArray(data)) {
                  setProducts(data);
                  setTotalRows(data.length);  // 이 경우 totalRows는 data 배열의 길이
                } else {
                    console.error("Unexpected data format:", data);
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setSnackbarMessage('상품 정보를 가져오는 데 실패했습니다.');
            setSnackbarOpen(true);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const toggleProductStatus = async (id, currentActive) => {
        try {
            const response = await fetch(`${API_URL}products/${id}/toggle-active`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('상태 변경 실패');
            }

            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id
                        ? { ...product, active: !currentActive }
                        : product
                )
            );

            setSnackbarMessage('상품 상태가 변경되었습니다.');
            setSnackbarOpen(true);

        } catch (error) {
            console.error('Error toggling product status:', error);
            setSnackbarMessage('제품 상태 변경에 실패했습니다.');
            setSnackbarOpen(true);
        }
    };

    const handleFilterTypeChange = (newFilterType) => {
        setFilterType(newFilterType);
        setSelectedCategory('');
        setSearchText('');
        setAppliedSearchText('');
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    const handleCategoryChange = (newCategory) => {
        setSelectedCategory(newCategory);
        setSearchText('');
        setAppliedSearchText('');
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    const handleSearchClick = () => {
        if (searchText.trim() !== '') {
            setFilterType('전체');
            setSelectedCategory('');
        }
        setAppliedSearchText(searchText);
        setAppliedSearchField(searchField);
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    const handleOpenModal = (productId) => {
        setSelectedProductId(productId);
        setModalOpen(true);
    };

    const columns = [
        { field: 'id', headerName: 'ID', flex: 1 },
        {
            field: 'name',
            headerName: '상품명',
            flex: 2,
            renderCell: (params) => (
                <Button onClick={() => handleOpenModal(params.row.id)} color="primary">
                    {params.row.name}
                </Button>
            )
        },
        { field: 'price', headerName: '가격', flex: 2 },
        {
            field: 'category',
            headerName: '카테고리',
            flex: 2,
            renderCell: (params) => (
                // null 또는 undefined 체크 추가, categories 배열 존재 여부 확인
                params.row.categories ? params.row.categories.map(c => c).join(', ') : '-'
            )
        },
        { field: 'stock', headerName: '재고', flex: 1 },
        {
            field: 'edit',
            headerName: '수정',
            flex: 1,
            renderCell: (params) => (
                <Button variant="contained" color="primary" onClick={() => navigate(`/adminPage/products/${params.row.id}/edit`)}>
                    수정
                </Button>
            )
        },
        {
            field: 'manage',
            headerName: '관리',
            flex: 1,
            renderCell: (params) => {
                const isActive = params.row.active;
                return (
                    <Button
                        variant="contained"
                        color={isActive ? 'primary' : 'secondary'}
                        onClick={() => toggleProductStatus(params.row.id, params.row.active)}
                    >
                        {isActive ? '비활성화' : '활성화'}
                    </Button>
                );
            }
        }
    ];

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>상품 관리</h3>
                <Button variant="contained" color="primary" onClick={() => navigate('/adminPage/products/add')}>
                    상품 등록
                </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <InputLabel>분류 기준</InputLabel>
                    <Select
                        label="분류 기준"
                        value={filterType}
                        onChange={(e) => {
                            setFilterType(e.target.value);
                            setSelectedCategory('');
                        }}
                    >
                        <MenuItem value="전체">전체</MenuItem>
                        <MenuItem value="카테고리">카테고리</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 150 }} disabled={filterType !== '카테고리'}>
                    <InputLabel>카테고리</InputLabel>
                    <Select
                        label="카테고리"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <MenuItem value="">선택</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <InputLabel>검색 유형</InputLabel>
                    <Select
                        label="검색 유형"
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                    >
                        <MenuItem value="상품명">상품명</MenuItem>
                        <MenuItem value="카테고리">카테고리</MenuItem>
                        <MenuItem value="영양성분">영양성분</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    variant="outlined"
                    label="검색어"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleSearchClick}>
                    검색
                </Button>
            </div>

            <DataGrid
                rows={products}
                columns={columns}
                rowCount={totalRows}
                paginationMode="server"
                pageSizeOptions={[5, 10, 20]}
                paginationModel={paginationModel}
                onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                disableRowSelectionOnClick
                loading={loading} // 로딩 상태 표시
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />

            <ViewProduct
                productId={selectedProductId}
                open={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedProductId(null); }}
            />
        </div>
    );
};

export default ProductList;
