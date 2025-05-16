import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './Profile.css';
import authAxios from "../authAxios";

function BlockListPage() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    setIsLoading(true);
    try {
      const res = await authAxios.get('friendship/get_blocked/');
      setBlockedUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch blocked users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (friendshipId) => {
    try {
      await authAxios.post(`friendship/unblock/${friendshipId}/`);
      alert('User unblocked successfully!');
      fetchBlockedUsers();
    } catch (err) {
      alert('Failed to unblock user.');
    }
  };

  return (
    <div className="profile-layout">
      <Header title="Block List" />
      <Sidebar />
      <div className="block-container">
        <div className="green-container">
          <div className="scrollable-container">
            {blockedUsers.length > 0 ? (
              blockedUsers.map(user => (
                <div key={user.id} className="friend-item">
                  <div className="friend-name">{user.name}</div>
                  <button onClick={() => handleUnblock(user.friendship_id)} className="unblock-button">Unblock</button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No blocked users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockListPage;