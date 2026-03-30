import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCollection, HiSparkles, HiHeart, HiCalendar, HiPlus, HiArrowRight, HiRefresh } from 'react-icons/hi';
import { StatsCard, SkeletonGrid, EmptyState } from '../components/ui';
import ClothingCard from '../components/wardrobe/ClothingCard';
import AddClothingModal from '../components/wardrobe/AddClothingModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [unused, setUnused] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, recentRes, recsRes, unusedRes] = await Promise.all([
        api.get('/clothing/stats'),
        api.get('/clothing?sort=newest&limit=6'),
        api.get('/recommendations?limit=3'),
        api.get('/recommendations/unused'),
      ]);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
      setRecommendations(recsRes.data.data);
      setUnused(unusedRes.data.data?.slice(0, 4));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--color-text-muted)] text-sm">{greeting} 👋</p>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mt-0.5">
            {user?.name?.split(' ')[0]}'s Wardrobe
          </h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <HiPlus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={HiCollection} label="Total Items"   value={stats?.total ?? '—'}             color="purple" />
        <StatsCard icon={HiSparkles}  label="Outfits"        value={user?.stats?.totalOutfits ?? '—'} color="blue" />
        <StatsCard icon={HiHeart}     label="Never Worn"     value={stats?.neverWorn ?? '—'}          color="rose" />
        <StatsCard icon={HiCalendar}  label="Categories"     value={stats?.categoryBreakdown?.length ?? '—'} color="green" />
      </div>

      {/* Outfit Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <HiSparkles className="w-5 h-5 text-primary-500" /> Today's Outfit Ideas
            </h2>
            <Link to="/outfits" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View all <HiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="card p-4">
                <div className="flex gap-3 mb-3">
                  {[rec.top, rec.bottom, rec.shoes].filter(Boolean).map((item, j) => (
                    <div key={j} className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-dark-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                      {item.image?.url
                        ? <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                        : <span>{['👕','👖','👟','👜'][j] || '👔'}</span>
                      }
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{rec.top?.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">+ {rec.bottom?.name}</p>
                  </div>
                  <span className="badge badge-purple">Score {rec.score}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recently Added</h2>
          <Link to="/wardrobe" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View all <HiArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <SkeletonGrid count={6} />
        ) : recent.length === 0 ? (
          <EmptyState icon={HiCollection} title="Your wardrobe is empty"
            description="Start adding clothes to get smart recommendations."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary">Add Your First Item</button>}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {recent.map(item => (
              <ClothingCard key={item._id} item={item}
                onDelete={id => setRecent(p => p.filter(i => i._id !== id))}
                onUpdate={updated => setRecent(p => p.map(i => i._id === updated._id ? updated : i))}
              />
            ))}
          </div>
        )}
      </section>

      {/* Unused clothes suggestion */}
      {unused?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <HiRefresh className="w-5 h-5 text-amber-500" /> Rediscover These
              <span className="badge badge-amber text-[10px]">Unworn 30+ days</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {unused.map(item => (
              <ClothingCard key={item._id} item={item}
                onDelete={id => setUnused(p => p.filter(i => i._id !== id))}
                onUpdate={updated => setUnused(p => p.map(i => i._id === updated._id ? updated : i))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category breakdown */}
      {stats?.categoryBreakdown?.length > 0 && (
        <section>
          <h2 className="section-title">Wardrobe Breakdown</h2>
          <div className="card p-5">
            <div className="space-y-3">
              {stats.categoryBreakdown.map(({ _id, count }) => (
                <div key={_id} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] capitalize w-20 flex-shrink-0">{_id}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-dark-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (count / stats.total) * 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text)] w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <AddClothingModal isOpen={showAdd} onClose={() => setShowAdd(false)}
        onSave={item => { setRecent(p => [item, ...p.slice(0, 5)]); fetchDashboard(); }} />
    </div>
  );
}
