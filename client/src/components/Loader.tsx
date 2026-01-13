import './Loader.scss';
interface LoaderProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

const Loader = ({ message = 'Loading...', size = 'medium' }: LoaderProps) => {
    return (
        <div className={`loader-container loader-${size}`}>
            <div className="spinner"></div>
            {message && <p className="loader-message">{message}</p>}
        </div>
    );
};

export default Loader;
