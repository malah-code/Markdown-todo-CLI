const fs = require('fs').promises;
const path = require('path');

const DEFAULT_FILE = path.join(__dirname, '..', 'todos.json');

/**
 * Reads todos from a JSON file.
 * @param {string} [filePath] - Optional custom file path
 * @returns {Promise<Array>} - Array of todos (empty array if file doesn't exist or is empty)
 */
async function readTodos(filePath = DEFAULT_FILE) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const trimmed = data.trim();
    if (!trimmed) return [];
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    if (err instanceof SyntaxError) {
      console.warn('Invalid JSON in todos file, returning empty array');
      return [];
    }
    throw err;
  }
}

/**
 * Writes todos to a JSON file atomically.
 * @param {Array} todos - Array of todo objects
 * @param {string} [filePath] - Optional custom file path
 * @returns {Promise<void>}
 */
async function writeTodos(todos, filePath = DEFAULT_FILE) {
  if (!Array.isArray(todos)) {
    throw new Error('Todos must be an array');
  }
  const tempPath = `${filePath}.tmp`;
  const data = JSON.stringify(todos, null, 2);
  await fs.writeFile(tempPath, data, 'utf-8');
  await fs.rename(tempPath, filePath);
}

/**
 * Adds a new todo to the store.
 * @param {Object} todo - Todo object (should have id, title, completed)
 * @param {string} [filePath] - Optional custom file path
 * @returns {Promise<Object>} - The added todo
 */
async function addTodo(todo, filePath = DEFAULT_FILE) {
  const todos = await readTodos(filePath);
  todos.push(todo);
  await writeTodos(todos, filePath);
  return todo;
}

/**
 * Updates a todo by ID.
 * @param {string|number} id - Todo ID
 * @param {Object} updates - Properties to update
 * @param {string} [filePath] - Optional custom file path
 * @returns {Promise<Object|null>} - Updated todo or null if not found
 */
async function updateTodo(id, updates, filePath = DEFAULT_FILE) {
  const todos = await readTodos(filePath);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return null;
  todos[index] = { ...todos[index], ...updates };
  await writeTodos(todos, filePath);
  return todos[index];
}

/**
 * Deletes a todo by ID.
 * @param {string|number} id - Todo ID
 * @param {string} [filePath] - Optional custom file path
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
async function deleteTodo(id, filePath = DEFAULT_FILE) {
  const todos = await readTodos(filePath);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  await writeTodos(todos, filePath);
  return true;
}

module.exports = {
  readTodos,
  writeTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  DEFAULT_FILE
};