import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const moderators = {
      'mod11': 'mod11@concry#19',
      'mod21': 'mod21@concry#18',
      'mod31': 'mod31@concry#87',
      'mod41': 'mod41@concry#32',
      'mod51': 'mod51@concry#73'
    };

    if (username === 'hujaifa' && password === 'Hujaifa@concry#212740') {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_role', 'admin');
      navigate('/admin/dashboard');
    } else if (moderators[username as keyof typeof moderators] === password) {
      localStorage.setItem('admin_session', 'true');
      localStorage.setItem('admin_role', 'moderator');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto pt-20 px-4">
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-black">Admin Access</h1>
        <p className="text-gray-500 text-sm">Authorized personnel only. Please enter your credentials.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-black focus:outline-none focus:border-black/20 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-black focus:outline-none focus:border-black/20 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
        >
          Login to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
