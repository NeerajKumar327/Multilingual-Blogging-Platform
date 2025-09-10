import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Post, CreatePostData } from '../../types';
import { postsAPI, commentsAPI } from '../../utils/api';
import { DashboardStats } from './DashboardStats';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, languageFilter, showMyPosts]);

  useEffect(() => {
    loadCommentCounts();
  }, [posts]);

  const loadPosts = async () => {
    try {
      const data = await postsAPI.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommentCounts = async () => {
    const counts: Record<string, number> = {};
    for (const post of posts) {
      try {
        const comments = await commentsAPI.getComments(post.id);
        counts[post.id] = comments.length;
      } catch (error) {
        counts[post.id] = 0;
      }
    }
    setCommentCounts(counts);
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (languageFilter !== 'all') {
      filtered = filtered.filter(post => post.language === languageFilter);
    }

    if (showMyPosts && user) {
      filtered = filtered.filter(post => post.author_id === user.id);
    }

    setFilteredPosts(filtered);
  };

  const handleCreatePost = async (data: CreatePostData) => {
    await postsAPI.createPost(data);
    await loadPosts();
    setIsCreateModalOpen(false);
  };

  const handleUpdatePost = async (data: CreatePostData) => {
    if (editingPost) {
      await postsAPI.updatePost(editingPost.id, data);
      await loadPosts();
      setEditingPost(null);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm(t('posts.deletePost') + '?')) {
      await postsAPI.deletePost(id);
      await loadPosts();
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsCreateModalOpen(true);
  };

  const myPosts = posts.filter(post => user && post.author_id === user.id);
  const totalComments = Object.values(commentCounts).reduce((sum, count) => sum + count, 0);
  const languagesUsed = new Set(posts.map(post => post.language)).size;

  const languages = [
    { code: 'all', name: 'All Languages' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'de', name: 'Deutsch' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm border-b border-white/20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center"
                >
                  <span className="text-lg font-bold text-white">B</span>
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-white">BlogSphere</h1>
                  <p className="text-white/70 text-sm">
                    {t('dashboard.welcome')}, {user?.full_name}!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout')}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('dashboard.welcome')}
            </h2>
            <p className="text-xl text-white/70 mb-8">
              {t('dashboard.subtitle')}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingPost(null);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg shadow-2xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>{t('dashboard.createPost')}</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <DashboardStats
            totalPosts={posts.length}
            myPosts={myPosts.length}
            totalComments={totalComments}
            languagesUsed={languagesUsed}
          />

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Language Filter */}
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-gray-800">
                    {lang.name}
                  </option>
                ))}
              </select>

              {/* My Posts Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMyPosts(!showMyPosts)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  showMyPosts 
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50' 
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t('dashboard.myPosts')}</span>
              </motion.button>

              {/* Results count */}
              <div className="flex items-center justify-center px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white/70 text-sm">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard
                    post={post}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                    commentCount={commentCounts[post.id] || 0}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="bg-white/5 rounded-xl p-12 border border-white/10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {t('dashboard.noPosts')}
                </h3>
                <p className="text-white/60 mb-6">
                  {showMyPosts 
                    ? "You haven't created any posts yet. Start sharing your thoughts!"
                    : "No posts match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {showMyPosts && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingPost(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('dashboard.createPost')}</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Create/Edit Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
        editPost={editingPost}
      />
    </div>
  );
};