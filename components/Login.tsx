import React, { useState } from 'react';
import { login, Session } from '../services/api';
export default function Login({ onLogin }: { onLogin: (value: Session) => Promise<void> }) {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  return <main className="max-w-md mx-auto my-20 p-8 bg-white rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold mb-6">Artax Deal Manager</h1>
    <form onSubmit={async e => { e.preventDefault(); setBusy(true); setError('');
      try { await onLogin(await login(username, password)); } catch (err) { setError(err instanceof Error ? err.message : 'Accesso non disponibile'); }
      finally { setPassword(''); setBusy(false); } }}>
      <label className="block mb-4">Utente<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} className="block border p-2 w-full" /></label>
      <label className="block mb-4">Password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="block border p-2 w-full" /></label>
      <button disabled={busy} className="bg-indigo-600 text-white rounded px-6 py-2">Accedi</button>
      {error && <p role="alert" className="text-red-700 mt-4">{error}</p>}
    </form>
    <p className="text-sm text-slate-500 mt-6">Accesso verificato dal server. Configurare il backend prima dell'utilizzo.</p>
  </main>;
}
