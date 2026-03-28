import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Flame, MessageCircle, Eye, ShieldAlert, Send, Loader2, Flag } from 'lucide-react';
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

  const fetchConfession = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('confessions')
        .select(`
          *,
          reactions(type, ip_hash)
        `)
        .eq('id', id)
        .eq('is_hidden', false)
        .single();

      if (fetchError) throw fetchError;
      setConfession(data);

      // Fetch Comments
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select('*')
        .eq('confession_id', id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (commentError) throw commentError;
      setComments(commentData);

      // Increment View
      await supabase.rpc('increment_views', { confession_id: id });
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

  const handleReaction = async (type: 'help' | 'humiliate') => {
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
        <h2 className="text-2xl font-bold text-black">{error || 'Confession not found'}</h2>
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
      {/* Confession Body */}
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {confession.title && <h1 className="text-3xl font-black tracking-tight uppercase italic text-black">{confession.title}</h1>}
            <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              <span>{formatDistanceToNow(new Date(confession.created_at))} ago</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {confession.views}</span>
            </div>
          </div>
          <button 
            onClick={() => handleReport('confession', confession.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-12">
          <p className="text-xl md:text-2xl text-gray-800 leading-relaxed whitespace-pre-wrap italic font-medium">
            "{confession.content}"
          </p>
        </div>
      </div>

      {/* Reaction Bar */}
      <div className="space-y-4">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-blue-600">Help Him ({helpPercent}%)</span>
          <span className="text-red-600">Humiliate Him ({humiliatePercent}%)</span>
        </div>
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex border border-gray-200 p-0.5">
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
                ? "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100" 
                : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
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
                ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100" 
                : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
            )}
          >
            <Flame className="w-5 h-5" /> Humiliate ({humiliateCount})
          </button>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-black uppercase tracking-widest text-black">Add your voice</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={!confession.allow_help}
            onClick={() => setCommentType('help')}
            className={cn(
              "py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
              commentType === 'help' ? "bg-blue-500 border-blue-500 text-white" : "border-gray-200 text-gray-400 hover:border-blue-500/50"
            )}
          >
            Write Help
          </button>
          <button 
            disabled={!confession.allow_humiliate}
            onClick={() => setCommentType('humiliate')}
            className={cn(
              "py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
              commentType === 'humiliate' ? "bg-red-500 border-red-500 text-white" : "border-gray-200 text-gray-400 hover:border-red-500/50"
            )}
          >
            Write Humiliate
          </button>
        </div>

        {commentType && (
          <form onSubmit={handleComment} className="space-y-4 animate-in fade-in slide-in-from-top-2">
            {commentError && <p className="text-xs text-red-500">{commentError}</p>}
            <input 
              placeholder="Your anonymous name (optional)"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:border-black/20"
            />
            <div className="relative">
              <textarea 
                placeholder={commentType === 'help' ? "Say something supportive..." : "Roast them hard..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 resize-none"
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
          <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2">
            <Heart className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">Help Section</h3>
          </div>
          <div className="space-y-4">
            {comments.filter(c => c.type === 'help').length > 0 ? (
              comments.filter(c => c.type === 'help').map(comment => (
                <div key={comment.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2 group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-600">{comment.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-gray-400">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                      <button 
                        onClick={() => handleReport('comment', comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Flag className="w-3 h-3 text-gray-300 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-gray-400 italic text-center py-4">No help yet.</p>
            )}
          </div>
        </div>

        {/* Humiliate Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-red-600 border-b border-red-100 pb-2">
            <Flame className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">Humiliate Section</h3>
          </div>
          <div className="space-y-4">
            {comments.filter(c => c.type === 'humiliate').length > 0 ? (
              comments.filter(c => c.type === 'humiliate').map(comment => (
                <div key={comment.id} className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2 group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-red-600">{comment.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-gray-400">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                      <button 
                        onClick={() => handleReport('comment', comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Flag className="w-3 h-3 text-gray-300 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-gray-400 italic text-center py-4">No roasts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfessionView;
