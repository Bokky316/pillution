import { DataGrid } from '@mui/x-data-grid';
import {
  Button, Snackbar, Select, MenuItem, FormControl,
  InputLabel, TextField, Box, IconButton, Paper,
  Typography, Chip, Alert, Card, CardContent, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useState, useEffect } from 'react';
import { API_URL } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import ViewProduct from './ViewProduct';

const ProductList = () => {
  // ... (useState, useEffect, fetch 함수들, handle 함수들, columns는 이전과 동일) ...
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
      const [loading, setLoading] = useState(false);

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
          let url = `${API_URL}products/paged?page=${page}&size=${pageSize}`;

          if (appliedSearchText.trim() !== '') {
            url = `${API_URL}products/search?page=${page}&size=${pageSize}&field=${encodeURIComponent(appliedSearchField)}&query=${encodeURIComponent(appliedSearchText)}`;
          } else if (filterType === '카테고리' && selectedCategory) {
            url = `${API_URL}products/filter-by-category/paged?categoryId=${selectedCategory}&page=${page}&size=${pageSize}`;
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
            if (data && data.content && Array.isArray(data.content)) {
              setProducts(data.content);
              setTotalRows(data.totalElements);
            } else {
              if (Array.isArray(data)) {
                setProducts(data);
                setTotalRows(data.length);
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

        // DataGrid 컬럼 설정 - 더 현대적인 디자인으로 수정
        const columns = [
          { field: 'id', headerName: 'ID', flex: 0.5, minWidth: 50 },
          {
            field: 'name',
            headerName: '상품명',
            flex: 1.5,
            minWidth: 150,
            renderCell: (params) => (
              <Typography
                variant="body2"
                component="span"
                sx={{
                  color: '#1976d2',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => handleOpenModal(params.row.id)}
              >
                {params.row.name}
              </Typography>
            )
          },
          {
            field: 'price',
            headerName: '가격',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
              <Typography variant="body2">
                {new Intl.NumberFormat('ko-KR').format(params.row.price)}원
              </Typography>
            )
          },
          {
            field: 'category',
            headerName: '카테고리',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
              params.row.categories ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {params.row.categories.map((cat, index) => (
                    <Chip
                      key={index}
                      label={cat}
                      size="small"
                      sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              ) : '-'
            )
          },
          {
            field: 'stock',
            headerName: '재고',
            flex: 0.7,
            minWidth: 80,
            renderCell: (params) => (
              <Typography
                variant="body2"
                sx={{
                  color: params.row.stock < 10 ? '#d32f2f' : 'inherit',
                  fontWeight: params.row.stock < 10 ? 'bold' : 'normal'
                }}
              >
                {params.row.stock}
              </Typography>
            )
          },
          {
            field: 'edit',
            headerName: '수정',
            flex: 0.8,
            minWidth: 100,
            renderCell: (params) => (
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#3f51b5',
                  color: '#3f51b5',
                  '&:hover': {
                    backgroundColor: 'rgba(63, 81, 181, 0.08)',
                    borderColor: '#3f51b5',
                  },
                }}
                onClick={() => navigate(`/adminPage/products/${params.row.id}/edit`)}
              >
                수정
              </Button>
            )
          },
          {
            field: 'manage',
            headerName: '관리',
            flex: 0.8,
            minWidth: 100,
            renderCell: (params) => {
              const isActive = params.row.active;
              return (
                <Button
                  variant={isActive ? "outlined" : "contained"}
                  size="small"
                  sx={{
                    ...(isActive
                      ? {
                          borderColor: '#d32f2f',
                          color: '#d32f2f',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            borderColor: '#d32f2f',
                          }
                        }
                      : {
                          backgroundColor: '#4caf50',
                          '&:hover': {
                            backgroundColor: '#388e3c',
                          }
                        }
                    )
                  }}
                  onClick={() => toggleProductStatus(params.row.id, params.row.active)}
                >
                  {isActive ? '비활성화' : '활성화'}
                </Button>
              );
            }
          }
        ];

        // 향상된 스타일 정의
        return (
          <Paper
            elevation={2}
            sx={{
              padding: '24px',
                  backgroundColor: '#ffffff',
                  width: '100%',  // 100%를 유지하지만
                  maxWidth: '100%', // 최대 너비를 100%로 제한
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxSizing: 'border-box', // 패딩을 너비에 포함
                }}
          >
            {/* 헤더 섹션 */}
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
                상품 관리
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  backgroundColor: '#3f51b5',
                  '&:hover': {
                    backgroundColor: '#303f9f',
                  },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
                onClick={() => navigate('/adminPage/products/add')}
              >
                상품 등록
              </Button>
            </Box>

            {/* 필터 및 검색 카드 */}
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* 필터 라벨 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FilterListIcon sx={{ mr: 1, color: '#3f51b5' }}/>
                  <Typography variant="subtitle1" fontWeight={500}>필터 및 검색</Typography>
                </Box>

                {/* 필터 영역 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 120, flex: { sm: '0 0 auto' } }}
                  >
                    <InputLabel id="filter-type-label">분류 기준</InputLabel>
                    <Select
                      labelId="filter-type-label"
                      label="분류 기준"
                      value={filterType}
                      onChange={(e) => handleFilterTypeChange(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3f51b5',
                          },
                        },
                      }}
                    >
                      <MenuItem value="전체">전체</MenuItem>
                      <MenuItem value="카테고리">카테고리</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{
                      minWidth: 120,
                      flex: { sm: '0 0 auto' },
                      visibility: filterType === '카테고리' ? 'visible' : 'hidden',
                      display: filterType === '카테고리' ? 'block' : { xs: 'none', sm: 'block' }
                    }}
                    disabled={filterType !== '카테고리'}
                  >
                    <InputLabel id="category-select-label">카테고리</InputLabel>
                    <Select
                      labelId="category-select-label"
                      label="카테고리"
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      sx={{ minWidth: 120,
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3f51b5',
                          },
                        },
                      }}
                    >
                      <MenuItem value="">선택</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* 검색 영역 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    gap: 2,
                  }}
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 120, flex: { xs: '1', sm: '0 0 auto' } }}
                  >
                    <InputLabel id="search-field-label">검색 유형</InputLabel>
                    <Select
                      labelId="search-field-label"
                      label="검색 유형"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3f51b5',
                          },
                        },
                      }}
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
                    size="small"
                    sx={{
                      flex: { xs: '1', sm: '1 1 auto' },
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#3f51b5',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          sx={{
                            color: '#3f51b5',
                            p: '4px',
                          }}
                          onClick={handleSearchClick}
                          edge="end"
                        >
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchClick();
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 결과 요약 정보 표시 */}
            {appliedSearchText && (
              <Box sx={{ mb: 2 }}>
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: '8px',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body2">
                    <strong>'{appliedSearchField}'</strong>에서
                    <strong>'{appliedSearchText}'</strong> 검색 결과 :
                    <strong> {totalRows}</strong>개의 상품 찾음
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* 데이터 그리드 */}
            <DataGrid
              rows={products}
              columns={columns}
              rowCount={totalRows}
              paginationMode="server"
              pageSizeOptions={[5, 10, 20]}
              paginationModel={paginationModel}
              onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
              disableRowSelectionOnClick
              loading={loading}
              sx={{
                borderRadius: '8px',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px 8px 0 0',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f9f9f9',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '0 0 8px 8px'
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: '#fff'
                },
                '& .MuiTablePagination-root': {
                  color: '#444',
                },
                '& .MuiButton-root': {
                  textTransform: 'none'
                }
              }}
            />

            {/* 스낵바 알림 */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity="success"
                sx={{
                  width: '100%',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>

            {/* 상품 상세보기 모달 */}
            <ViewProduct
              productId={selectedProductId}
              open={modalOpen}
              onClose={() => { setModalOpen(false); setSelectedProductId(null); }}
            />
          </Paper>
        );
      };

export default ProductList;