import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Snackbar, Grid, Card, CardContent, Typography, CardMedia } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../features/product/productApi";

export default function ProductListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, loading, error } = useSelector((state) => state.products);
    const { isAdmin } = useSelector((state) => state.auth); // Assuming isAdmin is stored in the auth state
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");

    useEffect(() => {
        console.log("📌 fetchProducts 호출!", paginationModel);
        dispatch(fetchProducts({ page: paginationModel.page || 0, size: paginationModel.pageSize || 10 }));
    }, [dispatch, paginationModel]);

    const handleCardClick = (id) => {
        navigate(`/viewProduct/${id}`);
    };

    return (
        <div style={{ padding: "20px" }}>
            <Grid container spacing={3}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card onClick={() => handleCardClick(product.id)} style={{ cursor: "pointer" }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.image || "placeholder.jpg"} // Replace with a placeholder if no image exists
                                alt={product.name}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {product.name}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    {product.price.toLocaleString()}원
                                </Typography>
                                {isAdmin && (
                                    <>
                                        <Typography variant="body2" color="textSecondary">
                                            재고: {product.stock}
                                        </Typography>
                                        <Typography variant="body2" color={product.active ? "green" : "red"}>
                                            {product.active ? "활성화" : "비활성화"}
                                        </Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />

            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Button variant="contained" onClick={() => navigate("/addProduct")}>상품 등록</Button>
            </div>

            {loading && <p>로딩 중...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
