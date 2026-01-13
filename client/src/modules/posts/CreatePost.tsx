import { useState, startTransition } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { BsImage, BsEmojiSmile } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';

const CreatePost = ({
    onPostCreated,
    addOptimisticAction
}: {
    onPostCreated: (newPost: any) => void,
    addOptimisticAction?: (payload: any) => void
}) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        startTransition(async () => {
            const optimisticId = `temp-${Date.now()}`;
            const optimisticPost = {
                _id: optimisticId,
                content,
                imageUrl: preview, // Use local blob URL for optimistic image
                author: {
                    _id: user._id,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                },
                likes: [],
                createdAt: new Date().toISOString(),
                isOptimistic: true, // Marker for styling if needed
            };

            // Trigger optimistic action
            if (addOptimisticAction) {
                addOptimisticAction({ type: 'add', payload: optimisticPost });
            }

            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            const previousContent = content;
            const previousPreview = preview;
            const previousImage = image;

            setContent('');
            setImage(null);
            setPreview(null);
            setLoading(true);

            try {
                const response = await api.post('/posts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Post created!');
                onPostCreated(response.data);
            } catch (error) {
                console.error('Failed to create post', error);
                toast.error('Failed to create post');
                // Rollback local form state
                setContent(previousContent);
                setPreview(previousPreview);
                setImage(previousImage);
            } finally {
                setLoading(false);
            }
        });
    };

    return (
        <div className="create-post-container">
            <div className="post-avatar">
                <img
                    src={user?.avatarUrl ? `${API_URL}${user.avatarUrl}` : '/default-avatar.svg'}
                    alt="avatar"
                    className="avatar"
                />
            </div>
            <form onSubmit={handleSubmit} className="post-form">
                <textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="What's happening?"
                    maxLength={280}
                    className="post-textarea"
                    rows={1}
                />

                {preview && (
                    <div className="image-preview">
                        <img src={preview} alt="preview" />
                        <button type="button" onClick={removeImage} className="remove-image-btn">
                            <AiOutlineClose />
                        </button>
                    </div>
                )}

                <div className="post-form-footer">
                    <div className="form-tools">
                        <label className="tool-btn" title="Add Image">
                            <BsImage size={20} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                hidden
                            />
                        </label>
                        <button type="button" className="tool-btn" disabled>
                            <BsEmojiSmile size={20} />
                        </button>
                    </div>

                    <div className="right-actions">
                        {content.length > 0 && (
                            <span className={`char-count ${content.length > 260 ? 'warning' : ''}`}>
                                {content.length}/280
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="post-submit-btn"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
