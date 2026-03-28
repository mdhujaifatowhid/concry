import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Flame, MessageCircle, Eye } from 'lucide-react';
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
}) => {
  const totalReactions = help_count + humiliate_count;
  const helpPercent = totalReactions > 0 ? Math.round((help_count / totalReactions) * 100) : 50;
  const humiliatePercent = 100 - helpPercent;

  return (
    <Link 
      to={`/c/${id}`}
      className="block group bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          {title && <h3 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors">{title}</h3>}
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
            {formatDistanceToNow(new Date(created_at))} ago
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views}
          </div>
        </div>
      </div>

      <p className="text-gray-600 line-clamp-3 mb-6 leading-relaxed">
        {content}
      </p>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
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
          
          <div className="flex items-center gap-1.5 text-gray-400">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{comment_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ConfessionCard;
