import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AiOutlineHeart, AiFillHeart, AiOutlineComment } from 'react-icons/ai';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

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

const PostItem = ({ post }: { post: Post }) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const [likes, setLikes] = useState(post.likes);
    const navigate = useNavigate();

    const isLiked = user && likes.some((like: any) =>
        (typeof like === 'string' ? like : like._id) === user._id
    );

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await api.put(`/posts/${post._id}/like`);
            setLikes(res.data.likes);
        } catch (error) {
            console.error('Failed to like post', error);
        }
    };

    const handlePostClick = () => {
        navigate(`/posts/${post._id}`);
    };

    return (
        <div className="post-item" onClick={handlePostClick}>
            <div className="post-header">
                <div className="author-info">
                    <img
                        src={post.author.avatarUrl ? `${API_URL}${post.author.avatarUrl}` : '/default-avatar.png'}
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
                    <span>{likes.length}</span>
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
