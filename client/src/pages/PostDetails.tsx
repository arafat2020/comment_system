import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PostItem from '../modules/posts/PostItem';
import CommentList from '../modules/comments/CommentList';

const PostDetails = () => {
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                setError('Post not found');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!post) return null;

    return (
        <div className="post-details-container">
            <PostItem post={post} />
            <CommentList postId={post._id} />
        </div>
    );
};

export default PostDetails;
