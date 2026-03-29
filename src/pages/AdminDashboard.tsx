import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trash2, Eye, ShieldAlert, Loader2, LogOut, Search, Filter, MessageSquare, AlertTriangle, Pin, PinOff, Megaphone, UserCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'admin' | 'moderator' | null>(null);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'reported' | 'review' | 'hidden'>('all');
  const [activeTab, setActiveTab] = useState<'posts' | 'notices' | 'profiles'>('posts');

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session') === 'true';
    const userRole = localStorage.getItem('admin_role') as 'admin' | 'moderator';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    setRole(userRole);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    console.time('fetchData');
    try {
      const role = localStorage.getItem('admin_role');
      
      // Fetch confessions with minimal fields for the table
      const { data: cData, error: cError } = await supabase
        .from('confessions')
        .select('id, content, created_at, is_pinned, moderation_status, reports_count')
        .order('created_at', { ascending: false })
        .limit(100);

      if (cError) throw cError;
      setConfessions(cData || []);

      if (role === 'admin') {
        const [noticesRes, profilesRes] = await Promise.all([
          supabase.from('notices').select('*').order('created_at', { ascending: false }),
          supabase.from('admin_profiles').select('*').order('id', { ascending: true })
        ]);
        
        setNotices(noticesRes.data || []);
        setProfiles(profilesRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      console.timeEnd('fetchData');
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string, value: any) => {
    try {
      const { error } = await supabase.from('confessions').update({ [action]: value }).eq('id', id);
      if (error) throw error;
      setConfessions(confessions.map(c => c.id === id ? { ...c, [action]: value } : c));
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('confessions').delete().eq('id', id);
      if (error) throw error;
      setConfessions(confessions.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleNotice = async (content: string) => {
    if (!content) return;
    try {
      const { error } = await supabase.from('notices').insert([{ content }]);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Notice failed:', err);
    }
  };

  const updateProfile = async (id: number, name: string) => {
    try {
      const { error } = await supabase.from('admin_profiles').update({ name }).eq('id', id);
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === id ? { ...p, name } : p));
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_role');
    navigate('/');
  };

  const filteredConfessions = confessions.filter(c => {
    const matchesSearch = (c.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || c.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : 
                         filter === 'reported' ? c.reports_count > 0 : 
                         filter === 'review' ? c.moderation_status === 'pending_review' :
                         filter === 'hidden' ? c.moderation_status === 'hidden' : true;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto pt-8 px-4 space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            {role === 'admin' ? 'Admin' : 'Moderator'} Dashboard <ShieldAlert className={role === 'admin' ? 'text-red-600' : 'text-blue-600'} />
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Logged in as {role}</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest">Logout</button>
      </div>

      {role === 'admin' && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
          {['posts', 'notices', 'profiles'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === t ? "bg-white text-black shadow-sm" : "text-gray-400")}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm"
            />
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'reported', label: 'Reported' },
                { id: 'review', label: 'Review / Unpublished' },
                { id: 'hidden', label: 'Hidden' }
              ].map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id as any)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === f.id ? "bg-black text-white shadow-lg shadow-black/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Confession</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredConfessions.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        {c.is_pinned && <span className="inline-flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full"><Pin className="w-2 h-2" /> Pinned</span>}
                        <p className="text-xs text-gray-600 line-clamp-2">{c.content}</p>
                        <span className="text-[8px] text-gray-400 uppercase">{formatDistanceToNow(new Date(c.created_at))} ago</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        {c.moderation_status === 'pending_review' && <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-full">Pending Review</span>}
                        {c.reports_count > 0 && <span className="text-[8px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-full">{c.reports_count} Reports</span>}
                        {c.moderation_status === 'hidden' && <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-full">Hidden</span>}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        {role === 'admin' && (
                          <>
                            <button onClick={() => handleAction(c.id, 'is_pinned', !c.is_pinned)} className="p-2 bg-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                              {c.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                            </button>
                            {c.moderation_status === 'pending_review' && (
                              <>
                                <button onClick={() => handleAction(c.id, 'moderation_status', 'published')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleAction(c.id, 'moderation_status', 'hidden')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                        {role === 'moderator' && c.moderation_status === 'published' && (
                          <button onClick={() => handleAction(c.id, 'moderation_status', 'pending_review')} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <ShieldAlert className="w-4 h-4" /> Unpublish
                          </button>
                        )}
                        <button onClick={() => navigate(`/c/${c.id}`)} className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white"><Eye className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notices' && role === 'admin' && (
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-4 shadow-sm">
            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">New Notice <Megaphone className="w-5 h-5" /></h3>
            <textarea 
              id="notice-input"
              placeholder="Enter notice content..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm min-h-[100px]"
            />
            <button 
              onClick={() => handleNotice((document.getElementById('notice-input') as HTMLTextAreaElement).value)}
              className="px-8 py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs"
            >
              Post Notice
            </button>
          </div>
          <div className="space-y-4">
            {notices.map(n => (
              <div key={n.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">{n.content}</p>
                <button onClick={async () => { await supabase.from('notices').delete().eq('id', n.id); fetchData(); }} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profiles' && role === 'admin' && (
        <div className="space-y-8">
          {profiles.length === 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-orange-900">No Profiles Found</h3>
                <p className="text-sm text-orange-800/60">The official admin profiles haven't been initialized yet.</p>
              </div>
              <button 
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  btn.disabled = true;
                  btn.innerText = 'Initializing...';
                  try {
                    const { error } = await supabase.from('admin_profiles').insert([
                      { id: 1, name: 'Admin', bio: 'The creator of CONCRY.' },
                      { id: 2, name: 'Concry Support Team', bio: 'Official support and assistance.' }
                    ]);
                    if (error) {
                      if (error.code === '42P01') {
                        throw new Error('The "admin_profiles" table does not exist in your Supabase database. Please run the SQL setup provided in the instructions.');
                      }
                      throw error;
                    }
                    await fetchData();
                  } catch (err: any) {
                    console.error('Initialization failed:', err);
                    alert(err.message || 'Initialization failed. Please check your Supabase connection and ensure the table exists.');
                  } finally {
                    btn.disabled = false;
                    btn.innerText = 'Initialize Default Profiles';
                  }
                }}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-600/20 disabled:opacity-50"
              >
                Initialize Default Profiles
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profiles.map(p => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <UserCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{p.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile {p.id}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Display Name</label>
                  <input 
                    type="text" 
                    defaultValue={p.name}
                    onBlur={(e) => updateProfile(p.id, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
