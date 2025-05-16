import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './Profile.css';
import authAxios from '../authAxios';

function FriendsListPage() {
  const [student, setStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const profileRes = await authAxios.get('get_user_and_student_details/');
        setStudent(profileRes.data.student);

        const allStudents = await authAxios.get('get_all_students/');
        setStudents(allStudents.data.data);

        const friendshipRes = await authAxios.get('friendship/');
        const incoming = [], sent = [], accepted = [];

        friendshipRes.data.forEach(f => {
          if (f.status === 'pending') {
            if (f.receiver.id === profileRes.data.student.id) incoming.push(f);
            else if (f.sender.id === profileRes.data.student.id) sent.push(f);
          } else if (f.status === 'accepted') accepted.push(f);
        });

        setIncomingRequests(incoming);
        setSentRequests(sent);
        setFriends(accepted);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddFriend = async () => {
    const matched = students.find(s => s.name.toLowerCase() === searchQuery.toLowerCase());

    if (!matched) return alert('Student not found.');
    if (matched.id === student.id) return alert("You can't add yourself.");

    try {
      await authAxios.post('friendship/send/', { receiver_id: matched.id });
      setSearchQuery('');
      alert('Friend request sent!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request.');
    }
  };

  const handleRespond = async (friendshipId, action) => {
    try {
      await authAxios.post(`friendship/respond/${friendshipId}/`, { action });
      window.location.reload();
    } catch (err) {
      alert('Failed to respond.');
    }
  };

  const handleBlock = async (friendshipId, otherId) => {
    const name = students.find(s => s.id === otherId)?.name || 'User';
    if (!window.confirm(`Block ${name}?`)) return;

    try {
      await authAxios.post(`friendship/block/${friendshipId}/`, {});
      alert(`${name} blocked.`);
      window.location.reload();
    } catch (err) {
      alert('Failed to block.');
    }
  };

  const handleDeleteFriendship = async (friendshipId, otherId) => {
    const name = students.find(s => s.id === otherId)?.name || 'User';
    if (!window.confirm(`Delete friendship with ${name}?`)) return;

    try {
      await authAxios.delete(`friendship/delete/${friendshipId}/`);
      alert('Friendship deleted.');
      window.location.reload();
    } catch (err) {
      alert('Failed to delete friendship.');
    }
  };

  return (
    <div className="profile-layout">
      <Header title="Friends List" />
      <Sidebar />
      <div className="friends-container">
        <div className="green-container">
          <div className="friend-search">
            <input
              type="text"
              placeholder="Search or add a friend"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="profile-input"
            />
            <button onClick={handleAddFriend} className="profile-button green-button">
              Add Friend
            </button>
          </div>

          <div className="scrollable-container">
            {incomingRequests.length > 0 && (
              <div className="friend-section">
                <h4>Incoming Requests</h4>
                {incomingRequests.map(req => (
                  <div key={req.id} className="friend-item">
                    <div className="friend-name">{req.sender.name}</div>
                    <div className="friend-actions">
                      <button onClick={() => handleRespond(req.id, 'accepted')} className="accept-button">Accept</button>
                      <button onClick={() => handleRespond(req.id, 'rejected')} className="reject-button">Reject</button>
                      <button onClick={() => handleBlock(req.id, req.sender.id)} className="block-button">Block</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sentRequests.length > 0 && (
              <div className="friend-section">
                <h4>Sent Requests</h4>
                {sentRequests.map(req => (
                  <div key={req.id} className="friend-item">
                    <div className="friend-name">{req.receiver.name}</div>
                    <button onClick={() => handleBlock(req.id, req.receiver.id)} className="block-button">Block</button>
                  </div>
                ))}
              </div>
            )}

            {friends.length > 0 && (
              <div className="friend-section">
                <h4>Friends</h4>
                {friends.map(f => {
                  const other = f.sender.id === student.id ? f.receiver : f.sender;
                  return (
                    <div key={f.id} className="friend-item">
                      <div className="friend-name">{other.name}</div>
                      <div className="friend-actions">
                        <button onClick={() => handleBlock(f.id, other.id)} className="block-button">Block</button>
                        <button onClick={() => handleDeleteFriendship(f.id, other.id)} className="remove-button">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {incomingRequests.length === 0 && sentRequests.length === 0 && friends.length === 0 && (
              <div className="empty-state">No friend requests or friends to display.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendsListPage;
