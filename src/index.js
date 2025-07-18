import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

// Importuj strony
import IndexPage from "./pages/IndexPage";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import ProductPage from "./pages/ProductPage";
import NewProductForm from "./pages/NewProductForm";
import Cart from "./pages/Cart";
import EditProductForm from "./pages/editProductForm";
import UserProducts from "./pages/UserProducts";
import Orders from "./pages/Orders";
import Favourites from "./pages/Favourites";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/add-new-product" element={<NewProductForm />} />
            <Route path="/cart" element={<Cart/>}/>
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/edit-product/:productId" element={<EditProductForm />} />
            <Route path="/myproducts" element={<UserProducts/>}/>
            <Route path="/orders" element={<Orders/>}/>
            <Route path="/favourites" element={<Favourites/>}/>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
