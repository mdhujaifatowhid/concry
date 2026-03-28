import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid';
import { Heart, Flame, ShieldAlert, Copy, Check, ArrowRight } from 'lucide-react';
import { cn, filterContent, checkRateLimit, getIpHash } from '../lib/utils';

const Create: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [allowHelp, setAllowHelp] = useState(true);
  const [allowHumiliate, setAllowHumiliate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; secret: string } | null>(null);
  const [copied, setCopied] = useState<'public' | 'secret' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!content.trim()) {
      setError('Confession is required.');
      return;
    }
    if (!allowHelp && !allowHumiliate) {
      setError('At least one reaction type must be enabled.');
      return;
    }

    // Safety Filter
    const filterResult = filterContent(content + ' ' + title);
    if (!filterResult.clean) {
      setError(filterResult.message || 'Content contains prohibited language.');
      return;
    }

    // Rate Limit (2 posts per 10 mins)
    if (!checkRateLimit('post', 2, 10 * 60 * 1000)) {
      setError('You are posting too fast. Please wait 10 minutes.');
      return;
    }

    setLoading(true);
    try {
      const secretKey = nanoid(12);
      const ipHash = await getIpHash();

      const { data, error: insertError } = await supabase
        .from('confessions')
        .insert([
          {
            title: title.trim() || null,
            content: content.trim(),
            allow_help: allowHelp,
            allow_humiliate: allowHumiliate,
            secret_key: secretKey,
            ip_hash: ipHash,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccessData({ id: data.id, secret: secretKey });
    } catch (err: any) {
      console.error('Error creating confession:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'public' | 'secret') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (successData) {
    const publicUrl = `${window.location.origin}/c/${successData.id}`;
    const secretUrl = `${window.location.origin}/m/${successData.secret}`;

    return (
      <div className="max-w-2xl mx-auto space-y-8 py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic text-black">Confession Posted</h2>
          <p className="text-gray-500 text-sm">Your secret is safe with us. Save these links carefully.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Public URL (Share this)</label>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={publicUrl} 
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-blue-600 font-mono"
              />
              <button 
                onClick={() => copyToClipboard(publicUrl, 'public')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied === 'public' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-4 h-4" />
              <label className="text-[10px] uppercase tracking-widest font-bold">Secret Manage URL (Don't share!)</label>
            </div>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={secretUrl} 
                className="flex-1 bg-white border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600 font-mono"
              />
              <button 
                onClick={() => copyToClipboard(secretUrl, 'secret')}
                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              >
                {copied === 'secret' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-red-500/60 italic">Use this link to edit or delete your confession later.</p>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/c/${successData.id}`)}
          className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          View Confession <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8">
      <div className="mb-12 space-y-2">
        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-black">Speak your truth</h2>
        <p className="text-gray-500 text-sm">No accounts. No logs. Just your raw, unfiltered confession.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Title (Optional)</label>
            <input 
              type="text"
              placeholder="Give it a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Confession (Required)</label>
            <textarea 
              rows={6}
              placeholder="What's on your mind? Don't hold back..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-black/20 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setAllowHelp(!allowHelp)}
            className={cn(
              "p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3",
              allowHelp 
                ? "bg-blue-50 border-blue-100 text-blue-600" 
                : "bg-gray-50 border-gray-100 text-gray-300 grayscale"
            )}
          >
            <Heart className={cn("w-8 h-8", allowHelp && "fill-current")} />
            <div className="text-center">
              <span className="block text-xs font-black uppercase tracking-widest">Allow Help</span>
              <span className="text-[10px] opacity-60">Get supportive comments</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAllowHumiliate(!allowHumiliate)}
            className={cn(
              "p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3",
              allowHumiliate 
                ? "bg-red-50 border-red-100 text-red-600" 
                : "bg-gray-50 border-gray-100 text-gray-300 grayscale"
            )}
          >
            <Flame className={cn("w-8 h-8", allowHumiliate && "fill-current")} />
            <div className="text-center">
              <span className="block text-xs font-black uppercase tracking-widest">Allow Humiliate</span>
              <span className="text-[10px] opacity-60">Get roasted / roasts</span>
            </div>
          </button>
        </div>

        <button 
          disabled={loading}
          className="w-full py-5 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-black/5"
        >
          {loading ? 'Posting...' : 'Post Confession'}
        </button>
      </form>
    </div>
  );
};

export default Create;
