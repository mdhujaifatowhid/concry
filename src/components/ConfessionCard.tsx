import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Flame, MessageCircle, Eye, ShieldCheck, Pin } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfessionCardProps {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  views: number;
  help_count: number;
  humiliate_count: number;
  comment_count: number;
  category?: string;
  isPinned?: boolean;
  mood?: string;
  admin_profiles?: {
    name: string;
  };
}

const ConfessionCard: React.FC<ConfessionCardProps> = ({
  id,
  title,
  content,
  created_at,
  views,
  help_count,
  humiliate_count,
  comment_count,
  category,
  isPinned,
  mood,
  admin_profiles,
}) => {
  const totalReactions = help_count + humiliate_count;
  const helpPercent = totalReactions > 0 ? Math.round((help_count / totalReactions) * 100) : 50;
  const humiliatePercent = 100 - helpPercent;

  return (
    <Link 
      to={`/c/${id}`}
      className="block group bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 hover:border-gray-200 dark:hover:border-neutral-700 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          {admin_profiles && (
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
              <ShieldCheck className="w-3 h-3" /> {admin_profiles.name}
            </div>
          )}
          {title && <h3 className="text-lg font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">
              {formatDistanceToNow(new Date(created_at))} ago
            </span>
            {category && (
              <span className="px-2 py-0.5 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {category}
              </span>
            )}
            {mood && (
              <span className="text-sm" title="Feeling this way">
                {mood}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views}
          </div>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed">
        {content}
      </p>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${helpPercent}%` }}
          />
          <div 
            className="h-full bg-red-500 transition-all duration-500" 
            style={{ width: `${humiliatePercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-blue-500">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-bold">{help_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-500">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold">{humiliate_count}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{comment_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ConfessionCard;
