import { useParams } from 'react-router-dom';
import { useOptimistic } from 'react';
import PostItem from '../modules/posts/PostItem';
import CommentList from '../modules/comments/CommentList';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PostDetails = () => {
    const { id } = useParams();
    const {
        data: post,
        loading,
        error,
        setData,
        refetch
    } = useFetch<any>(`/posts/${id}`);

    // React 19 useOptimistic for post like toggle in detail view
    const [optimisticPost, addOptimisticAction] = useOptimistic(
        post,
        (state, action: { type: string; payload: any }) => {
            if (!state) return state;
            if (action.type === 'like') {
                const newLikes = [...state.likes];
                const likeIndex = newLikes.findIndex((l: any) =>
                    (typeof l === 'string' ? l : l._id) === action.payload.userId
                );
                if (likeIndex > -1) {
                    newLikes.splice(likeIndex, 1);
                } else {
                    newLikes.push({ _id: action.payload.userId, username: action.payload.username });
                }
                return { ...state, likes: newLikes };
            }
            if (action.type === 'update') {
                return { ...state, ...action.payload };
            }
            return state;
        }
    );

    if (loading) return <Loader message="Loading post..." />;
    if (error) return <ErrorMessage message={error} title="Failed to load post" onRetry={refetch} />;
    if (!optimisticPost) return <ErrorMessage message="Post not found" />;

    return (
        <div className="post-details-container">
            <PostItem
                post={optimisticPost}
                addOptimisticAction={addOptimisticAction}
                onUpdate={(updatedData) => setData(updatedData)}
            />
            <CommentList postId={optimisticPost._id} />
        </div>
    );
};

export default PostDetails;
