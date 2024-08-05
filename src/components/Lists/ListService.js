import AWS from 'aws-sdk';
import axios from 'axios';
import awsConfig from '../../aws-config';
import { nanoid } from 'nanoid';
import { getAuthenticatedToken } from '../Auth/AuthService';
AWS.config.update({ region: awsConfig.Region });
export async function fetchLists(userId) {
  const token = await getAuthenticatedToken();

    const response = await axios.get(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      params: { userId }
    });
    return response.data || [];
  } 


export async function addList(listName, userId) {
  const token = await getAuthenticatedToken();

  const newList = { ListId: nanoid(), userId, listName };

    try {
      const response = await axios.post('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists', newList, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      return response.data.Item || newList;
    } catch (error) {
      console.error('Error adding list:', error);
      throw error;
    }
  } 

export async function updateList(listId, listName) {
  const token = await getAuthenticatedToken();
    try {
      const response = await axios.put(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists`, {
        ListId: listId,
        listName: listName
      }, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      return response.data || { ListId: listId, listName };
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  } 
export async function deleteList(listId) {
  const token = await getAuthenticatedToken();
    try {
      await axios.delete('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/lists', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        data: {
          ListId: listId
        }
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  }