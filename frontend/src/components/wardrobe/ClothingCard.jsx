import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiHeart, HiTrash, HiPencil, HiOutlineHeart } from 'react-icons/hi';
import { ColorSwatch } from '../ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const categoryEmoji = {
  tops: '👕', bottoms: '👖', dresses: '👗', outerwear: '🧥',
  shoes: '👟', accessories: '👜', activewear: '🩳', underwear: '🩲', sleepwear: '😴',
};

export default function ClothingCard({ item, onUpdate, onDelete, onEdit, selectable, selected, onSelect }) {
  const [isFav, setIsFav] = useState(item.isFavorite);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      setIsFav(!isFav);
      await api.patch(`/clothing/${item._id}/favorite`);
      onUpdate && onUpdate({ ...item, isFavorite: !isFav });
    } catch {
      setIsFav(isFav);
      toast.error('Failed to update favorite');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.delete(`/clothing/${item._id}`);
      toast.success('Item removed');
      onDelete && onDelete(item._id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      onClick={() => selectable && onSelect && onSelect(item)}
      className={`card-hover group relative cursor-pointer overflow-hidden
        ${selectable && selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
    >
      {selectable && (
        <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${selected ? 'bg-primary-500 border-primary-500' : 'bg-white/80 border-gray-300'}`}>
          {selected && <span className="text-white text-xs">✓</span>}
        </div>
      )}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-dark-700">
        {item.image?.url
          ? <img src={item.image.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">{categoryEmoji[item.category] || '👔'}</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2">
          <div className="flex gap-1">
            <button onClick={e => { e.stopPropagation(); onEdit && onEdit(item); }} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white">
              <HiPencil className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button onClick={handleDelete} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-red-50">
              <HiTrash className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>
        <button onClick={handleFavorite} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition-all">
          {isFav ? <HiHeart className="w-4 h-4 text-red-500" /> : <HiOutlineHeart className="w-4 h-4 text-gray-400" />}
        </button>
        {item.wearCount > 0 && (
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="badge bg-black/70 text-white text-[10px]">Worn {item.wearCount}×</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] capitalize mt-0.5">{item.brand}</p>
          </div>
          <ColorSwatch color={item.color} size="sm" />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="badge bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 capitalize text-[10px]">{item.category}</span>
          {item.occasion?.[0] && <span className="badge badge-purple text-[10px]">{item.occasion[0]}</span>}
        </div>
      </div>
    </motion.div>
  );
}
