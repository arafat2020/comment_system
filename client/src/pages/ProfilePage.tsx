import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import PostItem from '../modules/posts/PostItem';
import { BsCalendar3 } from 'react-icons/bs';
import { format } from 'date-fns';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage = () => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const { data: allPosts, loading, error, refetch } = useFetch<any[]>('/posts');

    // Filter posts for current user
    const posts = useMemo(() => {
        if (!allPosts || !user) return [];
        return allPosts.filter((p: any) => p.author._id === user._id);
    }, [allPosts, user]);

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
                            <span><strong>{posts.length}</strong> Posts</span>
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
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <PostItem key={post._id} post={post} />
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
