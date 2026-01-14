import { useMemo, useCallback, useOptimistic, useState, useEffect } from 'react';
import api from '../../services/api';
import useWebSocketRoom from '../../hooks/useWebSocketRoom';
import CreateComment from './CreateComment';
import CommentItem from './CommentItem';
import ErrorMessage from '../../components/ErrorMessage';
import type { Comment, OptimisticAction } from '../../types';

interface CommentListProps {
    postId: string;
}

const CommentList = ({ postId }: CommentListProps) => {
    const [sortBy, setSortBy] = useState<'newest' | 'liked'>('newest');

    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = useCallback(async (pageNum: number, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        setError(null);

        try {
            const response = await api.get(`/comments/${postId}?page=${pageNum}&limit=10`);
            const { comments: newComments, totalPages: total } = response.data;

            setComments((prev: Comment[]) => isLoadMore ? [...prev, ...newComments] : newComments);
            setTotalPages(total);
            setPage(pageNum);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch comments');
        } finally {
            setLoadingMore(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments(1);
    }, [fetchComments]);

    // Manage room connection state for UI feedback
    const handleCommentMessage = useCallback((type: string, data: unknown) => {
        if (type === 'new_comment') {
            const newComment = data as Comment;
            setComments((prev: Comment[]) => {
                if (prev.find(c => c._id === newComment._id)) return prev;
                return [newComment, ...prev];
            });
        } else if (type === 'update_comment') {
            const updatedComment = data as Comment;
            setComments((prev: Comment[]) =>
                prev.map(c => c._id === updatedComment._id ? { ...c, ...updatedComment } : c)
            );
        } else if (type === 'delete_comment') {
            const deleteData = data as { id: string };
            setComments((prev: Comment[]) =>
                prev.filter(c => c._id !== deleteData.id)
            );
        }
    }, []);

    const { isConnected } = useWebSocketRoom(`post_${postId}`, handleCommentMessage);

    // React 19 useOptimistic for comments
    const [optimisticComments, addOptimisticAction] = useOptimistic(
        comments || [],
        (state: Comment[], action: OptimisticAction) => {
            switch (action.type) {
                case 'add':
                    return [action.payload as Comment, ...state];
                case 'like':
                    return state.map(c => {
                        if (c._id === action.payload.commentId) {
                            const newLikes = [...c.likes];
                            const likeIndex = newLikes.findIndex((l) =>
                                (typeof l === 'string' ? l : l._id) === action.payload.userId
                            );
                            const newDislikes = [...(c.dislikes || [])];
                            const dislikeIndex = newDislikes.findIndex((d) =>
                                (typeof d === 'string' ? d : d._id) === action.payload.userId
                            );

                            if (likeIndex > -1) {
                                newLikes.splice(likeIndex, 1);
                            } else {
                                newLikes.push({ _id: action.payload.userId, username: action.payload.username });
                                if (dislikeIndex > -1) {
                                    newDislikes.splice(dislikeIndex, 1);
                                }
                            }
                            return { ...c, likes: newLikes, dislikes: newDislikes };
                        }
                        return c;
                    });
                case 'dislike':
                    return state.map(c => {
                        if (c._id === action.payload.commentId) {
                            const newDislikes = [...(c.dislikes || [])];
                            const dislikeIndex = newDislikes.findIndex((d) =>
                                (typeof d === 'string' ? d : d._id) === action.payload.userId
                            );
                            const newLikes = [...c.likes];
                            const likeIndex = newLikes.findIndex((l) =>
                                (typeof l === 'string' ? l : l._id) === action.payload.userId
                            );

                            if (dislikeIndex > -1) {
                                newDislikes.splice(dislikeIndex, 1);
                            } else {
                                newDislikes.push({ _id: action.payload.userId, username: action.payload.username });
                                if (likeIndex > -1) {
                                    newLikes.splice(likeIndex, 1);
                                }
                            }
                            return { ...c, likes: newLikes, dislikes: newDislikes };
                        }
                        return c;
                    });
                case 'delete':
                    return state.filter(c => c._id !== action.payload.id);
                case 'edit':
                    return state.map(c => c._id === action.payload.id ? { ...c, content: action.payload.content } : c);
                default:
                    return state;
            }
        }
    );

    const sortedComments = useMemo(() => {
        if (!optimisticComments) return [];
        return [...optimisticComments].sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return (b.likes?.length || 0) - (a.likes?.length || 0);
            }
        });
    }, [optimisticComments, sortBy]);

    const rootComments = sortedComments.filter(c => !c.parentComment);

    if (error) return <ErrorMessage message={error} title="Failed to load comments" onRetry={() => fetchComments(1)} />;

    return (
        <div className="comments-section">
            <div className="comments-header">
                <div className="comments-status">
                    <h3>Comments ({comments.length})</h3>
                    <span
                        className={`status-dot ${isConnected ? 'online' : 'offline'}`}
                        title={isConnected ? 'Real-time connected' : 'Disconnected'}
                    ></span>
                </div>
                <div className="sort-controls">
                    <button
                        className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
                        onClick={() => setSortBy('newest')}
                    >
                        Newest
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'liked' ? 'active' : ''}`}
                        onClick={() => setSortBy('liked')}
                    >
                        Most Liked
                    </button>
                </div>
            </div>

            <CreateComment
                postId={postId}
                onCommentCreated={(newComment) => {
                    setComments(prev => {
                        if (prev.some(c => c._id === newComment._id)) return prev;
                        return [newComment, ...prev];
                    });
                }}
                addOptimisticAction={addOptimisticAction}
            />

            <div className="comments-list">
                {rootComments.length === 0 ? (
                    <div className="no-comments">
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    rootComments.map(comment => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            allComments={sortedComments}
                            postId={postId}
                            onUpdate={(updatedData) => setComments(prev => {
                                const exists = prev.some(c => c._id === updatedData._id);
                                if (exists) {
                                    return prev.map(c => c._id === updatedData._id ? { ...c, ...updatedData } : c);
                                }
                                return [updatedData, ...prev];
                            })}
                            onDelete={(id) => setComments(prev => prev.filter(c => c._id !== id))}
                            addOptimisticAction={addOptimisticAction}
                        />
                    ))
                )}

                {page < totalPages && (
                    <div className="load-more-container">
                        <button
                            className="load-more-btn"
                            onClick={() => fetchComments(page + 1, true)}
                            disabled={loadingMore}
                        >
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentList;
