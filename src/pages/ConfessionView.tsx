import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Flame, MessageCircle, Eye, ShieldAlert, Send, Loader2, Flag, ShieldCheck } from 'lucide-react';
import { cn, filterContent, checkRateLimit, getIpHash } from '../lib/utils';

const ConfessionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confession, setConfession] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comment Form State
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentType, setCommentType] = useState<'help' | 'humiliate' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [adminProfiles, setAdminProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<any[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);

  const isAdmin = localStorage.getItem('admin_session') === 'true' && localStorage.getItem('admin_role') === 'admin';

  useEffect(() => {
    if (isAdmin) {
      supabase.from('admin_profiles').select('*').order('id', { ascending: true })
        .then(({ data }) => setAdminProfiles(data || []));
    }
  }, [isAdmin]);

  const fetchConfession = useCallback(async () => {
    if (!id) return;
    try {
      const [confRes, commRes] = await Promise.all([
        supabase
          .from('confessions')
          .select(`
            *,
            admin_profiles(name),
            reactions(type, ip_hash),
            poll_votes(option_index, ip_hash)
          `)
          .eq('id', id)
          .eq('is_hidden', false)
          .single(),
        supabase
          .from('comments')
          .select('*, admin_profiles(name)')
          .eq('confession_id', id)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      if (confRes.error) throw confRes.error;
      setConfession(confRes.data);
      
      const ipHash = await getIpHash();
      const votes = confRes.data.poll_votes || [];
      setPollVotes(votes);
      const myVote = votes.find((v: any) => v.ip_hash === ipHash);
      if (myVote) setUserVote(myVote.option_index);

      if (commRes.error) throw commRes.error;
      setComments(commRes.data || []);

      // Increment View (fire and forget)
      supabase.rpc('increment_views', { confession_id: id }).then(({ error: rpcError }) => {
        if (rpcError) console.error('Error incrementing views:', rpcError);
      });
    } catch (err: any) {
      console.error('Error fetching confession:', err);
      setError(err.message || 'Confession not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConfession();
  }, [fetchConfession]);

  const handleReaction = async (type: 'help' | 'humiliate' | 'me_too') => {
    if (!id || !confession) return;
    if (type === 'help' && !confession.allow_help) return;
    if (type === 'humiliate' && !confession.allow_humiliate) return;

    try {
      const ipHash = await getIpHash();
      const { error: rxError } = await supabase
        .from('reactions')
        .insert([{ confession_id: id, type, ip_hash: ipHash }]);

      if (rxError) {
        if (rxError.code === '23505') {
          // Unique constraint violation - already reacted
          return;
        }
        throw rxError;
      }

      // Refresh to get new counts
      fetchConfession();
    } catch (err) {
      console.error('Error reacting:', err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentType || submitting) return;
    setCommentError(null);

    if (!commentText.trim()) {
      setCommentError('Comment text is required.');
      return;
    }

    // Safety Filter
    const filterResult = filterContent(commentText + ' ' + commentName);
    if (!filterResult.clean) {
      setCommentError(filterResult.message || 'Content contains prohibited language.');
      return;
    }

    // Rate Limit (5 comments per min)
    if (!checkRateLimit('comment', 5, 60 * 1000)) {
      setCommentError('You are commenting too fast. Please wait a minute.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('comments')
        .insert([
          {
            confession_id: id,
            type: commentType,
            name: commentName.trim() || 'Anonymous',
            text: commentText.trim(),
            admin_profile_id: selectedProfileId,
          },
        ]);

      if (insertError) throw insertError;

      setCommentText('');
      setCommentName('');
      setCommentType(null);
      fetchConfession();
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setCommentError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (targetType: 'confession' | 'comment', targetId: string) => {
    try {
      const ipHash = await getIpHash();
      const { error: reportError } = await supabase
        .from('reports')
        .insert([{ target_type: targetType, target_id: targetId, ip_hash: ipHash }]);

      if (reportError) throw reportError;

      // Increment report count in the target table
      const table = targetType === 'confession' ? 'confessions' : 'comments';
      const { data: targetData } = await supabase
        .from(table)
        .select('reports_count')
        .eq('id', targetId)
        .single();

      const newCount = (targetData?.reports_count || 0) + 1;
      
      await supabase
        .from(table)
        .update({ 
          reports_count: newCount,
          is_hidden: newCount >= 3 // Auto-hide after 3 reports
        })
        .eq('id', targetId);

      alert('Reported successfully. Thank you for keeping Concry safe.');
      if (newCount >= 3) fetchConfession();
    } catch (err) {
      console.error('Error reporting:', err);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!id || userVote !== null) return;
    try {
      const ipHash = await getIpHash();
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert([{ confession_id: id, option_index: optionIndex, ip_hash: ipHash }]);
      
      if (voteError) throw voteError;
      setUserVote(optionIndex);
      fetchConfession();
    } catch (err) {
      console.error('Error voting:', err);
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
        <h2 className="text-2xl font-bold text-black dark:text-white">{error || 'Confession not found'}</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 dark:text-blue-400 hover:underline">Go Home</button>
      </div>
    );
  }

  const helpCount = confession.reactions.filter((r: any) => r.type === 'help').length;
  const humiliateCount = confession.reactions.filter((r: any) => r.type === 'humiliate').length;
  const meTooCount = confession.reactions.filter((r: any) => r.type === 'me_too').length;
  const totalReactions = helpCount + humiliateCount;
  const helpPercent = totalReactions > 0 ? Math.round((helpCount / totalReactions) * 100) : 50;
  const humiliatePercent = 100 - helpPercent;

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 px-4 pt-8">
      {/* Confession Body */}
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {confession.admin_profiles && (
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
                <ShieldCheck className="w-4 h-4" /> {confession.admin_profiles.name}
              </div>
            )}
            {confession.title && <h1 className="text-3xl font-black tracking-tight uppercase italic text-black dark:text-white">{confession.title}</h1>}
            <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono flex-wrap">
              <span>{formatDistanceToNow(new Date(confession.created_at))} ago</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {confession.views}</span>
              {confession.category && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-500 dark:text-gray-400 font-bold">
                  {confession.category}
                </span>
              )}
              {confession.mood && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-600 dark:text-gray-400 font-bold">
                  Feeling {confession.mood}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReaction('me_too')}
              className="px-4 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all group"
              title="I relate to this"
            >
              <span className="text-sm group-hover:scale-125 transition-transform">🤝</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">{meTooCount} Me Too</span>
            </button>
            <button 
              onClick={() => handleReport('confession', confession.id)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-8 md:p-12 space-y-8">
          <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap italic font-medium">
            "{confession.content}"
          </p>

          {confession.poll_question && (
            <div className="pt-8 border-t border-gray-200/50 dark:border-neutral-800 space-y-6">
              <div className="space-y-1">
                <h4 className="text-lg font-black italic uppercase tracking-tighter text-black dark:text-white">{confession.poll_question}</h4>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{pollVotes.length} votes cast</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {confession.poll_options.map((opt: string, idx: number) => {
                  const votesForOpt = pollVotes.filter(v => v.option_index === idx).length;
                  const percent = pollVotes.length > 0 ? Math.round((votesForOpt / pollVotes.length) * 100) : 0;
                  const isMyVote = userVote === idx;

                  return (
                    <button
                      key={idx}
                      disabled={userVote !== null}
                      onClick={() => handleVote(idx)}
                      className={cn(
                        "relative h-14 rounded-2xl overflow-hidden border transition-all duration-300 group text-left",
                        userVote === null ? "hover:border-black/20 dark:hover:border-white/20" : "cursor-default",
                        isMyVote ? "border-blue-500 bg-blue-50/30 dark:bg-blue-500/5" : "border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950"
                      )}
                    >
                      <div 
                        className={cn(
                          "absolute inset-y-0 left-0 transition-all duration-1000",
                          isMyVote ? "bg-blue-500/10" : "bg-gray-100/50 dark:bg-neutral-800/50"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                      <div className="absolute inset-0 px-4 flex items-center justify-between">
                        <span className={cn(
                          "text-xs font-bold truncate pr-8 transition-colors",
                          isMyVote ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                        )}>
                          {opt}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 shrink-0">{percent}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reaction Bar */}
      <div className="space-y-4">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-blue-600">Help Him ({helpPercent}%)</span>
          <span className="text-red-600">Humiliate Him ({humiliatePercent}%)</span>
        </div>
        <div className="h-4 w-full bg-gray-100 dark:bg-neutral-900 rounded-full overflow-hidden flex border border-gray-200 dark:border-neutral-800 p-0.5">
          <div 
            className="h-full bg-blue-500 rounded-l-full transition-all duration-700" 
            style={{ width: `${helpPercent}%` }}
          />
          <div 
            className="h-full bg-red-500 rounded-r-full transition-all duration-700" 
            style={{ width: `${humiliatePercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={!confession.allow_help}
            onClick={() => handleReaction('help')}
            className={cn(
              "py-4 rounded-2xl border flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all",
              confession.allow_help 
                ? "bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/10" 
                : "bg-gray-50 dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-300 dark:text-gray-700 cursor-not-allowed"
            )}
          >
            <Heart className="w-5 h-5" /> Help ({helpCount})
          </button>
          <button 
            disabled={!confession.allow_humiliate}
            onClick={() => handleReaction('humiliate')}
            className={cn(
              "py-4 rounded-2xl border flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all",
              confession.allow_humiliate 
                ? "bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10" 
                : "bg-gray-50 dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-300 dark:text-gray-700 cursor-not-allowed"
            )}
          >
            <Flame className="w-5 h-5" /> Humiliate ({humiliateCount})
          </button>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Add your voice</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={!confession.allow_help}
            onClick={() => setCommentType('help')}
            className={cn(
              "py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
              commentType === 'help' ? "bg-blue-500 border-blue-500 text-white" : "border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-gray-500 hover:border-blue-500/50"
            )}
          >
            Write Help
          </button>
          <button 
            disabled={!confession.allow_humiliate}
            onClick={() => setCommentType('humiliate')}
            className={cn(
              "py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
              commentType === 'humiliate' ? "bg-red-500 border-red-500 text-white" : "border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-gray-500 hover:border-red-500/50"
            )}
          >
            Write Humiliate
          </button>
        </div>

        {isAdmin && adminProfiles.length > 0 && (
          <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/20 rounded-2xl">
            <label className="text-[9px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-black px-1">Comment as Official Profile</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedProfileId(null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  selectedProfileId === null ? "bg-blue-600 text-white" : "bg-white dark:bg-neutral-950 text-blue-400 border border-blue-100 dark:border-blue-500/20"
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
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    selectedProfileId === p.id ? "bg-blue-600 text-white" : "bg-white dark:bg-neutral-950 text-blue-400 border border-blue-100 dark:border-blue-500/20"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {commentType && (
          <form onSubmit={handleComment} className="space-y-4 animate-in fade-in slide-in-from-top-2">
            {commentError && <p className="text-xs text-red-500">{commentError}</p>}
            <input 
              placeholder="Your anonymous name (optional)"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="w-full bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:border-black/20 dark:focus:border-white/20"
            />
            <div className="relative">
              <textarea 
                placeholder={commentType === 'help' ? "Say something supportive..." : "Roast them hard..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-black/20 dark:focus:border-white/20 resize-none"
                rows={3}
              />
              <button 
                disabled={submitting}
                className={cn(
                  "absolute bottom-3 right-3 p-2 rounded-lg transition-all",
                  commentType === 'help' ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                )}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Help Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-500/20 pb-2">
            <Heart className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">Help Section</h3>
          </div>
          <div className="space-y-4">
            {comments.filter(c => c.type === 'help').length > 0 ? (
              comments.filter(c => c.type === 'help').map(comment => (
                <div key={comment.id} className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 space-y-2 group">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      {comment.admin_profiles && (
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          <ShieldCheck className="w-2.5 h-2.5" /> {comment.admin_profiles.name}
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{comment.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-gray-400 dark:text-gray-500">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                      <button 
                        onClick={() => handleReport('comment', comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Flag className="w-3 h-3 text-gray-300 dark:text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-gray-400 dark:text-gray-600 italic text-center py-4">No help yet.</p>
            )}
          </div>
        </div>

        {/* Humiliate Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-500/20 pb-2">
            <Flame className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">Humiliate Section</h3>
          </div>
          <div className="space-y-4">
            {comments.filter(c => c.type === 'humiliate').length > 0 ? (
              comments.filter(c => c.type === 'humiliate').map(comment => (
                <div key={comment.id} className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 space-y-2 group">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      {comment.admin_profiles && (
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                          <ShieldCheck className="w-2.5 h-2.5" /> {comment.admin_profiles.name}
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400">{comment.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-gray-400 dark:text-gray-500">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                      <button 
                        onClick={() => handleReport('comment', comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Flag className="w-3 h-3 text-gray-300 dark:text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-gray-400 dark:text-gray-600 italic text-center py-4">No roasts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfessionView;
