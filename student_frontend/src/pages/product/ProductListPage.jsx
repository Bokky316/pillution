import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Snackbar } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { fetchProducts } from "../../features/product/productApi";

export default function ProductListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, totalRows, loading, error } = useSelector(state => state.products);
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");

    useEffect(() => {
        console.log("📌 fetchProducts 호출!", paginationModel);
        dispatch(fetchProducts({page: paginationModel.page || 0, size: paginationModel.pageSize || 10 }));
    }, [dispatch, paginationModel]);

    const columns = [
        { field: "id", headerName: "ID", flex: 1 },
        {
            field: "name",
            headerName: "상품명",
            flex: 2,
            renderCell: (params) => (
                <Link to={`/viewProduct/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {params.value}
                </Link>
            ),
        },
        { field: "price", headerName: "가격", flex: 1 },
        { field: "stock", headerName: "재고", flex: 1 },
        { field: "active", headerName: "활성화 여부", flex: 1, type: "boolean" },
    ];
console.log("📢 Redux에서 가져온 products:", products); // Redux 상태 확인
    return (
        <div style={{ height: 700, width: "100%" }}>
            <DataGrid
                rows={products}m
                columns={columns}
                rowCount={totalRows}
                loading={loading}
                paginationMode="server"
                pageSizeOptions={[5, 10, 20]}
                paginationModel={paginationModel}
                onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                disableRowSelectionOnClick
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />

            <Button variant="contained" onClick={() => navigate("/addProduct")}>
                상품 등록
            </Button>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
