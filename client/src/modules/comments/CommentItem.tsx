import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AiOutlineHeart, AiFillHeart, AiOutlineDelete, AiOutlineMessage, AiOutlineEdit } from 'react-icons/ai';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CreateComment from './CreateComment';

interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
    likes: Array<{ _id: string; username: string } | string>;
    createdAt: string;
    parentComment?: string;
}

interface CommentItemProps {
    comment: Comment;
    allComments: Comment[];
    postId: string;
    onUpdate: () => void;
}

const CommentItem = ({ comment, allComments, postId, onUpdate }: CommentItemProps) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    // Find replies to this comment
    const replies = allComments.filter(c => c.parentComment === comment._id);

    // Check like status
    const isLiked = user && comment.likes.some((like: any) =>
        (typeof like === 'string' ? like : like._id) === user._id
    );

    const handleLike = async () => {
        try {
            await api.put(`/comments/${comment._id}/like`);
            onUpdate();
        } catch (error) {
            console.error('Failed to like comment', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this comment?')) {
            try {
                await api.delete(`/comments/${comment._id}`);
                onUpdate();
            } catch (error) {
                console.error('Failed to delete comment', error);
            }
        }
    };

    const handleEdit = async () => {
        try {
            await api.put(`/comments/${comment._id}`, { content: editContent });
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to edit comment', error);
        }
    };

    return (
        <div className="comment-item">
            <div className="comment-main">
                <div className="comment-avatar-container">
                    <img
                        src={comment.author.avatarUrl ? `${API_URL}${comment.author.avatarUrl}` : '/default-avatar.svg'}
                        alt="avatar"
                        className="avatar-small"
                    />
                    {/* Vertical line for thread visualization if there are replies */}
                    {replies.length > 0 && <div className="thread-line"></div>}
                </div>

                <div className="comment-content">
                    <div className="comment-header">
                        <span className="username">{comment.author.username}</span>
                        <span className="timestamp">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    {isEditing ? (
                        <div className="edit-comment-form">
                            <textarea
                                value={editContent}
                                onChange={(e) => {
                                    setEditContent(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                className="comment-textarea"
                                rows={1}
                            />
                            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '5px' }}>
                                <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                                <button onClick={handleEdit} className="reply-btn">Save</button>
                            </div>
                        </div>
                    ) : (
                        <p>{comment.content}</p>
                    )}

                    <div className="comment-actions">
                        <button
                            className={`action-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
                            <span>{comment.likes.length || ''}</span>
                        </button>
                        <button className="action-btn" onClick={() => setIsReplying(!isReplying)}>
                            <AiOutlineMessage />
                        </button>
                        {user && user._id === comment.author._id && (
                            <>
                                <button className="action-btn" onClick={() => { setIsEditing(true); setEditContent(comment.content); }}>
                                    <AiOutlineEdit />
                                </button>
                                <button className="action-btn delete" onClick={handleDelete}>
                                    <AiOutlineDelete />
                                </button>
                            </>
                        )}
                    </div>

                    {isReplying && (
                        <div className="reply-form-container">
                            <CreateComment
                                postId={postId}
                                parentCommentId={comment._id}
                                onCommentCreated={() => { setIsReplying(false); onUpdate(); }}
                                onCancel={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {replies.length > 0 && (
                <div className="replies-list">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            allComments={allComments}
                            postId={postId}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
