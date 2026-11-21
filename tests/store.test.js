const fs = require('fs').promises;
const path = require('path');
const {
  readTodos,
  writeTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  DEFAULT_FILE
} = require('../src/store');

const TEST_FILE = path.join(__dirname, 'test-todos.json');

async function cleanup() {
  try {
    await fs.unlink(TEST_FILE);
  } catch (e) {
    // ignore
  }
  try {
    await fs.unlink(`${TEST_FILE}.tmp`);
  } catch (e) {
    // ignore
  }
}

beforeEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
});

describe('readTodos', () => {
  test('returns empty array for non-existent file', async () => {
    const todos = await readTodos(TEST_FILE);
    expect(todos).toEqual([]);
  });

  test('returns empty array for empty file', async () => {
    await fs.writeFile(TEST_FILE, '', 'utf-8');
    const todos = await readTodos(TEST_FILE);
    expect(todos).toEqual([]);
  });

  test('returns empty array for whitespace-only file', async () => {
    await fs.writeFile(TEST_FILE, '   \n\t  ', 'utf-8');
    const todos = await readTodos(TEST_FILE);
    expect(todos).toEqual([]);
  });

  test('reads valid JSON array', async () => {
    const data = [{ id: 1, title: 'Test', completed: false }];
    await fs.writeFile(TEST_FILE, JSON.stringify(data), 'utf-8');
    const todos = await readTodos(TEST_FILE);
    expect(todos).toEqual(data);
  });

  test('returns empty array for invalid JSON', async () => {
    await fs.writeFile(TEST_FILE, 'not valid json', 'utf-8');
    const todos = await readTodos(TEST_FILE);
    expect(todos).toEqual([]);
  });

  test('returns empty array for non-array JSON', async () => {
    await fs.writeFile(TEST_FILE, '{"foo": "bar"}', 'utf-8');
    const todos = await readTodos(TEST_FILE);
    expect(todos).toEqual([]);
  });
});

describe('writeTodos', () => {
  test('writes array to file', async () => {
    const data = [{ id: 1, title: 'Test', completed: true }];
    await writeTodos(data, TEST_FILE);
    const content = await fs.readFile(TEST_FILE, 'utf-8');
    expect(JSON.parse(content)).toEqual(data);
  });

  test('throws error for non-array input', async () => {
    await expect(writeTodos('not an array', TEST_FILE)).rejects.toThrow('Todos must be an array');
    await expect(writeTodos(null, TEST_FILE)).rejects.toThrow('Todos must be an array');
    await expect(writeTodos({ foo: 'bar' }, TEST_FILE)).rejects.toThrow('Todos must be an array');
  });

  test('writes atomically (temp file renamed)', async () => {
    const data = [{ id: 1, title: 'Test' }];
    await writeTodos(data, TEST_FILE);
    // Temp file should not exist after rename
    try {
      await fs.access(`${TEST_FILE}.tmp`);
      throw new Error('Temp file should not exist');
    } catch (e) {
      expect(e.code).toBe('ENOENT');
    }
  });
});

describe('addTodo', () => {
  test('adds todo to empty file', async () => {
    const todo = { id: 1, title: 'New Todo', completed: false };
    const added = await addTodo(todo, TEST_FILE);
    expect(added).toEqual(todo);
    const todos = await readTodos(TEST_FILE);
    expect(todos).toHaveLength(1);
    expect(todos[0]).toEqual(todo);
  });

  test('appends todo to existing todos', async () => {
    await writeTodos([{ id: 1, title: 'First' }], TEST_FILE);
    const todo = { id: 2, title: 'Second', completed: false };
    await addTodo(todo, TEST_FILE);
    const todos = await readTodos(TEST_FILE);
    expect(todos).toHaveLength(2);
    expect(todos[1]).toEqual(todo);
  });
});

describe('updateTodo', () => {
  test('updates existing todo', async () => {
    await writeTodos([{ id: 1, title: 'Original', completed: false }], TEST_FILE);
    const updated = await updateTodo(1, { completed: true, title: 'Updated' }, TEST_FILE);
    expect(updated).toEqual({ id: 1, title: 'Updated', completed: true });
    const todos = await readTodos(TEST_FILE);
    expect(todos[0]).toEqual(updated);
  });

  test('returns null for non-existent id', async () => {
    await writeTodos([{ id: 1, title: 'Test' }], TEST_FILE);
    const result = await updateTodo(999, { completed: true }, TEST_FILE);
    expect(result).toBeNull();
  });
});

describe('deleteTodo', () => {
  test('deletes existing todo', async () => {
    await writeTodos([
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
      { id: 3, title: 'Third' }
    ], TEST_FILE);
    const deleted = await deleteTodo(2, TEST_FILE);
    expect(deleted).toBe(true);
    const todos = await readTodos(TEST_FILE);
    expect(todos).toHaveLength(2);
    expect(todos.find(t => t.id === 2)).toBeUndefined();
  });

  test('returns false for non-existent id', async () => {
    await writeTodos([{ id: 1, title: 'Test' }], TEST_FILE);
    const deleted = await deleteTodo(999, TEST_FILE);
    expect(deleted).toBe(false);
    const todos = await readTodos(TEST_FILE);
    expect(todos).toHaveLength(1);
  });
});