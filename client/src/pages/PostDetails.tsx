import { useParams } from 'react-router-dom';
import PostItem from '../modules/posts/PostItem';
import CommentList from '../modules/comments/CommentList';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PostDetails = () => {
    const { id } = useParams();
    const { data: post, loading, error, refetch } = useFetch<any>(`/posts/${id}`);

    if (loading) return <Loader message="Loading post..." />;
    if (error) return <ErrorMessage message={error} title="Post not found" onRetry={refetch} />;
    if (!post) return null;

    return (
        <div className="post-details-container">
            <PostItem post={post} />
            <CommentList postId={post._id} />
        </div>
    );
};

export default PostDetails;
