import AWS from 'aws-sdk';
import axios from 'axios';
import awsConfig from '../../aws-config';
import { nanoid } from 'nanoid';
import { getAuthenticatedToken } from '../Auth/AuthService';

AWS.config.update({ region: awsConfig.Region });

export async function fetchTasks(listId) {
    const token = await getAuthenticatedToken();

    const response = await axios.get(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      params: { ListId: listId }  // Ensure this matches the query parameter name expected by your API
    });
    return response.data || [];
  } 
export async function addTask(name, listId) {
  const token = await getAuthenticatedToken();
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token to get the userId
    const userId = decodedToken.sub;

    const newTask = { TaskId: nanoid(), listId, taskName: name, completed: false, userId };

    const response = await axios.post('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks', newTask, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return response.data || newTask;
  } 

export async function toggleTaskCompleted(id, tasks) {
  const token = await getAuthenticatedToken();

    const taskToUpdate = tasks.find((task) => task.TaskId === id);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

    await axios.put('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks', updatedTask, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return updatedTask;
  } 
export async function deleteTask(taskId) {
  const token = await getAuthenticatedToken();

    try {
      await axios.delete('https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        data: {
          TaskId: taskId
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

export async function editTask(TaskId, taskName) {
  const token = await getAuthenticatedToken();

    try {
      const response = await axios.put(`https://3wretk2l40.execute-api.us-east-1.amazonaws.com/dev/tasks`, {
        TaskId: TaskId,
        taskName: taskName
      }, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      return response.data || { TaskId: TaskId, taskName };
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  } 