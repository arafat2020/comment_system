import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AiOutlineHeart, AiFillHeart, AiOutlineComment, AiOutlineDelete, AiOutlineDislike, AiFillDislike } from 'react-icons/ai';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { startTransition } from 'react';

import type { Post, OptimisticAction } from '../../types';

interface PostItemProps {
    post: Post;
    addOptimisticAction?: (action: OptimisticAction) => void;
    onUpdate?: (updatedData: Post) => void;
    onDelete?: (id: string) => void;
}

const PostItem = ({ post, addOptimisticAction, onUpdate, onDelete }: PostItemProps) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const navigate = useNavigate();

    const currentUserId = user?._id;

    const isLiked = currentUserId && post.likes.some((like) =>
        (typeof like === 'string' ? like : like._id) === currentUserId
    );

    const isDisliked = currentUserId && (post.dislikes || []).some((dislike) =>
        (typeof dislike === 'string' ? dislike : dislike._id) === currentUserId
    );

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !addOptimisticAction || !currentUserId) return;

        startTransition(async () => {
            addOptimisticAction({
                type: 'like',
                payload: {
                    postId: post._id,
                    userId: currentUserId,
                    username: user.username
                }
            });

            try {
                const response = await api.put(`/posts/${post._id}/like`);
                if (onUpdate) onUpdate(response.data);
            } catch (error) {
                console.error('Failed to like post', error);
            }
        });
    };

    const handleDislike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !addOptimisticAction || !currentUserId) return;

        startTransition(async () => {
            addOptimisticAction({
                type: 'dislike',
                payload: {
                    postId: post._id,
                    userId: currentUserId,
                    username: user.username
                }
            });

            try {
                const response = await api.put(`/posts/${post._id}/dislike`);
                if (onUpdate) onUpdate(response.data);
            } catch (error) {
                console.error('Failed to dislike post', error);
            }
        });
    };

    const handlePostClick = () => {
        navigate(`/posts/${post._id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId || !addOptimisticAction || !onDelete) return;

        if (window.confirm('Are you sure you want to delete this post?')) {
            startTransition(async () => {
                addOptimisticAction({
                    type: 'delete',
                    payload: { id: post._id }
                });

                try {
                    await api.delete(`/posts/${post._id}`);
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
                {currentUserId === post.author._id && (
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
                <button
                    className={`action-btn ${isDisliked ? 'disliked' : ''}`}
                    onClick={handleDislike}
                >
                    {isDisliked ? <AiFillDislike /> : <AiOutlineDislike />}
                    <span>{(post.dislikes || []).length}</span>
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
