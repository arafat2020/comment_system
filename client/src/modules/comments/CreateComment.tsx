import React from 'react';
import { useState, startTransition } from 'react';
import api, { IMAGE_BASE_URL } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

import type { Comment, OptimisticAction } from '../../types';

interface CreateCommentProps {
    postId: string;
    parentCommentId?: string;
    onCommentCreated: (newComment: Comment) => void;
    onCancel?: () => void;
    addOptimisticAction?: (action: OptimisticAction) => void;
}

const CreateComment = ({
    postId,
    parentCommentId,
    onCommentCreated,
    onCancel,
    addOptimisticAction
}: CreateCommentProps) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        startTransition(async () => {
            const optimisticId = `temp-${Date.now()}`;
            const optimisticComment: Comment = {
                _id: optimisticId,
                content,
                postId: postId,
                author: {
                    _id: user._id,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                },
                likes: [],
                dislikes: [],
                parentComment: parentCommentId,
                createdAt: new Date().toISOString(),
                isOptimistic: true,
            };

            if (addOptimisticAction) {
                addOptimisticAction({ type: 'add', payload: optimisticComment });
            }

            const previousContent = content;
            setContent('');
            setLoading(true);

            try {
                const response = await api.post('/comments', {
                    content: previousContent,
                    postId,
                    parentCommentId,
                });
                onCommentCreated(response.data);
                if (onCancel) onCancel();
            } catch (error) {
                console.error('Failed to create comment', error);
                setContent(previousContent);
            } finally {
                setLoading(false);
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    return (
        <div className={`create-comment-container ${parentCommentId ? 'reply-mode' : ''}`}>
            {/* Show avatar only for top-level comments or if desired */}
            <div className="comment-avatar">
                <img
                    src={user?.avatarUrl ? `${IMAGE_BASE_URL}${user.avatarUrl}` : '/default-avatar.svg'}
                    alt="avatar"
                    className="avatar"
                />
            </div>

            <form onSubmit={handleSubmit} className="create-comment-form">
                <div className="input-wrapper">
                    <textarea
                        value={content}
                        onChange={handleChange}
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
