import { useMemo, useCallback, useState } from 'react';
import CommentItem from './CommentItem';
import CreateComment from './CreateComment';
import useFetch from '../../hooks/useFetch';
import useWebSocketRoom from '../../hooks/useWebSocketRoom';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

interface CommentListProps {
    postId: string;
}

const CommentList = ({ postId }: CommentListProps) => {
    const [sortBy, setSortBy] = useState<'newest' | 'liked'>('newest');

    // Use the custom useFetch hook
    const {
        data: comments,
        loading,
        error,
        setData: setComments,
        refetch
    } = useFetch<any[]>(`/comments/${postId}`);

    // Handle incoming real-time messages
    const handleWebSocketMessage = useCallback((type: string, data: any) => {
        if (type === 'new_comment') {
            if (data.post === postId) {
                setComments(prev => {
                    if (!prev) return [data];
                    if (prev.find(c => c._id === data._id)) return prev;
                    return [data, ...prev];
                });
            }
        } else if (type === 'update_comment') {
            setComments(prev =>
                prev ? prev.map(c => c._id === data._id ? { ...c, ...data } : c) : prev
            );
        } else if (type === 'delete_comment') {
            setComments(prev =>
                prev ? prev.filter(c => c._id !== data.id) : prev
            );
        }
    }, [postId, setComments]);


    // Use the custom useWebSocketRoom hook
    const { isConnected } = useWebSocketRoom(postId, handleWebSocketMessage);

    const sortedComments = useMemo(() => {
        if (!comments) return [];
        return [...comments].sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return (b.likes?.length || 0) - (a.likes?.length || 0);
            }
        });
    }, [comments, sortBy]);

    // Only render root comments (those without parent)
    const rootComments = sortedComments.filter(c => !c.parentComment);

    if (loading) return <Loader size="small" message="Loading comments..." />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

    return (
        <div className="comments-section">
            <div className="comments-header">
                <div className="comments-status">
                    <h3>Comments</h3>
                    <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} title={isConnected ? 'Real-time connected' : 'Disconnected'}></span>
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

            <CreateComment postId={postId} onCommentCreated={refetch} />

            <div className="comments-list">
                {rootComments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        allComments={sortedComments}
                        postId={postId}
                        onUpdate={refetch}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentList;
