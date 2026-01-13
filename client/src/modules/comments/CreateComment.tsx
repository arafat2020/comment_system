import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CreateCommentProps {
    postId: string;
    parentCommentId?: string;
    onCommentCreated: () => void;
    onCancel?: () => void;
}

const CreateComment = ({ postId, parentCommentId, onCommentCreated, onCancel }: CreateCommentProps) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/comments', {
                content,
                postId,
                parentCommentId,
            });
            setContent('');
            onCommentCreated();
            if (onCancel) onCancel();
        } catch (error) {
            console.error('Failed to create comment', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`create-comment-container ${parentCommentId ? 'reply-mode' : ''}`}>
            {/* Show avatar only for top-level comments or if desired */}
            <div className="comment-avatar">
                <img
                    src={user?.avatarUrl ? `${API_URL}${user.avatarUrl}` : '/default-avatar.svg'}
                    alt="avatar"
                    className="avatar"
                />
            </div>

            <form onSubmit={handleSubmit} className="create-comment-form">
                <div className="input-wrapper">
                    <textarea
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            // Auto-resize
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        placeholder={parentCommentId ? 'Post your reply' : 'Post your reply'}
                        required
                        className="comment-textarea"
                        rows={1}
                    />
                </div>

                <div className="form-actions">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="cancel-btn">
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="reply-btn"
                    >
                        {loading ? 'Posting...' : 'Reply'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateComment;
