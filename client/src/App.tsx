import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/HomePage';
import PostDetails from './pages/PostDetails';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/posts/:id" element={<PostDetails />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </main>
          <Toaster richColors position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
