import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Search, Trash2, X, MoreVertical } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import api from "../api";

const ChatBoxRoom = () => {
  const { isDark } = useTheme();
  const [allMessages, setAllMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', max_students: 5, selectedMembers: [] });
  const [students, setStudents] = useState({});
  const [studentList, setStudentList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, messageId: null });
  const [leaveConfirmation, setLeaveConfirmation] = useState({ show: false, groupId: null });
  const [showOptions, setShowOptions] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(null);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(null);
  const [addMemberIds, setAddMemberIds] = useState([]);
  const [removeMemberIds, setRemoveMemberIds] = useState([]);
  const messagesEndRef = useRef(null);
  const currentStudentId = 2; // Simulated student id (matches Student table)
  const BASE_URL = api;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [selectedGroup, allMessages]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, groupsRes, discussionsRes] = await Promise.all([
          fetch(`${BASE_URL}get_all_students/`),
          fetch(`${BASE_URL}groups/`),
          fetch(`${BASE_URL}discussions/`)
        ]);

        const studentsData = await studentsRes.json();
        const groupsData = await groupsRes.json();
        const discussionsData = await discussionsRes.json();

        const studentMap = studentsData.data && Array.isArray(studentsData.data)
          ? studentsData.data.reduce((acc, student) => ({
              ...acc,
              [student.id]: student.name || `Student ${student.id}`
            }), {})
          : {};
        const studentArray = studentsData.data && Array.isArray(studentsData.data)
          ? studentsData.data.map(student => ({
              id: student.id,
              name: student.name || `Student ${student.id}`
            }))
          : [];

        const processedGroups = groupsData.data && Array.isArray(groupsData.data)
          ? groupsData.data.map(group => ({
              id: group.id,
              name: group.name || 'Unnamed Group',
              description: group.description || '',
              members: Array.isArray(group.members) ? group.members.map(m => m?.id || m) : []
            }))
          : [];

        const messages = discussionsData.data && Array.isArray(discussionsData.data)
          ? discussionsData.data.map(d => ({
              id: d.id,
              sender: d.author === currentStudentId ? 'You' : studentMap[d.author] || `Student ${d.author}`,
              author: d.author,
              content: d.message || '',
              time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              group: d.group,
              timestamp: d.timestamp
            }))
          : [];

        console.log('Fetched studentList:', studentArray); // Debug log
        setStudents(studentMap);
        setStudentList(studentArray);
        setGroups(processedGroups);
        setAllMessages(messages);

        const userGroups = processedGroups.filter(g => g.members.includes(currentStudentId));
        setSelectedGroup(userGroups[0]?.id || null);
      } catch (error) {
        console.error('Data loading error:', error);
        setStudents({});
        setStudentList([]);
        setGroups([]);
        setAllMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentStudentId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const res = await fetch(`${BASE_URL}create_discussion/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentStudentId,
          group: selectedGroup,
          message: newMessage
        })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const response = await res.json();
      const data = response.data || response;
      const newMsg = {
        id: data.id,
        sender: 'You',
        author: currentStudentId,
        content: data.message || newMessage,
        time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        group: data.group || selectedGroup,
        timestamp: data.timestamp || Date.now()
      };

      setAllMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.max_students) {
      alert('Please provide a group name and maximum number of students.');
      return;
    }

    try {
      const newGroupData = {
        name: newGroup.name,
        description: newGroup.description || '',
        max_students: parseInt(newGroup.max_students),
        is_private: false,
        student_id: currentStudentId,
        members: newGroup.selectedMembers
      };

      const res = await fetch(`${BASE_URL}create_group/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroupData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = errorData.errors
          ? Object.values(errorData.errors).flat().join(', ')
          : errorData.message || 'Failed to create group';
        throw new Error(errorMsg);
      }

      const response = await res.json();
      console.log('Create group response:', response); // Debug log
      const data = response.data || response;

      if (!data.id || !data.name) {
        throw new Error('Invalid group data: missing id or name');
      }

      const newGroupObj = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        members: Array.isArray(data.members) ? data.members : [currentStudentId]
      };

      setGroups(prevGroups => [...prevGroups, newGroupObj]);
      setShowCreateGroupModal(false);
      setNewGroup({ name: '', description: '', max_students: 5, selectedMembers: [] });
    } catch (error) {
      console.error('Error creating group:', error);
      alert(`Failed to create group: ${error.message}`);
    }
  };

  const toggleStudentSelection = (studentId, modalType, groupId = null) => {
    console.log(`Toggling student ${studentId} for ${modalType}`);
    if (modalType === 'create') {
      setNewGroup(prev => ({
        ...prev,
        selectedMembers: prev.selectedMembers.includes(studentId)
          ? prev.selectedMembers.filter(id => id !== studentId)
          : [...prev.selectedMembers, studentId]
      }));
    } else if (modalType === 'add') {
      setAddMemberIds(prev =>
        prev.includes(studentId)
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
    } else if (modalType === 'remove') {
      setRemoveMemberIds(prev =>
        prev.includes(studentId)
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
    }
  };

  const addMember = async (groupId) => {
    if (addMemberIds.length === 0) {
      alert('Please select at least one student to add.');
      return;
    }

    try {
      for (const studentId of addMemberIds) {
        const res = await fetch(`${BASE_URL}add_member/${groupId}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: studentId })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to add student ${studentId}`);
        }
      }

      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, members: [...group.members, ...addMemberIds] }
            : group
        )
      );
      setAddMemberIds([]);
      setShowAddMemberModal(null);
    } catch (error) {
      console.error('Error adding members:', error);
      alert(error.message || 'Failed to add members. Please try again.');
    }
  };

  const removeMember = async (groupId, studentIds) => {
    if (!studentIds || studentIds.length === 0) {
      alert('No students selected to remove.');
      return;
    }

    try {
      for (const studentId of studentIds) {
        const res = await fetch(`${BASE_URL}remove_member/${groupId}/`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: studentId })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to remove student ${studentId}`);
        }
      }

      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, members: group.members.filter(id => !studentIds.includes(id)) }
            : group
        )
      );
      setRemoveMemberIds([]);
      setShowRemoveMemberModal(null);
      if (groupId === selectedGroup) {
        const remainingGroups = groups.filter(g => g.id !== groupId && g.members.includes(currentStudentId));
        setSelectedGroup(remainingGroups[0]?.id || null);
      }
    } catch (error) {
      console.error('Error removing members:', error);
      alert(error.message || 'Failed to remove members. Please try again.');
    }
  };

  const initiateLeaveGroup = (groupId) => {
    setLeaveConfirmation({ show: true, groupId });
    setShowOptions(null);
  };

  const cancelLeaveGroup = () => {
    setLeaveConfirmation({ show: false, groupId: null });
  };

  const confirmLeaveGroup = async () => {
    const groupId = leaveConfirmation.groupId;
    await removeMember(groupId, [currentStudentId]);
    setLeaveConfirmation({ show: false, groupId: null });
  };

  const initiateDelete = (messageId) => {
    setDeleteConfirmation({ show: true, messageId });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, messageId: null });
  };

  const deleteMessage = async () => {
    const messageId = deleteConfirmation.messageId;
    try {
      const res = await fetch(`${BASE_URL}delete_discussion/${messageId}/`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete message');

      setAllMessages(prev => prev.filter(msg => msg.id !== messageId));
      setDeleteConfirmation({ show: false, messageId: null });
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const getLatestMessage = (groupId) => {
    const groupMessages = allMessages
      .filter(msg => msg.group === groupId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return groupMessages[0] || null;
  };

  const filteredGroups = groups.filter(group => {
    const isMember = group.members.includes(currentStudentId);
    const groupMessages = allMessages.filter(msg => msg.group === group.id);

    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      groupMessages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return isMember && matchesSearch;
  });

  if (isLoading) return (
    <div className={`flex h-[calc(95vh-5rem)] w-[calc(95%-12rem)] mt-20 mx-auto rounded-2xl overflow-hidden justify-center items-center ${isDark ? 'bg-gray-800 text-white' : 'bg-[#9ec67f] text-white'}`}>
      Loading messages...
    </div>
  );

  return (
    <div className={`flex h-[calc(95vh-5rem)] w-[calc(95%-12rem)] mt-20 mx-auto rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-[#9ec67f]'}`}>
      
      {/* Left Sidebar - Groups List with Search */}
      <div className={`w-1/4 p-4 overflow-y-auto ${isDark ? 'bg-gray-700' : 'bg-[#79A657]'}`}>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-2 pl-10 rounded-lg ${isDark ? 'bg-gray-600 text-white placeholder-gray-300' : 'bg-white text-gray-900 placeholder-gray-500'}`}
            />
            <Search size={20} className={`absolute left-3 top-2.5 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
          </div>
          <button 
            onClick={() => setShowCreateGroupModal(true)} 
            className={`ml-2 p-2 rounded-full cursor-pointer ${isDark ? 'bg-gray-600 ring-2 ring-gray-400' : 'bg-white ring-2 ring-[#9ec67f]'}`}
            title="Create New Group"
          >
            <Plus size={20} />
          </button>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center">
            <p className={isDark ? 'text-gray-300' : 'text-white'}>
              {searchQuery ? 'No matching groups found' : 'No groups available'}
            </p>
          </div>
        ) : (
          filteredGroups
            .map(group => {
              const latestMessage = getLatestMessage(group.id);
              return {
                ...group,
                latestTimestamp: latestMessage ? new Date(latestMessage.timestamp) : 0
              };
            })
            .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
            .map(group => {
              const latestMessage = getLatestMessage(group.id);
              return (
                <div
                  key={group.id}
                  className={`p-3 mb-2 rounded-lg cursor-pointer relative group ${selectedGroup === group.id ? (isDark ? 'bg-gray-600 ring-2 ring-gray-400' : 'bg-white ring-2 ring-[#9ec67f]') : (isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white/80 hover:bg-white')}`}
                >
                  <div className="relative">
                    <div className="pr-8">
                      <div onClick={() => setSelectedGroup(group.id)}>
                        <h3 className="font-bold truncate">{group.name}</h3>
                        {latestMessage ? (
                          <div className="text-sm truncate max-w-[calc(100%-2rem)]">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {latestMessage.sender}:{" "}
                            </span>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              {latestMessage.content.length > 50
                                ? latestMessage.content.substring(0, 47) + '...'
                                : latestMessage.content}
                            </span>
                          </div>
                        ) : (
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            No messages yet
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOptions(showOptions === group.id ? null : group.id)}
                      className="absolute top-0 right-0 p-1 text-gray-500 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  {showOptions === group.id && (
                    <div className={`absolute right-0 top-10 z-10 w-40 rounded-md shadow-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                      <button
                        onClick={() => setShowAddMemberModal(group.id)}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Add Member
                      </button>
                      <button
                        onClick={() => setShowRemoveMemberModal(group.id)}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Remove Member
                      </button>
                      <button
                        onClick={() => initiateLeaveGroup(group.id)}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Leave Group
                      </button>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-[#9ec67f]'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>
              {groups.find(g => g.id === selectedGroup)?.name || 'Select a group'}
            </h2>
            <p className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-white'}`}>
              {groups.find(g => g.id === selectedGroup)?.description || 'No description'}
            </p>
          </div>
        </div>

        <div className={`flex-1 p-4 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {selectedGroup ? (
            allMessages
              .filter(m => m.group === selectedGroup)
              .map(message => (
                <div
                  key={message.id}
                  className={`max-w-md mb-4 p-3 rounded-lg relative group ${message.sender === 'You' ? (isDark ? 'bg-gray-700 ml-auto' : 'bg-[#79A657] text-white ml-auto') : (isDark ? 'bg-gray-800' : 'bg-white')}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{message.sender}</span>
                    <span className="text-xs opacity-75">{message.time}</span>
                  </div>
                  <p>{message.content}</p>
                  {message.author === currentStudentId && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateDelete(message.id);
                      }}
                      className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
          ) : (
            <div className="text-center p-8">
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Select a group to start chatting</p>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
              
        {/* Chat Input */}
        <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-[#9ec67f]'}`}>
          <form onSubmit={sendMessage} className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-white/80 text-black placeholder-gray-500"
              placeholder="Type your message..."
            />
            <button type="submit" className="ml-3">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Create Group Modal with Blurred Background */}
      {showCreateGroupModal && (
        <div className="fixed top-0 left-0 z-50 w-full h-full backdrop-blur-md bg-black/20">
          <div className="flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
              <h2 className="font-bold text-lg mb-4">Create New Group</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Max Students</label>
                <input
                  type="number"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-lg"
                  value={newGroup.max_students}
                  onChange={(e) => setNewGroup({ ...newGroup, max_students: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Members</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {studentList.length > 0 ? (
                    studentList.map(student => (
                      <div key={student.id} className="flex items-center py-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id={`create-student-${student.id}`}
                            checked={newGroup.selectedMembers.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id, 'create')}
                            className="h-4 w-4 accent-[#79A657] border-gray-300 rounded focus:ring-[#79A657] checked:bg-[#79A657] checked:border-[#79A657] mr-2"
                          />
                          <span>{student.name || 'Unknown'}</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No students available</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  className="bg-gray-600 text-white p-2 rounded"
                  onClick={() => setShowCreateGroupModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#79A657] text-white p-2 rounded"
                  onClick={createGroup}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed top-0 left-0 z-50 w-full h-full backdrop-blur-md bg-black/20">
          <div className="flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Add Member</h2>
                <button
                  onClick={() => setShowAddMemberModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Select Students to Add</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {studentList.length > 0 ? (
                    studentList
                      .filter(student => !groups.find(g => g.id === showAddMemberModal)?.members.includes(student.id))
                      .map(student => (
                        <div key={student.id} className="flex items-center py-1">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id={`add-student-${student.id}`}
                              checked={addMemberIds.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id, 'add')}
                              className="h-4 w-4 accent-[#79A657] border-gray-300 rounded focus:ring-[#79A657] checked:bg-[#79A657] checked:border-[#79A657] mr-2"
                            />
                            <span>{student.name || 'Unknown'}</span>
                          </label>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500">No students available</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowAddMemberModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#79A657] text-white rounded hover:bg-[#6B8E4E]"
                  onClick={() => addMember(showAddMemberModal)}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveMemberModal && (
        <div className="fixed top-0 left-0 z-50 w-full h-full backdrop-blur-md bg-black/20">
          <div className="flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Remove Member</h2>
                <button
                  onClick={() => setShowRemoveMemberModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Select Students to Remove</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {studentList.length > 0 ? (
                    studentList
                      .filter(student => groups.find(g => g.id === showRemoveMemberModal)?.members.includes(student.id))
                      .map(student => (
                        <div key={student.id} className="flex items-center py-1">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id={`remove-student-${student.id}`}
                              checked={removeMemberIds.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id, 'remove')}
                              className="h-4 w-4 accent-[#79A657] border-gray-300 rounded focus:ring-[#79A657] checked:bg-[#79A657] checked:border-[#79A657] mr-2"
                            />
                            <span>{student.name || 'Unknown'}</span>
                          </label>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500">No students available</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowRemoveMemberModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => removeMember(showRemoveMemberModal, removeMemberIds)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed top-0 left-0 z-50 w-full h-full backdrop-blur-md bg-black/20">
          <div className="flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Delete Message?</h2>
                <button onClick={cancelDelete} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={deleteMessage}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Confirmation Modal */}
      {leaveConfirmation.show && (
        <div className="fixed top-0 left-0 z-50 w-full h-full backdrop-blur-md bg-black/20">
          <div className="flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Leave Group?</h2>
                <button onClick={cancelLeaveGroup} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <p className="mb-6">Are you sure you want to leave this group? You will no longer have access to its messages.</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={cancelLeaveGroup}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={confirmLeaveGroup}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBoxRoom;