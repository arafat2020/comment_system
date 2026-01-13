import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AiOutlineHeart, AiFillHeart, AiOutlineComment, AiOutlineDelete } from 'react-icons/ai';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { startTransition } from 'react';

interface Post {
    _id: string;
    content: string;
    imageUrl?: string;
    author: {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
    likes: Array<{ _id: string; username: string } | string>;
    createdAt: string;
}

interface PostItemProps {
    post: Post;
    addOptimisticAction?: (action: any) => void;
    onUpdate?: (updatedData: any) => void;
    onDelete?: (id: string) => void;
}

const PostItem = ({ post, addOptimisticAction, onUpdate, onDelete }: PostItemProps) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const navigate = useNavigate();

    const isLiked = user && post.likes.some((like: any) =>
        (typeof like === 'string' ? like : like._id) === user._id
    );

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !addOptimisticAction) return;

        startTransition(async () => {
            // Trigger optimistic like toggle
            addOptimisticAction({
                type: 'like',
                payload: {
                    postId: post._id,
                    userId: user._id,
                    username: user.username
                }
            });

            try {
                const response = await api.put(`/posts/${post._id}/like`);
                // Update the real state immediately to prevent reversion when transition ends
                if (onUpdate) {
                    onUpdate(response.data);
                }
            } catch (error) {
                console.error('Failed to like post', error);
            }
        });
    };

    const handlePostClick = () => {
        navigate(`/posts/${post._id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !addOptimisticAction || !onDelete) return;

        if (window.confirm('Are you sure you want to delete this post?')) {
            startTransition(async () => {
                // Trigger optimistic delete
                addOptimisticAction({
                    type: 'delete',
                    payload: { id: post._id }
                });

                try {
                    await api.delete(`/posts/${post._id}`);
                    // Update the real state immediately
                    onDelete(post._id);
                } catch (error) {
                    console.error('Failed to delete post', error);
                }
            });
        }
    };

    return (
        <div className="post-item" onClick={handlePostClick}>
            <div className="post-header">
                <div className="author-info">
                    <img
                        src={post.author.avatarUrl ? `${API_URL}${post.author.avatarUrl}` : '/default-avatar.svg'}
                        alt="avatar"
                        className="avatar"
                    />
                    <div className="author-details">
                        <span className="username">{post.author.username}</span>
                        <span className="timestamp">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
                {user?._id === post.author._id && (
                    <button className="delete-post-btn" onClick={handleDelete} title="Delete post">
                        <AiOutlineDelete />
                    </button>
                )}
            </div>

            <div className="post-content">
                <p>{post.content}</p>
                {post.imageUrl && (
                    <img
                        src={`${API_URL}${post.imageUrl}`}
                        alt="post content"
                        className="post-image"
                    />
                )}
            </div>

            <div className="post-actions">
                <button
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
                    <span>{post.likes.length}</span>
                </button>
                <Link
                    to={`/posts/${post._id}`}
                    className="action-btn"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AiOutlineComment />
                    <span>Comments</span>
                </Link>
            </div>
        </div>
    );
};

export default PostItem;
