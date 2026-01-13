import CreatePost from '../modules/posts/CreatePost';
import PostItem from '../modules/posts/PostItem';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
    const { data: posts, loading, error, refetch } = useFetch<any[]>('/posts');

    return (
        <div className="home-container">
            <CreatePost onPostCreated={refetch} />
            <div className="feed">
                {loading ? (
                    <Loader message="Loading posts..." size="small" />
                ) : error ? (
                    <ErrorMessage message={error} title="Failed to load posts" onRetry={refetch} />
                ) : posts && posts.length > 0 ? (
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
