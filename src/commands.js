const {
  readTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  DEFAULT_FILE
} = require('./store');

/**
 * Adds a new todo with the given text.
 */
async function addCommand(text, filePath = DEFAULT_FILE) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Todo text cannot be empty');
  }
  
  const todo = {
    id: Date.now(),
    title: text.trim(),
    completed: false
  };
  
  return await addTodo(todo, filePath);
}

/**
 * Lists all todos.
 */
async function listCommand(filePath = DEFAULT_FILE) {
  return await readTodos(filePath);
}

/**
 * Marks a todo as completed.
 */
async function doneCommand(id, filePath = DEFAULT_FILE) {
  if (id === undefined || id === null || id === '') {
    throw new Error('Todo ID is required');
  }
  
  const numericId = typeof id === 'string' && !isNaN(id) ? Number(id) : id;
  const updated = await updateTodo(numericId, { completed: true }, filePath);
  
  if (updated === null) {
    throw new Error(`Todo with ID ${id} not found`);
  }
  
  return updated;
}

/**
 * Deletes a todo by ID.
 */
async function deleteCommand(id, filePath = DEFAULT_FILE) {
  if (id === undefined || id === null || id === '') {
    throw new Error('Todo ID is required');
  }
  
  const numericId = typeof id === 'string' && !isNaN(id) ? Number(id) : id;
  const todos = await readTodos(filePath);
  const todoToDelete = todos.find(t => t.id === numericId);
  
  if (!todoToDelete) {
    throw new Error(`Todo with ID ${id} not found`);
  }
  
  await deleteTodo(numericId, filePath);
  return todoToDelete;
}

module.exports = { addCommand, listCommand, doneCommand, deleteCommand, DEFAULT_FILE };
