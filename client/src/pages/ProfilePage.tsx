import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostItem from '../modules/posts/PostItem';
import { BsCalendar3 } from 'react-icons/bs';
import { format } from 'date-fns';

const ProfilePage = () => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:5000';
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!user) return;
            try {
                // Fetch all posts and filter client-side for now, or use a specific endpoint if available
                // Assuming standard list for now, ideally backend should have /posts/user/:id
                const res = await api.get('/posts');
                const userPosts = res.data.filter((p: any) => p.author._id === user._id);
                setPosts(userPosts);
            } catch (error) {
                console.error('Failed to fetch posts', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [user]);

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
                            <span>Joined {format(new Date(), 'MMMM yyyy')}</span> {/* Placeholder join date */}
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
                    <div>Loading posts...</div>
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
