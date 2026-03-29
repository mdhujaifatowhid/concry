import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ConfessionCard from '../components/ConfessionCard';
import { Loader2, TrendingUp, Clock, Shuffle, Megaphone, Pin } from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'latest' | 'trending' | 'random';

const Home: React.FC = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [pinnedConfessions, setPinnedConfessions] = useState<any[]>([]);
  const [topThree, setTopThree] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('cat') || 'All';

  const fetchData = async (tab: Tab, search: string, cat: string) => {
    setLoading(true);
    try {
      const promises = [
        supabase
          .from('notices')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('confessions')
          .select(`*, admin_profiles(name), comments(count), reactions(type)`)
          .eq('is_pinned', true)
          .eq('moderation_status', 'published')
          .eq('is_hidden', false),
        (() => {
          let q = supabase
            .from('confessions')
            .select(`*, admin_profiles(name), comments(count), reactions(type)`)
            .eq('is_hidden', false)
            .eq('moderation_status', 'published')
            .eq('is_pinned', false);
          
          if (cat !== 'All') {
            q = q.eq('category', cat);
          }
          
          if (search.trim()) {
            q = q.or(`content.ilike.%${search.trim()}%,title.ilike.%${search.trim()}%`);
          }

          if (tab === 'latest') q = q.order('created_at', { ascending: false });
          else if (tab === 'trending') q = q.order('views', { ascending: false });
          return q.limit(20);
        })()
      ];

      const [noticesRes, pinnedRes, regularRes] = await Promise.all(promises);
      
      setNotices(noticesRes.data || []);

      // Calculate Daily Top 3 (from all published in last 24h)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentData } = await supabase
        .from('confessions')
        .select(`*, admin_profiles(name), comments(count), reactions(type)`)
        .eq('moderation_status', 'published')
        .eq('is_hidden', false)
        .gt('created_at', twentyFourHoursAgo);

      if (recentData) {
        const processedRecent = recentData.map((c: any) => ({
          ...c,
          comment_count: c.comments[0]?.count || 0,
          help_count: c.reactions.filter((r: any) => r.type === 'help').length,
          humiliate_count: c.reactions.filter((r: any) => r.type === 'humiliate').length,
          me_too_count: c.reactions.filter((r: any) => r.type === 'me_too').length,
          score: (c.comments[0]?.count || 0) * 2 + c.reactions.length + (c.views / 10)
        })).sort((a, b) => b.score - a.score).slice(0, 3);
        setTopThree(processedRecent);
      }

      if (pinnedRes.data) {
        setPinnedConfessions(pinnedRes.data.map((c: any) => ({
          ...c,
          comment_count: c.comments[0]?.count || 0,
          help_count: c.reactions.filter((r: any) => r.type === 'help').length,
          humiliate_count: c.reactions.filter((r: any) => r.type === 'humiliate').length,
        })));
      }

      if (regularRes.data) {
        let processedData = regularRes.data.map((c: any) => ({
          ...c,
          comment_count: c.comments[0]?.count || 0,
          help_count: c.reactions.filter((r: any) => r.type === 'help').length,
          humiliate_count: c.reactions.filter((r: any) => r.type === 'humiliate').length,
          me_too_count: c.reactions.filter((r: any) => r.type === 'me_too').length,
        }));

        if (tab === 'random') {
          processedData = processedData.sort(() => Math.random() - 0.5);
        }
        setConfessions(processedData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab, searchQuery, selectedCategory);
  }, [activeTab, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 pt-4">
      {/* Tabs at the Top - Right below Header */}
      <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 dark:bg-neutral-900 rounded-full w-fit mx-auto border border-gray-200 dark:border-neutral-800 transition-colors">
        {[
          { id: 'latest', label: 'Latest', icon: Clock },
          { id: 'trending', label: 'Trending', icon: TrendingUp },
          { id: 'random', label: 'Random', icon: Shuffle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300",
              activeTab === tab.id 
                ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm" 
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Section - Reduced padding to move up */}
      <div className="text-center space-y-6 py-8 md:py-12">
        {/* Notices */}
        {notices.length > 0 && (
          <div className="max-w-2xl mx-auto px-4 mb-8">
            <div className="bg-black dark:bg-white text-white dark:text-black rounded-2xl p-4 md:p-6 space-y-4 shadow-2xl shadow-black/20 dark:shadow-white/5">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 dark:text-blue-600">
                <Megaphone className="w-3 h-3" /> Admin Notice
              </div>
              <div className="space-y-3">
                {notices.map(notice => (
                  <p key={notice.id} className="text-xs md:text-sm font-medium leading-relaxed opacity-90">
                    {notice.content}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic text-black dark:text-white">
          CONCRY
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-xs md:text-base leading-relaxed px-4">
          The anonymous confession platform where your secrets meet their destiny. 
          Will you be helped or humiliated?
        </p>
        <div className="pt-4">
          <Link 
            to="/create" 
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 inline-flex items-center gap-2"
          >
            Start Confessing
          </Link>
        </div>

        {/* Daily Top 3 */}
        {topThree.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 pt-12 space-y-6">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
              <TrendingUp className="w-3 h-3" /> Today's Top 3
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((c, idx) => (
                <Link 
                  key={c.id} 
                  to={`/c/${c.id}`}
                  className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 text-left hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 dark:opacity-5 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity">
                    <span className="text-4xl font-black italic dark:text-white">#{idx + 1}</span>
                  </div>
                  <div className="space-y-2 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">#{idx + 1} Trending</span>
                      {c.mood && <span className="text-xs">{c.mood}</span>}
                    </div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">
                      {c.content}
                    </p>
                    <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      <span>{c.help_count + c.humiliate_count} Reactions</span>
                      <span>{c.comment_count} Comments</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 max-w-5xl mx-auto space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Pinned Section */}
            {pinnedConfessions.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 px-2">
                  <Pin className="w-3 h-3" /> Pinned Confessions
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pinnedConfessions.map((confession) => (
                    <ConfessionCard key={confession.id} {...confession} isPinned />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Section */}
            <div className="space-y-6">
              {pinnedConfessions.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2">
                  <Clock className="w-3 h-3" /> {activeTab === 'latest' ? 'Latest' : activeTab === 'trending' ? 'Trending' : 'Random'} Feed
                </div>
              )}
              {confessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {confessions.map((confession) => (
                    <ConfessionCard key={confession.id} {...confession} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                  No confessions found. Be the first to confess!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
