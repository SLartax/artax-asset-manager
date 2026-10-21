// Read a password from stdin: never include it in argv, Git, or browser config.
import { hashPassword } from './auth.mjs';
let value = '';
for await (const chunk of process.stdin) {
  value += chunk;
  if (value.length > 1026) throw new Error('Password too long');
}
value = value.replace(/\r?\n$/, '');
if (value.length < 12 || value.length > 1024) throw new Error('Use a password of 12-1024 characters');
console.log(hashPassword(value));
