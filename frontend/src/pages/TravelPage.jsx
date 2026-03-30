import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiGlobe, HiLocationMarker, HiCalendar, HiSparkles } from 'react-icons/hi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const categoryEmoji = { tops:'👕', bottoms:'👖', shoes:'👟', accessories:'👜', outerwear:'🧥' };

export default function TravelPage() {
  const [form, setForm]         = useState({ destination: '', days: 3, occasions: ['casual'] });
  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading]   = useState(false);

  const OCCASIONS = ['casual','formal','business','sport','beach','outdoor'];

  const toggleOccasion = (occ) => {
    setForm(p => ({
      ...p,
      occasions: p.occasions.includes(occ) ? p.occasions.filter(o => o !== occ) : [...p.occasions, occ],
    }));
  };

  const handleGenerate = async () => {
    if (!form.destination.trim()) return toast.error('Enter a destination');
    if (form.days < 1) return toast.error('Enter number of days');
    setLoading(true);
    try {
      const { data } = await api.post('/travel', { destination: form.destination, days: form.days, occasions: form.occasions });
      setPackingList(data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to generate packing list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2"><HiGlobe className="w-7 h-7 text-emerald-500" />Travel Packing</h1>
        <p className="page-subtitle">Get a smart packing list for your next trip</p>
      </div>

      {/* Input form */}
      <div className="card p-6 space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1"><HiLocationMarker className="w-4 h-4" />Destination</label>
            <input className="input" placeholder="e.g. Paris, France" value={form.destination}
              onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1"><HiCalendar className="w-4 h-4" />Number of Days</label>
            <input className="input" type="number" min={1} max={30} value={form.days}
              onChange={e => setForm(p => ({ ...p, days: parseInt(e.target.value) || 1 }))} />
          </div>
        </div>
        <div>
          <label className="label">Occasions</label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(occ => (
              <button key={occ} type="button" onClick={() => toggleOccasion(occ)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all
                  ${form.occasions.includes(occ) ? 'bg-emerald-500 text-white border-emerald-500' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-emerald-400'}`}>
                {occ}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          {loading ? 'Generating...' : <><HiSparkles className="w-4 h-4" />Generate Packing List</>}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {packingList && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-xl font-bold text-[var(--color-text)]">
                  📦 Packing List for {packingList.destination}
                </h2>
                <span className="badge badge-green">{packingList.days} days · {packingList.totalItems} items</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 mb-4">
                {packingList.tips?.map((tip, i) => (
                  <span key={i} className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs py-1">
                    💡 {tip}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(packingList.items).map(([cat, catItems]) => (
                  catItems.length > 0 && (
                    <div key={cat}>
                      <h3 className="font-medium text-sm text-[var(--color-text)] mb-3 capitalize flex items-center gap-2">
                        <span>{categoryEmoji[cat] || '👔'}</span> {cat} ({catItems.length})
                      </h3>
                      <div className="space-y-2">
                        {catItems.map(item => (
                          <div key={item._id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-dark-700">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-600 flex items-center justify-center text-lg">
                              {item.image?.url
                                ? <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                                : categoryEmoji[cat] || '👔'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.name}</p>
                              <p className="text-xs text-[var(--color-text-muted)] capitalize">{item.color}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
