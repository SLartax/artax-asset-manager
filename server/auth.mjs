import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { roleSchema } from '../shared/schemas.mjs';

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function loadUsers(raw) {
  const users = z.array(z.object({ username: z.string().min(1).max(100),
    passwordHash: z.string().regex(/^[a-f0-9]{32}:[a-f0-9]{128}$/), role: roleSchema }).strict()).min(1).max(100).parse(JSON.parse(raw));
  if (new Set(users.map(u => u.username)).size !== users.length) throw new Error('Duplicate users');
  return users;
}
const dummyHash = hashPassword(randomBytes(32).toString('hex'));
export function authenticate(users, username, password) {
  const user = users.find(u => u.username === username);
  const [salt, expected] = (user?.passwordHash || dummyHash).split(':');
  const ok = timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(expected, 'hex'));
  return ok && user ? { username: user.username, role: user.role } : null;
}

export function createSessions(secure) {
  const sessions = new Map(); const name = secure ? '__Host-artax_session' : 'artax_dev_session';
  const purge = () => { for (const [id, v] of sessions) if (v.expires <= Date.now()) sessions.delete(id); };
  const cookie = (value, age) => `${name}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure ? '; Secure' : ''}`;
  const idFrom = req => (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`))?.slice(name.length + 1);
  return {
    issue(req, user) {
      purge(); sessions.delete(idFrom(req));
      if (sessions.size >= 1000) throw new Error('Too many sessions');
      const id = randomBytes(32).toString('hex'); const csrf = randomBytes(32).toString('hex');
      sessions.set(id, { ...user, csrf, expires: Date.now() + 1800000 });
      return { csrf, cookie: cookie(id, 1800) };
    },
    read(req) { purge(); return sessions.get(idFrom(req)); },
    revoke(req) { sessions.delete(idFrom(req)); return cookie('', 0); }
  };
}
