import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiPlus, HiX, HiHeart, HiOutlineHeart, HiRefresh, HiCheck, HiTrash } from 'react-icons/hi';
import { EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

const POSITIONS = ['top','bottom','shoes','accessory','outerwear'];
const POS_EMOJI = { top:'👕', bottom:'👖', shoes:'👟', accessory:'👜', outerwear:'🧥' };

export default function OutfitBuilder() {
  const [outfits, setOutfits]         = useState([]);
  const [clothing, setClothing]       = useState([]);
  const [builder, setBuilder]         = useState({});   // { position: item }
  const [outfitName, setOutfitName]   = useState('');
  const [occasion, setOccasion]       = useState('casual');
  const [season, setSeason]           = useState('all-season');
  const [recommendations, setRecs]    = useState([]);
  const [activeTab, setActiveTab]     = useState('builder'); // 'builder' | 'saved' | 'ai'
  const [pickingFor, setPickingFor]   = useState(null);      // which position we're picking
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    api.get('/clothing?limit=100').then(r => setClothing(r.data.data)).catch(console.error);
    api.get('/outfits').then(r => setOutfits(r.data.data)).catch(console.error);
    api.get('/recommendations?limit=6').then(r => setRecs(r.data.data)).catch(console.error);
  }, []);

  const categoryForPosition = { top:'tops', bottom:'bottoms', shoes:'shoes', accessory:'accessories', outerwear:'outerwear' };

  const filteredForPick = pickingFor
    ? clothing.filter(c => c.category === categoryForPosition[pickingFor])
    : [];

  const handleSave = async () => {
    if (!outfitName.trim()) return toast.error('Give your outfit a name');
    const items = Object.entries(builder).map(([pos, item]) => ({ item: item._id, position: pos }));
    if (items.length === 0) return toast.error('Add at least one item to the outfit');
    setSaving(true);
    try {
      const { data } = await api.post('/outfits', { name: outfitName, items, occasion: [occasion], season: [season] });
      setOutfits(p => [data.data, ...p]);
      setBuilder({});
      setOutfitName('');
      toast.success('Outfit saved! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to save outfit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this outfit?')) return;
    try {
      await api.delete(`/outfits/${id}`);
      setOutfits(p => p.filter(o => o._id !== id));
      toast.success('Outfit deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleFav = async (outfit) => {
    try {
      await api.patch(`/outfits/${outfit._id}/favorite`);
      setOutfits(p => p.map(o => o._id === outfit._id ? { ...o, isFavorite: !o.isFavorite } : o));
    } catch { toast.error('Failed to update'); }
  };

  const loadRecommendedOutfit = (rec) => {
    const b = {};
    if (rec.top)    b.top    = rec.top;
    if (rec.bottom) b.bottom = rec.bottom;
    if (rec.shoes)  b.shoes  = rec.shoes;
    if (rec.accessory) b.accessory = rec.accessory;
    setBuilder(b);
    setActiveTab('builder');
    toast.success('Outfit loaded into builder!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Outfit Studio</h1>
          <p className="page-subtitle">Build and save your favourite looks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl w-fit">
        {[{ id:'builder', label:'Builder' },{ id:'ai', label:'✨ AI Ideas' },{ id:'saved', label:`Saved (${outfits.length})` }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === t.id ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Builder Tab ─────────────────────────────────────── */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-6">
              <h3 className="section-title">Outfit Canvas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {POSITIONS.map(pos => {
                  const item = builder[pos];
                  return (
                    <motion.div key={pos} whileHover={{ scale: 1.02 }}
                      className={`relative border-2 rounded-2xl overflow-hidden cursor-pointer transition-all
                        ${item ? 'border-primary-300' : 'border-dashed border-[var(--color-border)] hover:border-primary-400'}`}
                      style={{ aspectRatio: '1' }}
                      onClick={() => setPickingFor(pos)}>
                      {item ? (
                        <>
                          {item.image?.url
                            ? <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-50 dark:bg-dark-700">{POS_EMOJI[pos]}</div>
                          }
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2">
                            <p className="text-white text-xs font-medium truncate">{item.name}</p>
                            <p className="text-white/70 text-[10px] capitalize">{pos}</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setBuilder(p => { const n={...p}; delete n[pos]; return n; }) }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500 transition-colors">
                            <HiX className="w-3 h-3 text-white" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
                          <span className="text-3xl opacity-40">{POS_EMOJI[pos]}</span>
                          <p className="text-xs capitalize">{pos}</p>
                          <HiPlus className="w-4 h-4 opacity-50" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Item picker */}
            <AnimatePresence>
              {pickingFor && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="card p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm capitalize">Select {pickingFor}</h4>
                    <button onClick={() => setPickingFor(null)} className="btn-ghost p-1"><HiX className="w-4 h-4" /></button>
                  </div>
                  {filteredForPick.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                      No {pickingFor} items in wardrobe. Add some first!
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-52 overflow-y-auto">
                      {filteredForPick.map(item => (
                        <button key={item._id} title={item.name}
                          onClick={() => { setBuilder(p => ({ ...p, [pickingFor]: item })); setPickingFor(null); }}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105
                            ${builder[pickingFor]?._id === item._id ? 'border-primary-500' : 'border-transparent'}`}>
                          {item.image?.url
                            ? <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-700 text-xl">{POS_EMOJI[pickingFor]}</div>
                          }
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Save panel */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="section-title">Save Outfit</h3>
              <div>
                <label className="label">Outfit Name</label>
                <input className="input" placeholder="e.g. Monday Office Look" value={outfitName}
                  onChange={e => setOutfitName(e.target.value)} />
              </div>
              <div>
                <label className="label">Occasion</label>
                <select className="input" value={occasion} onChange={e => setOccasion(e.target.value)}>
                  {['casual','formal','business','party','sport','outdoor','beach','home'].map(o => (
                    <option key={o} value={o} className="capitalize">{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Season</label>
                <select className="input" value={season} onChange={e => setSeason(e.target.value)}>
                  {['all-season','spring','summer','autumn','winter'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                <span>Items added:</span>
                <span className="font-medium text-[var(--color-text)]">{Object.keys(builder).length}</span>
              </div>
              <button onClick={handleSave} disabled={saving || Object.keys(builder).length === 0} className="btn-primary w-full">
                {saving ? 'Saving...' : <><HiCheck className="w-4 h-4" /> Save Outfit</>}
              </button>
              <button onClick={() => setBuilder({})} className="btn-ghost w-full text-red-500 hover:text-red-600">
                <HiRefresh className="w-4 h-4" /> Clear Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Ideas Tab ────────────────────────────────────── */}
      {activeTab === 'ai' && (
        <div>
          {recommendations.length === 0 ? (
            <EmptyState icon={HiSparkles} title="No recommendations yet"
              description="Add more clothes to your wardrobe to get AI outfit ideas." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendations.map((rec, i) => (
                <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }}
                  className="card p-5 hover:shadow-card-hover transition-all">
                  <div className="flex gap-3 mb-4">
                    {[rec.top, rec.bottom, rec.shoes, rec.accessory].filter(Boolean).map((item, j) => (
                      <div key={j} className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-dark-700 flex items-center justify-center text-2xl">
                        {item.image?.url ? <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" /> : <span>{['👕','👖','👟','👜'][j]}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 mb-4">
                    {[['Top', rec.top], ['Bottom', rec.bottom], ['Shoes', rec.shoes]].filter(([,item]) => item).map(([label, item]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-muted)]">{label}</span>
                        <span className="font-medium text-[var(--color-text)] truncate ml-2 text-right">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="badge badge-purple">Match {rec.score}</span>
                    <button onClick={() => loadRecommendedOutfit(rec)} className="btn-primary text-xs px-3 py-1.5">
                      Use in Builder
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Saved Outfits Tab ───────────────────────────────── */}
      {activeTab === 'saved' && (
        <div>
          {outfits.length === 0 ? (
            <EmptyState icon={HiSparkles} title="No saved outfits"
              description="Build your first outfit in the Builder tab."
              action={<button onClick={() => setActiveTab('builder')} className="btn-primary">Open Builder</button>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {outfits.map(outfit => (
                <motion.div key={outfit._id} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                  className="card overflow-hidden group hover:shadow-card-hover transition-all">
                  <div className="grid grid-cols-3 h-32">
                    {outfit.items?.slice(0,3).map((oi, j) => (
                      <div key={j} className="overflow-hidden bg-gray-50 dark:bg-dark-700 flex items-center justify-center text-3xl">
                        {oi.item?.image?.url ? <img src={oi.item.image.url} alt="" className="w-full h-full object-cover" /> : <span>👔</span>}
                      </div>
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-[var(--color-text)]">{outfit.name}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] capitalize">{outfit.occasion?.join(', ')}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleFav(outfit)} className="btn-ghost p-1.5">
                          {outfit.isFavorite ? <HiHeart className="w-4 h-4 text-red-500" /> : <HiOutlineHeart className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(outfit._id)} className="btn-ghost p-1.5 hover:text-red-500">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-blue">{outfit.wearCount || 0} wears</span>
                      {outfit.season?.map(s => <span key={s} className="badge badge-amber capitalize text-[10px]">{s}</span>)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
