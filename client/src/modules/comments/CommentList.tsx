import { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import CommentItem from './CommentItem';
import CreateComment from './CreateComment';

interface CommentListProps {
    postId: string;
}

const CommentList = ({ postId }: CommentListProps) => {
    const [comments, setComments] = useState<any[]>([]);
    const [sortBy, setSortBy] = useState<'newest' | 'liked'>('newest');

    const fetchComments = async () => {
        try {
            const res = await api.get(`/comments/${postId}`);
            setComments(res.data);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return b.likes.length - a.likes.length;
            }
        });
    }, [comments, sortBy]);

    // Only render root comments (those without parent)
    // The CommentItem component will handle rendering children recursively
    const rootComments = sortedComments.filter(c => !c.parentComment);

    return (
        <div className="comments-section">
            <div className="comments-header">
                {/* <h3>Comments</h3> remove header title for cleaner look */}
                <div className="sort-controls">
                    {/* Using simple text for sort, or could make it an icon */}
                    {/* For now keeping select but simpler */}
                </div>
            </div>

            <CreateComment postId={postId} onCommentCreated={fetchComments} />

            <div className="comments-list">
                {rootComments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        allComments={sortedComments}
                        postId={postId}
                        onUpdate={fetchComments}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentList;
