#!/usr/bin/env node

const {
  addCommand,
  listCommand,
  doneCommand,
  deleteCommand
} = require('./src/commands');

async function main() {
  const [,, command, ...args] = process.argv;

  try {
    switch (command) {
      case 'add':
        if (args.length === 0) throw new Error('Usage: node cli.js add <text>');
        const newTodo = await addCommand(args.join(' '));
        console.log(`Added todo: "${newTodo.title}" (ID: ${newTodo.id})`);
        break;

      case 'list':
        const todos = await listCommand();
        if (todos.length === 0) {
          console.log('No todos found.');
        } else {
          todos.forEach(t => {
            console.log(`[${t.completed ? 'x' : ' '}] ${t.id}: ${t.title}`);
          });
        }
        break;

      case 'done':
        if (args.length === 0) throw new Error('Usage: node cli.js done <id>');
        const doneTodo = await doneCommand(args[0]);
        console.log(`Marked todo ${doneTodo.id} as done.`);
        break;

      case 'delete':
        if (args.length === 0) throw new Error('Usage: node cli.js delete <id>');
        const deletedTodo = await deleteCommand(args[0]);
        console.log(`Deleted todo: "${deletedTodo.title}"`);
        break;

      default:
        console.log('Usage: node cli.js <add|list|done|delete> [args]');
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();