import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndexPage from "./pages/IndexPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);