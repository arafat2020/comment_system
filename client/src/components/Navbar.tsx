import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AiOutlineHome, AiOutlineUser, AiOutlineLogin, AiOutlineLogout, AiFillHome } from 'react-icons/ai';
import { BsTwitter } from 'react-icons/bs';

const Navbar = () => {
    const { user, logout } = useAuth();
    const API_URL = 'http://localhost:5000';
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/"><BsTwitter size={30} /></Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                    {location.pathname === '/' ? <AiFillHome size={26} /> : <AiOutlineHome size={26} />}
                    <span>Home</span>
                </Link>
                {user ? (
                    <>
                        {/* Placeholder for Profile link if we had a profile page */}
                        <Link to="/profile">
                            <AiOutlineUser size={26} />
                            <span>Profile</span>
                        </Link>
                        <button onClick={logout}>
                            <AiOutlineLogout size={26} />
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">
                            <AiOutlineLogin size={26} />
                            <span>Login</span>
                        </Link>
                        <Link to="/register">
                            <AiOutlineUser size={26} />
                            <span>Register</span>
                        </Link>
                    </>
                )}
            </div>

            {user && (
                <Link to="/profile" className="user-info" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img
                        src={user?.avatarUrl ? `${API_URL}${user.avatarUrl}` : '/default-avatar.svg'}
                        alt="avatar"
                        className="nav-avatar"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{user.username}</span>
                        <span style={{ color: '#536471', fontSize: '14px' }}>@{user.username}</span>
                    </div>
                </Link>
            )}
        </nav>
    );
};

export default Navbar;
