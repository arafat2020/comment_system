import { useCallback, useOptimistic } from 'react';
import CreatePost from '../modules/posts/CreatePost';
import PostItem from '../modules/posts/PostItem';
import useFetch from '../hooks/useFetch';
import useWebSocketRoom from '../hooks/useWebSocketRoom';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
    const { data: posts, loading, error, setData: setPosts, refetch } = useFetch<any[]>('/posts');

    // React 19 useOptimistic hook for post management
    const [optimisticPosts, addOptimisticAction] = useOptimistic(
        posts || [],
        (state, action: { type: string; payload: any }) => {
            switch (action.type) {
                case 'add':
                    return [action.payload, ...state];
                case 'like':
                    return state.map(p => {
                        if (p._id === action.payload.postId) {
                            const newLikes = [...p.likes];
                            const likeIndex = newLikes.findIndex((l: any) =>
                                (typeof l === 'string' ? l : l._id) === action.payload.userId
                            );
                            if (likeIndex > -1) {
                                newLikes.splice(likeIndex, 1);
                            } else {
                                newLikes.push({ _id: action.payload.userId, username: action.payload.username });
                            }
                            return { ...p, likes: newLikes };
                        }
                        return p;
                    });
                case 'delete':
                    return state.filter(p => p._id !== action.payload.id);
                case 'update':
                    return state.map(p => p._id === action.payload._id ? { ...p, ...action.payload } : p);
                default:
                    return state;
            }
        }
    );

    const handlePostMessage = useCallback((type: string, data: any) => {
        if (type === 'new_post') {
            setPosts(prev => {
                if (!prev) return [data];
                if (prev.find(p => p._id === data._id)) return prev;
                return [data, ...prev];
            });
        } else if (type === 'update_post') {
            setPosts(prev =>
                prev ? prev.map(p => p._id === data._id ? { ...p, ...data } : p) : prev
            );
        } else if (type === 'delete_post') {
            setPosts(prev =>
                prev ? prev.filter(p => p._id !== data.id) : prev
            );
        }
    }, [setPosts]);

    // Feed room or global updates for posts
    useWebSocketRoom('feed', handlePostMessage);

    return (
        <div className="home-container">
            <CreatePost
                onPostCreated={(newPost) => {
                    setPosts(prev => prev ? [newPost, ...prev] : [newPost]);
                    refetch();
                }}
                addOptimisticAction={addOptimisticAction}
            />
            <div className="feed">
                {loading ? (
                    <Loader message="Loading posts..." size="small" />
                ) : error ? (
                    <ErrorMessage message={error} title="Failed to load posts" onRetry={refetch} />
                ) : optimisticPosts && optimisticPosts.length > 0 ? (
                    optimisticPosts.map((post: any) => (
                        <PostItem
                            key={post._id}
                            post={post}
                            addOptimisticAction={addOptimisticAction}
                            onUpdate={(updatedData) => setPosts(prev => prev ? prev.map(p => p._id === updatedData._id ? updatedData : p) : prev)}
                            onDelete={(id) => setPosts(prev => prev ? prev.filter(p => p._id !== id) : prev)}
                        />
                    ))
                ) : (
                    <p className="empty-feed">No posts yet. Be the first to share something!</p>
                )}
            </div>
        </div>
    );
};

export default Home;
