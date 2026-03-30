import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiSearch, HiFilter, HiX, HiCollection } from 'react-icons/hi';
import { EmptyState, SkeletonGrid, Select } from '../components/ui';
import ClothingCard from '../components/wardrobe/ClothingCard';
import AddClothingModal from '../components/wardrobe/AddClothingModal';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['','tops','bottoms','dresses','outerwear','shoes','accessories','activewear'];
const OCCASIONS  = ['','casual','formal','business','party','sport','outdoor','beach','home'];
const SEASONS    = ['','spring','summer','autumn','winter','all-season'];
const SORTS      = [{ value:'', label:'Newest' },{ value:'name', label:'Name A–Z' },{ value:'wearCount', label:'Most Worn' },{ value:'lastWorn', label:'Last Worn' }];

export default function WardrobePage() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState({ category:'', occasion:'', season:'', sort:'' });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [editItem, setEditItem]   = useState(null);

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (search)           params.append('search', search);
      if (filters.category) params.append('category', filters.category);
      if (filters.occasion) params.append('occasion', filters.occasion);
      if (filters.season)   params.append('season', filters.season);
      if (filters.sort)     params.append('sort', filters.sort);

      const { data } = await api.get(`/clothing?${params}`);
      setItems(p === 1 ? data.data : prev => [...prev, ...data.data]);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch (err) {
      toast.error('Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => { fetchItems(1); }, [fetchItems]);

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ category:'', occasion:'', season:'', sort:'' });
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Wardrobe</h1>
          <p className="page-subtitle">{items.length} items displayed</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <HiPlus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input className="input pl-9 pr-4" placeholder="Search by name, color, brand..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${activeFilters ? 'ring-2 ring-primary-400' : ''}`}>
          <HiFilter className="w-4 h-4" />
          Filters {activeFilters > 0 && <span className="badge badge-purple px-1.5 py-0">{activeFilters}</span>}
        </button>
        {(activeFilters > 0 || search) && (
          <button onClick={clearFilters} className="btn-ghost gap-1 text-red-500 hover:text-red-600">
            <HiX className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="card p-4 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Select label="Category" value={filters.category} onChange={v => setFilters(p => ({ ...p, category: v }))}
                options={CATEGORIES.map(c => ({ value:c, label: c || 'All Categories' }))} />
              <Select label="Occasion" value={filters.occasion} onChange={v => setFilters(p => ({ ...p, occasion: v }))}
                options={OCCASIONS.map(o => ({ value:o, label: o || 'All Occasions' }))} />
              <Select label="Season" value={filters.season} onChange={v => setFilters(p => ({ ...p, season: v }))}
                options={SEASONS.map(s => ({ value:s, label: s || 'All Seasons' }))} />
              <Select label="Sort By" value={filters.sort} onChange={v => setFilters(p => ({ ...p, sort: v }))}
                options={SORTS} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category quick filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {['All','tops','bottoms','shoes','accessories','outerwear','dresses','activewear'].map(cat => (
          <button key={cat} onClick={() => setFilters(p => ({ ...p, category: cat === 'All' ? '' : cat }))}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all
              ${(cat === 'All' && !filters.category) || filters.category === cat
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-dark-700 text-[var(--color-text-muted)] hover:bg-gray-200 dark:hover:bg-dark-600'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <SkeletonGrid count={12} />
      ) : items.length === 0 ? (
        <EmptyState icon={HiCollection} title="No items found"
          description={search || activeFilters ? 'Try different search terms or filters.' : 'Add your first clothing item to get started.'}
          action={<button onClick={() => setShowAdd(true)} className="btn-primary"><HiPlus className="w-4 h-4"/>Add Item</button>}
        />
      ) : (
        <>
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map(item => (
                <ClothingCard key={item._id} item={item}
                  onDelete={id => setItems(p => p.filter(i => i._id !== id))}
                  onUpdate={updated => setItems(p => p.map(i => i._id === updated._id ? updated : i))}
                  onEdit={item => { setEditItem(item); setShowAdd(true); }}
                />
              ))}
            </div>
          </AnimatePresence>
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <button onClick={() => fetchItems(page + 1)} disabled={loading} className="btn-secondary">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      <AddClothingModal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditItem(null); }} editItem={editItem}
        onSave={saved => {
          if (editItem) setItems(p => p.map(i => i._id === saved._id ? saved : i));
          else setItems(p => [saved, ...p]);
          setEditItem(null);
        }}
      />
    </div>
  );
}
