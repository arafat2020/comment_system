import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = () => {
    const { token, loading } = useAuth();

    if (loading) return <Loader message="Authenticating..." size="medium" />;

    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
