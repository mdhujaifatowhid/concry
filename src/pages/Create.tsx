import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid';
import { Heart, Flame, ShieldAlert, Copy, Check, ArrowRight, Clock } from 'lucide-react';
import { cn, filterContent, checkRateLimit, getIpHash, CATEGORIES } from '../lib/utils';

const Create: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [allowHelp, setAllowHelp] = useState(true);
  const [allowHumiliate, setAllowHumiliate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{ id: string; secret: string } | null>(null);
  const [copied, setCopied] = useState<'public' | 'secret' | null>(null);
  const [adminProfiles, setAdminProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('Other');
  const [mood, setMood] = useState<string | null>(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [showPoll, setShowPoll] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const MOODS = [
    { emoji: '😔', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😌', label: 'Relieved' },
    { emoji: '🤡', label: 'Foolish' },
    { emoji: '🤫', label: 'Secretive' },
    { emoji: '💔', label: 'Heartbroken' },
    { emoji: '🔥', label: 'Wild' },
  ];

  const isAdmin = localStorage.getItem('admin_session') === 'true' && localStorage.getItem('admin_role') === 'admin';

  React.useEffect(() => {
    if (isAdmin) {
      supabase.from('admin_profiles').select('*').order('id', { ascending: true })
        .then(({ data }) => setAdminProfiles(data || []));
    }
  }, [isAdmin]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

    if (!showSafetyModal && !successData) {
      setShowSafetyModal(true);
      return;
    }

    if (showSafetyModal) setShowSafetyModal(false);

    // Safety Filter
    const filterResult = filterContent(content + ' ' + title);
    if (!filterResult.clean) {
      setError(filterResult.message || 'Content contains prohibited language.');
      return;
    }

    setLoading(true);
    try {
      const ipHash = await getIpHash();
      
      // Strict Rate Limit (2 posts per 10 mins from same IP)
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabase
        .from('confessions')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gt('created_at', tenMinsAgo);

      if (countError) throw countError;

      if (count !== null && count >= 2) {
        setRateLimitError(true);
        setError('Rate limit exceeded.');
        setLoading(false);
        return;
      }

      const secretKey = nanoid(12);

      const validPollOptions = pollOptions.filter(opt => opt.trim() !== '');
      const pollData = showPoll && pollQuestion.trim() && validPollOptions.length >= 2 
        ? { question: pollQuestion.trim(), options: validPollOptions }
        : null;

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
            admin_profile_id: selectedProfileId,
            category: category,
            mood: mood,
            poll_question: pollData?.question,
            poll_options: pollData?.options,
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
        {error && !rateLimitError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {rateLimitError && (
          <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 text-orange-600">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight italic">Whoa there, slow down!</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Security Protocol Activated</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-orange-900 font-medium leading-relaxed">
                To prevent spam and keep the platform clean, we only allow <span className="font-black">2 confessions every 10 minutes</span> per user.
              </p>
              <p className="text-xs text-orange-800/60 italic">
                Please take a deep breath, reflect on your secrets, and try again in a few minutes.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => {
                setRateLimitError(false);
                setError(null);
              }}
              className="w-full py-3 bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-orange-600/20"
            >
              I Understand
            </button>
          </div>
        )}

        <div className="space-y-6">
          {isAdmin && adminProfiles.length > 0 && (
            <div className="space-y-3 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
              <label className="text-[10px] text-blue-600 uppercase tracking-widest font-black px-1">Post as Official Profile</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfileId(null)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    selectedProfileId === null ? "bg-blue-600 text-white" : "bg-white text-blue-400 border border-blue-100"
                  )}
                >
                  Anonymous
                </button>
                {adminProfiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProfileId(p.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedProfileId === p.id ? "bg-blue-600 text-white" : "bg-white text-blue-400 border border-blue-100"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

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
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">Category (Required)</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    category === cat 
                      ? "bg-black text-white" 
                      : "bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
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

          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold px-1">How are you feeling?</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.emoji}
                  type="button"
                  onClick={() => setMood(mood === m.emoji ? null : m.emoji)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300",
                    mood === m.emoji 
                      ? "bg-black text-white scale-110 shadow-lg" 
                      : "bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-100"
                  )}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                showPoll ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {showPoll ? '- Remove Poll' : '+ Add a Poll'}
            </button>

            {showPoll && (
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Poll Question</label>
                  <input 
                    type="text"
                    placeholder="e.g., Am I the drama?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Options</label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[idx] = e.target.value;
                          setPollOptions(newOpts);
                        }}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black/20"
                      />
                      {pollOptions.length > 2 && (
                        <button 
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600 px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button 
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-700 px-1"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              </div>
            )}
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
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-black/5"
        >
          {loading ? 'Posting...' : 'Post Confession'}
        </button>
      </form>

      {/* Safety Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black tracking-tight uppercase italic text-black">Safety Check</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Before you post, please ensure your confession is safe for everyone.
              </p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-red-600">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  <span className="font-black uppercase">No Personal Info:</span> Do not share real names, phone numbers, addresses, or social media handles.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-red-600">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  <span className="font-black uppercase">Stay Anonymous:</span> Your IP is hashed for security, but your content is what keeps you safe.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSubmit()}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all"
              >
                I Understand, Post Now
              </button>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="w-full py-3 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
              >
                Back to Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;
