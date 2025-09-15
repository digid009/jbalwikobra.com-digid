import React from 'react';
import { Users, Shield, UserCheck, Clock } from 'lucide-react';
import { AdminStats, StatItem } from '../ui';

interface UserStatsProps {
  users: any[];
  loading?: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({ users, loading = false }) => {
  // Calculate stats from users data
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.is_active !== false).length;
  const adminUsers = users.filter(user => user.is_admin === true).length;
  const verifiedUsers = users.filter(user => user.phone_verified === true).length;
  const recentUsers = users.filter(user => {
    if (!user.created_at) return false;
    const createdDate = new Date(user.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  // Calculate percentages for trends
  const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const adminPercentage = totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0;
  const verifiedPercentage = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

  const stats: StatItem[] = [
    {
      id: 'total-users',
      label: 'Total Users',
      value: totalUsers,
      icon: <Users />,
      color: 'blue',
      loading,
      change: {
        value: recentUsers,
        type: recentUsers > 0 ? 'increase' : 'neutral',
        period: 'new this month'
      }
    },
    {
      id: 'active-users',
      label: 'Active Users',
      value: activeUsers,
      icon: <UserCheck />,
      color: 'green',
      loading,
      change: {
        value: activePercentage,
        type: activePercentage > 80 ? 'increase' : activePercentage > 60 ? 'neutral' : 'decrease',
        period: 'of total'
      }
    },
    {
      id: 'admin-users',
      label: 'Admin Users',
      value: adminUsers,
      icon: <Shield />,
      color: 'pink',
      loading,
      change: {
        value: adminPercentage,
        type: 'neutral',
        period: 'of total'
      }
    },
    {
      id: 'verified-users',
      label: 'Phone Verified',
      value: verifiedUsers,
      icon: <Clock />,
      color: 'purple',
      loading,
      change: {
        value: verifiedPercentage,
        type: verifiedPercentage > 70 ? 'increase' : verifiedPercentage > 50 ? 'neutral' : 'decrease',
        period: 'verification rate'
      }
    }
  ];

  return <AdminStats stats={stats} columns={4} size="md" />;
};
