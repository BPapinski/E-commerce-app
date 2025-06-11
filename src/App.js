import './App.css';
import { Outlet } from 'react-router-dom'; // Outlet jest potrzebny, jeśli to komponent layoutu
import { AuthProvider } from './hooks/useAuth'; // Zaimportuj AuthProvider

function App() {
  return (
    <div className="App">
      App
    </div>
  );
}

export default App;
