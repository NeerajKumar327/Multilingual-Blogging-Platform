import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, MessageCircle, Globe, User } from 'lucide-react';

interface StatsProps {
  totalPosts: number;
  myPosts: number;
  totalComments: number;
  languagesUsed: number;
}

export const DashboardStats: React.FC<StatsProps> = ({ 
  totalPosts, 
  myPosts, 
  totalComments, 
  languagesUsed 
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('dashboard.stats.totalPosts'),
      value: totalPosts,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: t('dashboard.stats.myPosts'),
      value: myPosts,
      icon: User,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: t('dashboard.stats.comments'),
      value: totalComments,
      icon: MessageCircle,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: t('dashboard.stats.languages'),
      value: languagesUsed,
      icon: Globe,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative overflow-hidden"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                <motion.p 
                  className="text-3xl font-bold text-white mt-1"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  {stat.value}
                </motion.p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};