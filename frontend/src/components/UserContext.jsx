import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [friends, setFriends] = useState(['Alice', 'Bob', 'Charlie']);
  const [blockedUsers, setBlockedUsers] = useState(['Dave', 'Eve']);

  const handleBlock = (name) => {
    setFriends(friends.filter(friend => friend !== name));
    setBlockedUsers([...blockedUsers, name]); 
    alert(`${name} has been blocked.`);
  };

  const handleUnblock = (name) => {
    setBlockedUsers(blockedUsers.filter(user => user !== name)); 
    alert(`${name} has been unblocked.`);
  };

  const handleAddFriend = (name) => {
    if (name.trim()) {
      if (blockedUsers.includes(name)) {
        alert(`${name} is blocked and cannot be added as a friend.`);
        return;
      }
      if (!friends.includes(name)) {
        setFriends([...friends, name]);
      } else {
        alert(`${name} is already in your friends list.`);
      }
    } else {
      alert('Please enter a valid name.');
    }
  };
  

  return (
    <UserContext.Provider
      value={{
        friends,
        blockedUsers,
        handleBlock,
        handleUnblock,
        handleAddFriend,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};