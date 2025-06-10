import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import ProductPage from "./pages/ProductPage";
import NewProductForm from "./pages/NewProductForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/logout" element={<Logout />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/product/:id" element={<ProductPage/>}/>
        <Route path="/add-new-product" element={<NewProductForm/>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);