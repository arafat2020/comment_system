import { useCallback, useOptimistic, useState, useEffect } from 'react';
import CreatePost from '../modules/posts/CreatePost';
import PostItem from '../modules/posts/PostItem';
import api from '../services/api';
import useWebSocketRoom from '../hooks/useWebSocketRoom';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import type { Post, OptimisticAction } from '../types';

const Home = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (pageNum: number, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/posts?page=${pageNum}&limit=10`);
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
    }, []);

    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    const [optimisticPosts, addOptimisticAction] = useOptimistic<Post[], OptimisticAction>(
        posts,
        (state, action) => {
            switch (action.type) {
                case 'add':
                    return [action.payload as Post, ...state];
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
            setPosts(prev => {
                if (prev.find(p => p._id === newPost._id)) return prev;
                return [newPost, ...prev];
            });
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
    }, []);

    useWebSocketRoom('feed', handlePostMessage);

    const handleLoadMore = () => {
        if (page < totalPages) {
            fetchPosts(page + 1, true);
        }
    };

    return (
        <div className="home-container">
            <CreatePost
                onPostCreated={(newPost) => {
                    setPosts(prev => {
                        if (prev.some(p => p._id === newPost._id)) return prev;
                        return [newPost, ...prev];
                    });
                }}
                addOptimisticAction={addOptimisticAction}
            />
            <div className="feed">
                {loading && page === 1 ? (
                    <Loader message="Loading posts..." size="small" />
                ) : error ? (
                    <ErrorMessage message={error} title="Failed to load posts" onRetry={() => fetchPosts(1)} />
                ) : (
                    <>
                        {optimisticPosts.map((post) => (
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
                                    className="load-more-btn"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
                {!loading && optimisticPosts.length === 0 && (
                    <p className="empty-feed">No posts yet. Be the first to share something!</p>
                )}
            </div>
        </div>
    );
};

export default Home;
