import { useCallback, useOptimistic, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import PostItem from '../modules/posts/PostItem';
import { BsCalendar3 } from 'react-icons/bs';
import { format } from 'date-fns';
import api, { IMAGE_BASE_URL } from '../services/api';
import useWebSocketRoom from '../hooks/useWebSocketRoom';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import type { Post, OptimisticAction } from '../types';

const ProfilePage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserPosts = useCallback(async (pageNum: number, isLoadMore = false) => {
        if (!user?._id) return;

        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/posts/user/${user._id}?page=${pageNum}&limit=10`);
            const { posts: newPosts, totalPages: total } = response.data;

            setPosts(prev => isLoadMore ? [...prev, ...newPosts] : newPosts);
            setTotalPages(total);
            setPage(pageNum);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [user?._id]);

    useEffect(() => {
        if (user?._id) {
            fetchUserPosts(1);
        }
    }, [fetchUserPosts, user?._id]);

    // React 19 useOptimistic hook for profile posts
    const [optimisticPosts, addOptimisticAction] = useOptimistic(
        posts,
        (state: Post[], action: OptimisticAction) => {
            switch (action.type) {
                case 'like':
                    return state.map(p => {
                        if (p._id === action.payload.postId) {
                            const newLikes = [...p.likes];
                            const likeIndex = newLikes.findIndex((l) =>
                                (typeof l === 'string' ? l : l._id) === action.payload.userId
                            );
                            const newDislikes = [...(p.dislikes || [])];
                            const dislikeIndex = newDislikes.findIndex((d) =>
                                (typeof d === 'string' ? d : d._id) === action.payload.userId
                            );

                            if (likeIndex > -1) {
                                newLikes.splice(likeIndex, 1);
                            } else {
                                newLikes.push({ _id: action.payload.userId, username: action.payload.username });
                                if (dislikeIndex > -1) {
                                    newDislikes.splice(dislikeIndex, 1);
                                }
                            }
                            return { ...p, likes: newLikes, dislikes: newDislikes };
                        }
                        return p;
                    });
                case 'dislike':
                    return state.map(p => {
                        if (p._id === action.payload.postId) {
                            const newDislikes = [...(p.dislikes || [])];
                            const dislikeIndex = newDislikes.findIndex((d) =>
                                (typeof d === 'string' ? d : d._id) === action.payload.userId
                            );
                            const newLikes = [...p.likes];
                            const likeIndex = newLikes.findIndex((l) =>
                                (typeof l === 'string' ? l : l._id) === action.payload.userId
                            );

                            if (dislikeIndex > -1) {
                                newDislikes.splice(dislikeIndex, 1);
                            } else {
                                newDislikes.push({ _id: action.payload.userId, username: action.payload.username });
                                if (likeIndex > -1) {
                                    newLikes.splice(likeIndex, 1);
                                }
                            }
                            return { ...p, likes: newLikes, dislikes: newDislikes };
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

    const handlePostMessage = useCallback((type: string, data: unknown) => {
        if (type === 'new_post') {
            const newPost = data as Post;
            if (newPost.author._id === user?._id) {
                setPosts(prev => {
                    if (prev.find(p => p._id === newPost._id)) return prev;
                    return [newPost, ...prev];
                });
            }
        } else if (type === 'update_post') {
            const updatedPost = data as Post;
            setPosts(prev =>
                prev.map(p => p._id === updatedPost._id ? { ...p, ...updatedPost } : p)
            );
        } else if (type === 'delete_post') {
            const { id } = data as { id: string };
            setPosts(prev =>
                prev.filter(p => p._id !== id)
            );
        }
    }, [user?._id]);

    // Profile feed updates
    useWebSocketRoom('feed', handlePostMessage);

    const handleLoadMore = () => {
        if (page < totalPages) {
            fetchUserPosts(page + 1, true);
        }
    };

    if (!user) return <div>Please login</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-cover"></div>
                <div className="profile-info-container">
                    <div className="profile-avatar-wrapper">
                        <img
                            src={user?.avatarUrl ? `${IMAGE_BASE_URL}${user.avatarUrl}` : '/default-avatar.svg'}
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
                            <span><strong>{posts.length}</strong> Posts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-posts-header">
                <h3>Posts</h3>
            </div>

            <div className="profile-feed">
                {loading && page === 1 ? (
                    <Loader message="Loading posts..." size="small" />
                ) : error ? (
                    <ErrorMessage message={error} title="Failed to load posts" onRetry={() => fetchUserPosts(1)} />
                ) : optimisticPosts.length > 0 ? (
                    <>
                        {optimisticPosts.map(post => (
                            <PostItem
                                key={post._id}
                                post={post}
                                addOptimisticAction={addOptimisticAction}
                                onUpdate={(updatedData) => setPosts(prev => {
                                    const exists = prev.some(p => p._id === updatedData._id);
                                    if (exists) {
                                        return prev.map(p => p._id === updatedData._id ? { ...p, ...updatedData } : p);
                                    }
                                    return [updatedData, ...prev];
                                })}
                                onDelete={(id) => setPosts(prev => prev.filter(p => p._id !== id))}
                            />
                        ))}

                        {page < totalPages && (
                            <div className="load-more-container">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
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
