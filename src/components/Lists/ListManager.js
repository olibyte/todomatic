import React, { useState, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import awsConfig from '../../aws-config';
import { fetchLists, addList, updateList, deleteList } from './ListService';

const ListManager = ({ lists, setLists, setSelectedListId }) => {
  const [newListName, setNewListName] = useState('');
  const [userId, setUserId] = useState(null);
  const [editListId, setEditListId] = useState(null);
  const [editListName, setEditListName] = useState('');

  useEffect(() => {
    const userPool = new CognitoUserPool({
      UserPoolId: awsConfig.UserPoolId,
      ClientId: awsConfig.ClientId,
    });
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          return;
        }
        const idToken = session.getIdToken().getJwtToken();
        const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
        setUserId(decodedToken.sub); // Assuming sub is the user ID
      });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchLists(userId).then(setLists).catch(error => console.error('Error fetching lists:', error));
    }
  }, [userId, setLists]);

  const handleAddList = async () => {
    if (!newListName || !userId) return;

    try {
      const newList = await addList(newListName, userId);
      setLists([...lists, newList]);
      setNewListName('');
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  const handleEditList = async () => {
    if (!editListName || !editListId) return;

    try {
      await updateList(editListId, editListName);
      setLists(lists.map(list => (list.ListId === editListId ? { ...list, listName: editListName } : list)));
      setEditListId(null);
      setEditListName('');
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleDeleteList = async (ListId) => {
    try {
      await deleteList(ListId);
      setLists(lists.filter(list => list.ListId !== ListId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  return (
    <div>
      <h2>Manage Your Lists</h2>
      <input
        type="text"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        placeholder="New List Name"
      />
      <button onClick={handleAddList}>Add List</button>
      {editListId && (
        <div>
          <input
            type="text"
            value={editListName}
            onChange={(e) => setEditListName(e.target.value)}
            placeholder="Edit List Name"
          />
          <button onClick={handleEditList}>Update List</button>
        </div>
      )}
      <ul>
        {lists && lists.length > 0 ? (
          lists.map((list) => (
            <li key={list.ListId}>
              {list.listName}
              <button onClick={() => { setEditListId(list.ListId); setEditListName(list.listName); }}>Edit</button>
              <button onClick={() => handleDeleteList(list.ListId)}>Delete</button>
              <button onClick={() => setSelectedListId(list.ListId)}>Select</button>
            </li>
          ))
        ) : (
          <li>No lists available</li>
        )}
      </ul>
    </div>
  );
};

export default ListManager;
