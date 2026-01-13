import { AiOutlineExclamationCircle } from 'react-icons/ai';
import './ErrorMessage.scss';

interface ErrorMessageProps {
    message: string;
    title?: string;
    onRetry?: () => void;
}

const ErrorMessage = ({
    message,
    title = 'Something went wrong',
    onRetry
}: ErrorMessageProps) => {
    return (
        <div className="error-message-container">
            <div className="error-icon">
                <AiOutlineExclamationCircle />
            </div>
            <h3 className="error-title">{title}</h3>
            <p className="error-text">{message}</p>
            {onRetry && (
                <button className="error-retry-btn" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
