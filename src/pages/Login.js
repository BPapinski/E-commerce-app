import "./styles/style.css";
import "./styles/reset.css";
import Header from "../Components/Header";
import Subheader from "../Components/Subheader";
import Sidebar from "../Components/Sidebar";

export default function Login() {
  return (
    <div className="container">
      <Header />
      
      <Subheader/>
      
      {/* Main content */}
      <div className="main">
        <h1>LOGIN PAGE</h1>
      </div>
    </div>
  );
}
