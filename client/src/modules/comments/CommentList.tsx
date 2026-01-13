import { useMemo, useCallback, useOptimistic, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useWebSocketRoom from '../../hooks/useWebSocketRoom';
import CreateComment from './CreateComment';
import CommentItem from './CommentItem';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

interface CommentListProps {
    postId: string;
}

const CommentList = ({ postId }: CommentListProps) => {
    const [sortBy, setSortBy] = useState<'newest' | 'liked'>('newest');

    const {
        data: comments,
        loading,
        error,
        setData: setComments,
        refetch
    } = useFetch<any[]>(`/comments/${postId}`);

    // Manage room connection state for UI feedback
    const handleCommentMessage = useCallback((type: string, data: any) => {
        if (type === 'new_comment') {
            setComments(prev => {
                if (!prev) return [data];
                if (prev.find(c => c._id === data._id)) return prev;
                return [data, ...prev];
            });
        } else if (type === 'update_comment') {
            setComments(prev =>
                prev ? prev.map(c => c._id === data._id ? { ...c, ...data } : c) : prev
            );
        } else if (type === 'delete_comment') {
            setComments(prev =>
                prev ? prev.filter(c => c._id !== data.id) : prev
            );
        }
    }, [setComments]);

    const { isConnected } = useWebSocketRoom(`post_${postId}`, handleCommentMessage);

    // React 19 useOptimistic for comments
    const [optimisticComments, addOptimisticAction] = useOptimistic(
        comments || [],
        (state, action: { type: string; payload: any }) => {
            switch (action.type) {
                case 'add':
                    return [action.payload, ...state];
                case 'like':
                    return state.map(c => {
                        if (c._id === action.payload.commentId) {
                            const newLikes = [...c.likes];
                            const likeIndex = newLikes.findIndex((l: any) =>
                                (typeof l === 'string' ? l : l._id) === action.payload.userId
                            );
                            if (likeIndex > -1) {
                                newLikes.splice(likeIndex, 1);
                            } else {
                                newLikes.push({ _id: action.payload.userId, username: action.payload.username });
                            }
                            return { ...c, likes: newLikes };
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

    if (loading) return <Loader message="Loading comments..." size="small" />;
    if (error) return <ErrorMessage message={error} title="Failed to load comments" onRetry={refetch} />;

    return (
        <div className="comments-section">
            <div className="comments-header">
                <div className="comments-status">
                    <h3>Comments ({optimisticComments.length})</h3>
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
                    setComments(prev => prev ? [newComment, ...prev] : [newComment]);
                    refetch();
                }}
                addOptimisticAction={addOptimisticAction}
            />

            <div className="comments-list">
                {rootComments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        allComments={sortedComments}
                        postId={postId}
                        onUpdate={(updatedData) => setComments(prev => prev ? prev.map(c => c._id === updatedData._id ? updatedData : c) : prev)}
                        onDelete={(id) => setComments(prev => prev ? prev.filter(c => c._id !== id) : prev)}
                        addOptimisticAction={addOptimisticAction}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentList;
