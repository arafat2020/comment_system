import { useMemo, useCallback, useOptimistic } from 'react';
import { useAuth } from '../context/AuthContext';
import PostItem from '../modules/posts/PostItem';
import { BsCalendar3 } from 'react-icons/bs';
import { format } from 'date-fns';
import useFetch from '../hooks/useFetch';
import useWebSocketRoom from '../hooks/useWebSocketRoom';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage = () => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const {
        data: allPosts,
        loading,
        error,
        setData: setAllPosts,
        refetch
    } = useFetch<any[]>('/posts');

    // React 19 useOptimistic hook for profile posts
    const [optimisticPosts, addOptimisticAction] = useOptimistic(
        allPosts || [],
        (state, action: { type: string; payload: any }) => {
            switch (action.type) {
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
            if (data.author._id === user?._id) {
                setAllPosts(prev => {
                    if (!prev) return [data];
                    if (prev.find(p => p._id === data._id)) return prev;
                    return [data, ...prev];
                });
            }
        } else if (type === 'update_post') {
            setAllPosts(prev =>
                prev ? prev.map(p => p._id === data._id ? { ...p, ...data } : p) : prev
            );
        } else if (type === 'delete_post') {
            setAllPosts(prev =>
                prev ? prev.filter(p => p._id !== data.id) : prev
            );
        }
    }, [setAllPosts, user?._id]);

    // Profile feed updates
    useWebSocketRoom('feed', handlePostMessage);

    // Filter posts for current user from optimistic state
    const filteredPosts = useMemo(() => {
        if (!user) return [];
        return optimisticPosts.filter((p: any) => p.author._id === user._id);
    }, [optimisticPosts, user]);

    if (!user) return <div>Please login</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-cover"></div>
                <div className="profile-info-container">
                    <div className="profile-avatar-wrapper">
                        <img
                            src={user?.avatarUrl ? `${API_URL}${user.avatarUrl}` : '/default-avatar.svg'}
                            alt="avatar"
                            className="profile-avatar"
                        />
                    </div>
                    <div className="profile-actions">
                        <button className="edit-profile-btn">Edit profile</button>
                    </div>

                    <div className="profile-details">
                        <h2 className="profile-name">{user.username}</h2>
                        <span className="profile-handle">@{user.username}</span>

                        <div className="profile-meta">
                            <BsCalendar3 />
                            <span>Joined {format(new Date(), 'MMMM yyyy')}</span>
                        </div>

                        <div className="profile-stats">
                            <span><strong>{filteredPosts.length}</strong> Posts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-posts-header">
                <h3>Posts</h3>
            </div>

            <div className="profile-feed">
                {loading ? (
                    <Loader message="Loading posts..." size="small" />
                ) : error ? (
                    <ErrorMessage message={error} title="Failed to load posts" onRetry={refetch} />
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <PostItem
                            key={post._id}
                            post={post}
                            addOptimisticAction={addOptimisticAction}
                            onUpdate={(updatedData) => setAllPosts(prev => prev ? prev.map(p => p._id === updatedData._id ? updatedData : p) : prev)}
                            onDelete={(id) => setAllPosts(prev => prev ? prev.filter(p => p._id !== id) : prev)}
                        />
                    ))
                ) : (
                    <div className="no-posts">
                        <p>No posts to showcase yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
