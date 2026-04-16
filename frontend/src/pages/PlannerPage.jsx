import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { HiChevronLeft, HiChevronRight, HiCalendar, HiPlus, HiCheck } from 'react-icons/hi';
import { EmptyState, Modal } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function PlannerPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [plans, setPlans]     = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [notes, setNotes]     = useState('');
  const [saving, setSaving]   = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const currentWeekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const start = format(currentWeekStart, 'yyyy-MM-dd');
    const end   = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    api.get(`/planner?startDate=${start}&endDate=${end}`).then(r => setPlans(r.data.data)).catch(console.error);
  }, [currentWeek]);

  useEffect(() => {
    api.get('/outfits?limit=50').then(r => setOutfits(r.data.data)).catch(console.error);
  }, []);

  const planForDate = (date) => plans.find(p => isSameDay(new Date(p.date), date));

  const openModal = (date) => {
    const existing = planForDate(date);
    setSelectedDate(date);
    setSelectedOutfit(existing?.outfit?._id || '');
    setNotes(existing?.notes || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedOutfit) return toast.error('Select an outfit');
    setSaving(true);
    try {
      const { data } = await api.post('/planner', {
        date: format(selectedDate, 'yyyy-MM-dd'),
        outfit: selectedOutfit,
        notes,
      });
      setPlans(prev => {
        const filtered = prev.filter(p => !isSameDay(new Date(p.date), selectedDate));
        return [...filtered, data.data];
      });
      setShowModal(false);
      toast.success('Outfit planned!');
    } catch (err) {
      toast.error(err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkWorn = async (plan) => {
    try {
      await api.patch(`/planner/${plan._id}/worn`);
      setPlans(prev => prev.map(p => p._id === plan._id ? { ...p, worn: true } : p));
      toast.success('Marked as worn!');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (plan) => {
    try {
      await api.delete(`/planner/${plan._id}`);
      setPlans(prev => prev.filter(p => p._id !== plan._id));
      toast.success('Plan removed');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Outfit Planner</h1>
          <p className="page-subtitle">Plan your looks for the week ahead</p>
        </div>
      </div>

      {/* Week navigation */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="btn-ghost p-2">
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-display font-semibold text-lg text-[var(--color-text)]">
              {format(weekStart, 'MMMM yyyy')}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}
            </p>
          </div>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="btn-ghost p-2">
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const plan   = planForDate(day);
            const today  = isToday(day);
            const isPast = day < new Date() && !today;

            return (
              <motion.div key={day.toString()} whileHover={{ scale: 1.02 }}
                className={`rounded-xl border-2 p-2 cursor-pointer transition-all min-h-28
                  ${today ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' :
                    plan ? 'border-emerald-300 dark:border-emerald-700' :
                    'border-[var(--color-border)] hover:border-primary-300'}`}
                onClick={() => openModal(day)}>
                {/* Day header */}
                <div className="text-center mb-2">
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                    {format(day, 'EEE')}
                  </p>
                  <p className={`text-sm font-semibold mt-0.5
                    ${today ? 'text-primary-600 dark:text-primary-400' : 'text-[var(--color-text)]'}`}>
                    {format(day, 'd')}
                  </p>
                </div>

                {/* Outfit preview */}
                {plan ? (
                  <div className="space-y-1.5">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-xl">
                      {plan.outfit?.coverImage
                        ? <img src={plan.outfit.coverImage} alt="" className="w-full h-full object-cover" />
                        : '✨'}
                    </div>
                    <p className="text-[9px] text-center text-[var(--color-text-muted)] truncate leading-tight">
                      {plan.outfit?.name || 'Outfit'}
                    </p>
                    {plan.worn
                      ? <div className="flex items-center justify-center gap-0.5">
                          <HiCheck className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] text-emerald-500">Worn</span>
                        </div>
                      : !isPast && (
                          <button onClick={e => { e.stopPropagation(); handleMarkWorn(plan); }}
                            className="w-full text-[9px] text-[var(--color-text-muted)] hover:text-emerald-500 transition-colors">
                            Mark worn
                          </button>
                        )
                    }
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 opacity-30">
                    <HiPlus className="w-5 h-5 text-[var(--color-text-muted)]" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Upcoming plans list */}
      <section>
        <h2 className="section-title">Upcoming Plans</h2>
        {plans.length === 0 ? (
          <EmptyState icon={HiCalendar} title="No plans this week"
            description="Click on any day in the calendar to plan your outfit."
          />
        ) : (
          <div className="space-y-3">
            {plans.sort((a,b) => new Date(a.date) - new Date(b.date)).map(plan => (
              <motion.div key={plan._id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                className="card p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0
                  ${isToday(new Date(plan.date)) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-700'}`}>
                  <p className="text-[10px] uppercase">{format(new Date(plan.date), 'EEE')}</p>
                  <p className="font-bold text-lg leading-none">{format(new Date(plan.date), 'd')}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text)]">{plan.outfit?.name || 'Custom Outfit'}</p>
                  {plan.notes && <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{plan.notes}</p>}
                </div>
                {plan.worn && <span className="badge badge-green">Worn</span>}
                <button onClick={() => handleDelete(plan)} className="btn-ghost p-1.5 text-red-400 hover:text-red-500">×</button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Plan modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={selectedDate ? `Plan outfit for ${format(selectedDate, 'EEEE, MMM d')}` : 'Plan Outfit'}>
        <div className="space-y-4">
          <div>
            <label className="label">Choose Outfit</label>
            <select className="input" value={selectedOutfit} onChange={e => setSelectedOutfit(e.target.value)}>
              <option value="">Select an outfit...</option>
              {outfits.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="e.g. Interview day, wear watch" value={notes}
              onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
