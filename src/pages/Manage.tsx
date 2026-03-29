import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Trash2, Save, Heart, Flame, Eye, Loader2, ArrowLeft } from 'lucide-react';
import { cn, filterContent } from '../lib/utils';

const Manage: React.FC = () => {
  const { secret } = useParams<{ secret: string }>();
  const navigate = useNavigate();
  const [confession, setConfession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [allowHelp, setAllowHelp] = useState(true);
  const [allowHumiliate, setAllowHumiliate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfession = async () => {
      if (!secret) return;
      try {
        const { data, error: fetchError } = await supabase
          .from('confessions')
          .select(`
            *,
            reactions(type)
          `)
          .eq('secret_key', secret)
          .single();

        if (fetchError) throw fetchError;
        
        setConfession(data);
        setTitle(data.title || '');
        setContent(data.content);
        setAllowHelp(data.allow_help);
        setAllowHumiliate(data.allow_humiliate);
      } catch (err: any) {
        console.error('Error fetching confession:', err);
        setError('Invalid secret key or confession deleted.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfession();
  }, [secret]);

  const handleSave = async () => {
    if (!confession || saving) return;
    setSaveError(null);

    if (!content.trim()) {
      setSaveError('Content is required.');
      return;
    }

    // Safety Filter
    const filterResult = filterContent(content + ' ' + title);
    if (!filterResult.clean) {
      setSaveError(filterResult.message || 'Content contains prohibited language.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('confessions')
        .update({
          title: title.trim() || null,
          content: content.trim(),
          allow_help: allowHelp,
          allow_humiliate: allowHumiliate,
        })
        .eq('id', confession.id);

      if (updateError) throw updateError;
      alert('Changes saved!');
    } catch (err: any) {
      console.error('Error updating confession:', err);
      setSaveError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confession) return;
    if (!window.confirm('Are you absolutely sure? This cannot be undone.')) return;

    try {
      const { error: deleteError } = await supabase
        .from('confessions')
        .delete()
        .eq('id', confession.id);

      if (deleteError) throw deleteError;
      alert('Confession deleted.');
      navigate('/');
    } catch (err) {
      console.error('Error deleting confession:', err);
      alert('Failed to delete.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !confession) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-black">{error || 'Access Denied'}</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Go Home</button>
      </div>
    );
  }

  const helpCount = confession.reactions.filter((r: any) => r.type === 'help').length;
  const humiliateCount = confession.reactions.filter((r: any) => r.type === 'humiliate').length;
  const totalReactions = helpCount + humiliateCount;
  const helpPercent = totalReactions > 0 ? Math.round((helpCount / totalReactions) * 100) : 50;
  const humiliatePercent = 100 - helpPercent;

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 px-4 pt-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight uppercase italic text-black flex items-center gap-2">
            Manage Confession
          </h1>
          <p className="text-xs text-gray-400 font-mono">ID: {confession.id}</p>
        </div>
        <button 
          onClick={() => navigate(`/c/${confession.id}`)}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> View Public
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-2">
          <Eye className="w-5 h-5 text-gray-400" />
          <span className="text-2xl font-black text-black">{confession.views}</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Total Views</span>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center gap-2">
          <Heart className="w-5 h-5 text-blue-600" />
          <span className="text-2xl font-black text-blue-600">{helpPercent}%</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Help Rate</span>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center gap-2">
          <Flame className="w-5 h-5 text-red-600" />
          <span className="text-2xl font-black text-red-600">{humiliatePercent}%</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Humiliate Rate</span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Content</label>
            <textarea 
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-black focus:outline-none focus:border-black/20 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setAllowHelp(!allowHelp)}
            className={cn(
              "p-4 rounded-xl border transition-all duration-300 flex items-center justify-center gap-3",
              allowHelp 
                ? "bg-blue-50 border-blue-100 text-blue-600" 
                : "bg-white border-gray-100 text-gray-300 grayscale"
            )}
          >
            <Heart className={cn("w-4 h-4", allowHelp && "fill-current")} />
            <span className="text-[10px] font-black uppercase tracking-widest">Help ON</span>
          </button>

          <button
            type="button"
            onClick={() => setAllowHumiliate(!allowHumiliate)}
            className={cn(
              "p-4 rounded-xl border transition-all duration-300 flex items-center justify-center gap-3",
              allowHumiliate 
                ? "bg-red-50 border-red-100 text-red-600" 
                : "bg-white border-gray-100 text-gray-300 grayscale"
            )}
          >
            <Flame className={cn("w-4 h-4", allowHumiliate && "fill-current")} />
            <span className="text-[10px] font-black uppercase tracking-widest">Humiliate ON</span>
          </button>
        </div>

        {saveError && <p className="text-xs text-red-500 text-center">{saveError}</p>}

        <div className="flex gap-4 pt-4">
          <button 
            onClick={handleDelete}
            className="flex-1 py-4 bg-red-50 text-red-600 border border-red-100 font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manage;
