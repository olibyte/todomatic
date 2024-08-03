import React, { useState, useEffect } from 'react';
import Form from './Form';
import FilterButton from './FilterButton';
import Todo from './Todo';
import { fetchTasks, addTask, toggleTaskCompleted, deleteTask, editTask } from './TaskService';

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function TodoList({ listId }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function loadTasks() {
      try {
        const tasks = await fetchTasks(listId);
        setTasks(tasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }

    if (listId) {
      loadTasks();
    }
  }, [listId]);

  async function handleAddTask(name) {
    try {
      const newTask = await addTask(name, listId);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function handleToggleTaskCompleted(id) {
    try {
      const updatedTask = await toggleTaskCompleted(id, tasks);
      const updatedTasks = tasks.map((task) =>
        task.TaskId === id ? updatedTask : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task completed:', error);
    }
  }

  async function handleDeleteTask(id) {
    try {
      await deleteTask(id);
      const remainingTasks = tasks.filter((task) => id !== task.TaskId);
      setTasks(remainingTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async function handleEditTask(id, newName) {
    try {
      const updatedTask = await editTask(id, newName, tasks);
      const updatedTasks = tasks.map((task) =>
        task.TaskId === id ? updatedTask : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error editing task:', error);
    }
  }

  const taskCounts = {
    All: tasks.length,
    Active: tasks.filter(FILTER_MAP.Active).length,
    Completed: tasks.filter(FILTER_MAP.Completed).length,
  };

  return (
    <div>
      <Form addTask={handleAddTask} />
      <div className="filters btn-group stack-exception">
        {FILTER_NAMES.map((name) => (
          <FilterButton
            key={name}
            name={name}
            count={taskCounts[name]}
            isPressed={name === filter}
            setFilter={setFilter}
          />
        ))}
      </div>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {tasks.filter(FILTER_MAP[filter]).map((task) => (
          <Todo
            id={task.TaskId}
            name={task.taskName}
            completed={task.completed}
            key={task.TaskId}
            toggleTaskCompleted={handleToggleTaskCompleted}
            deleteTask={handleDeleteTask}
            editTask={handleEditTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
