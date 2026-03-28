import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ConfessionCard from '../components/ConfessionCard';
import { Loader2, TrendingUp, Clock, Shuffle } from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'latest' | 'trending' | 'random';

const Home: React.FC = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('latest');

  const fetchConfessions = async (tab: Tab) => {
    setLoading(true);
    try {
      let query = supabase
        .from('confessions')
        .select(`
          *,
          comments(count),
          reactions(type)
        `)
        .eq('is_hidden', false);

      if (tab === 'latest') {
        query = query.order('created_at', { ascending: false });
      } else if (tab === 'trending') {
        // Simple trending: most views for now, ideally most reactions
        query = query.order('views', { ascending: false });
      } else if (tab === 'random') {
        // Random is tricky in Supabase, we'll just shuffle client-side for now
        // or use a random offset
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      let processedData = data.map((c: any) => ({
        ...c,
        comment_count: c.comments[0]?.count || 0,
        help_count: c.reactions.filter((r: any) => r.type === 'help').length,
        humiliate_count: c.reactions.filter((r: any) => r.type === 'humiliate').length,
      }));

      if (tab === 'random') {
        processedData = processedData.sort(() => Math.random() - 0.5);
      }

      setConfessions(processedData);
    } catch (err) {
      console.error('Error fetching confessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions(activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-8 pt-4">
      {/* Tabs at the Top - Right below Header */}
      <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-full w-fit mx-auto border border-gray-200">
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
                ? "bg-white text-black shadow-sm" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Section - Reduced padding to move up */}
      <div className="text-center space-y-6 py-8 md:py-12">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic text-black">
          CONCRY
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-xs md:text-base leading-relaxed px-4">
          The anonymous confession platform where your secrets meet their destiny. 
          Will you be helped or humiliated?
        </p>
        <div className="pt-4">
          <Link 
            to="/create" 
            className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl shadow-black/10 inline-flex items-center gap-2"
          >
            Start Confessing
          </Link>
        </div>

        {/* Warning Section exposed down the confess section */}
        <div className="pt-6 max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-left">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Safety First</h4>
              <p className="text-[10px] text-red-800 leading-tight">
                Do not share real names, addresses, or any identifying information. 
                Keep it anonymous. Keep it safe.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : confessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {confessions.map((confession) => (
              <ConfessionCard key={confession.id} {...confession} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No confessions found. Be the first to confess!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
