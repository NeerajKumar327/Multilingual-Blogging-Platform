import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Tag, MessageCircle, Edit, Trash2, Share } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
  commentCount?: number;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onEdit, 
  onDelete, 
  commentCount = 0 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: stripHtml(post.content).substring(0, 200) + '...',
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${post.title}\n${window.location.href}`);
    }
  };

  const isOwner = user?.id === post.author_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 group"
    >
      {/* Language badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full">
          {t(`languages.${post.language}`)}
        </span>
        
        {isOwner && (
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(post)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-blue-100 transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(post.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Post content */}
      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-200 transition-colors">
        {post.title}
      </h3>
      
      <div className="text-white/80 mb-4 line-clamp-3">
        <div dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + '...' }} />
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-white/10 text-white/80 rounded-md border border-white/20"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center justify-between text-sm text-white/60 border-t border-white/10 pt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{post.author_name}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            <span>{commentCount}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <Share className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};