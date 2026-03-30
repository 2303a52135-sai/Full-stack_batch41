import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiChartBar, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { StatsCard } from '../components/ui';
import api from '../utils/api';

const COLORS = ['#c23df0','#a855f7','#7c3aed','#2dd4bf','#f59e0b','#ef4444','#3b82f6','#10b981'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clothing/stats').then(r => setStats(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <h1 className="page-title">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  );

  const categoryData = stats?.categoryBreakdown?.map(c => ({ name: c._id, value: c.count })) || [];
  const seasonData   = stats?.seasonBreakdown?.map(s => ({ name: s._id, count: s.count })) || [];
  const occasionData = stats?.occasionBreakdown?.map(o => ({ name: o._id, count: o.count })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title flex items-center gap-2"><HiChartBar className="w-7 h-7 text-primary-500" />Analytics</h1>
        <p className="page-subtitle">Insights into your wardrobe usage</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={HiChartBar}    label="Total Items"  value={stats?.total ?? 0}        color="purple" />
        <StatsCard icon={HiChartBar}    label="Categories"   value={stats?.categoryBreakdown?.length ?? 0} color="blue" />
        <StatsCard icon={HiTrendingDown} label="Never Worn"  value={stats?.neverWorn ?? 0}    color="rose" />
        <StatsCard icon={HiTrendingUp}  label="Most Worn"    value={stats?.mostWorn?.[0]?.wearCount ?? 0} color="green" trend="wears" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie */}
        {categoryData.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card p-6">
            <h3 className="section-title">By Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} items`]} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Season Bar */}
        {seasonData.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card p-6">
            <h3 className="section-title">By Season</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={seasonData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize:12, fill:'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:12, fill:'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill:'rgba(194,61,240,0.05)' }} contentStyle={{ borderRadius:12, border:'1px solid var(--color-border)', background:'var(--color-surface)' }} />
                <Bar dataKey="count" name="Items" fill="#c23df0" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Occasion Bar */}
        {occasionData.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="card p-6">
            <h3 className="section-title">By Occasion</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={occasionData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill:'rgba(194,61,240,0.05)' }} contentStyle={{ borderRadius:12, border:'1px solid var(--color-border)', background:'var(--color-surface)' }} />
                <Bar dataKey="count" name="Items" fill="#7c3aed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Most worn items */}
        {stats?.mostWorn?.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card p-6">
            <h3 className="section-title flex items-center gap-2"><HiTrendingUp className="w-5 h-5 text-emerald-500"/>Most Worn</h3>
            <div className="space-y-3">
              {stats.mostWorn.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] w-4">#{i+1}</span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-lg flex-shrink-0">
                    {item.image?.url ? <img src={item.image.url} alt="" className="w-full h-full object-cover" /> : '👔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
                    <div className="h-1.5 bg-gray-100 dark:bg-dark-700 rounded-full mt-1 overflow-hidden">
                      <motion.div initial={{ width:0 }} animate={{ width: `${Math.min(100, (item.wearCount / (stats.mostWorn[0]?.wearCount || 1)) * 100)}%` }}
                        transition={{ duration:0.8, delay: i*0.1 }} className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">{item.wearCount}×</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
