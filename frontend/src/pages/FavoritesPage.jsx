// FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { HiHeart } from 'react-icons/hi';
import { EmptyState, SkeletonGrid } from '../components/ui';
import ClothingCard from '../components/wardrobe/ClothingCard';
import api from '../utils/api';

export default function FavoritesPage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites').then(r => {
      setItems(r.data.data?.items || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><HiHeart className="w-7 h-7 text-red-500" />Favorites</h1>
        <p className="page-subtitle">Your most-loved wardrobe pieces</p>
      </div>
      {loading ? <SkeletonGrid count={8} /> : items.length === 0 ? (
        <EmptyState icon={HiHeart} title="No favorites yet"
          description="Tap the heart icon on any clothing item to add it here." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <ClothingCard key={item._id} item={item}
              onDelete={id => setItems(p => p.filter(i => i._id !== id))}
              onUpdate={upd => setItems(p => upd.isFavorite ? p.map(i => i._id === upd._id ? upd : i) : p.filter(i => i._id !== upd._id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
