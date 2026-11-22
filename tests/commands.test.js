const fs = require('fs').promises;
const path = require('path');
const { addCommand, listCommand, doneCommand, deleteCommand } = require('../src/commands');

const TEST_FILE = path.join(__dirname, 'test-commands.json');

async function cleanup() {
  try { await fs.unlink(TEST_FILE); } catch (e) {}
}

beforeEach(cleanup);
afterAll(cleanup);

describe('commands', () => {
  test('addCommand adds todo and validates input', async () => {
    const todo = await addCommand('Test Todo', TEST_FILE);
    expect(todo.title).toBe('Test Todo');
    expect(todo.completed).toBe(false);
    await expect(addCommand('', TEST_FILE)).rejects.toThrow('Todo text cannot be empty');
    await expect(addCommand('   ', TEST_FILE)).rejects.toThrow('Todo text cannot be empty');
    await expect(addCommand(null, TEST_FILE)).rejects.toThrow('Todo text cannot be empty');
  });

  test('listCommand returns todos', async () => {
    await addCommand('Task 1', TEST_FILE);
    const list = await listCommand(TEST_FILE);
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Task 1');
  });

  test('doneCommand marks as complete and validates ID', async () => {
    const created = await addCommand('Task', TEST_FILE);
    const updated = await doneCommand(created.id, TEST_FILE);
    expect(updated.completed).toBe(true);
    
    await expect(doneCommand(undefined, TEST_FILE)).rejects.toThrow('Todo ID is required');
    await expect(doneCommand('', TEST_FILE)).rejects.toThrow('Todo ID is required');
    await expect(doneCommand(999, TEST_FILE)).rejects.toThrow('Todo with ID 999 not found');
  });

  test('deleteCommand removes todo and validates ID', async () => {
    const created = await addCommand('Task', TEST_FILE);
    const deleted = await deleteCommand(created.id, TEST_FILE);
    expect(deleted.id).toBe(created.id);
    
    const list = await listCommand(TEST_FILE);
    expect(list).toHaveLength(0);

    await expect(deleteCommand(undefined, TEST_FILE)).rejects.toThrow('Todo ID is required');
    await expect(deleteCommand('', TEST_FILE)).rejects.toThrow('Todo ID is required');
    await expect(deleteCommand(999, TEST_FILE)).rejects.toThrow('Todo with ID 999 not found');
  });
});
