import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Importuj swoje strony
import IndexPage from "./pages/IndexPage"; // Główna strona
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import ProductPage from "./pages/ProductPage";
import NewProductForm from "./pages/NewProductForm";

// 1. Zdefiniuj obiekt routera za pomocą createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexPage />, // IndexPage jest bezpośrednio elementem dla trasy "/"
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/product/:id",
    element: <ProductPage />,
  },
  {
    path: "/add-new-product",
    element: <NewProductForm />,
  },
  {
    path: "*", // Trasa catch-all
    element: <Navigate to="/" replace />,
  },
]);

// 2. Renderowanie aplikacji za pomocą RouterProvider
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);