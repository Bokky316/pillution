import React from "react";
import { Routes, Route } from "react-router-dom";
import SideBar from "../../features/admin/SideBar";
import MemberManagement from "../../features/admin/member/MemberList";
import EditMember from "../../features/admin/member/EditMember";
import EditProduct from "../../features/admin/product/EditProduct";
import AddProduct from "../../features/admin/product/AddProduct";
import OrderManagement from "../../features/admin/order/OrderList";
import ProductManagement from "../../features/admin/product/ProductList";

const AdminPage = () => {
    return (
        <div className="admin-container">
            <SideBar />
            <div className="admin-content">
                <Routes>
                    <Route path="members" element={<MemberManagement />} />
                    <Route path="members/:memberId/edit" element={<EditMember />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="products/:productId/edit" element={<EditProduct />} />
                    <Route path="products/add" element={<AddProduct />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPage;