import { useEffect, useState } from 'react';
import api from '../services/api';
import CreatePost from '../modules/posts/CreatePost';
import PostItem from '../modules/posts/PostItem';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="home-container">
            <CreatePost onPostCreated={fetchPosts} />
            <div className="feed">
                {loading ? (
                    <p>Loading posts...</p>
                ) : posts.length > 0 ? (
                    posts.map((post: any) => (
                        <PostItem key={post._id} post={post} />
                    ))
                ) : (
                    <p className="empty-feed">No posts yet. Be the first to share something!</p>
                )}
            </div>
        </div>
    );
};

export default Home;
