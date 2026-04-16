/**
 * Shared UI components
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

// ─── Modal ─────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto md:items-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative my-auto w-full ${sizes[size]} max-h-[calc(100vh-2rem)] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">{title}</h3>
              <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
        {Icon && <Icon className="w-10 h-10 text-primary-400" />}
      </div>
      <h3 className="font-display font-semibold text-lg text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] text-sm max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────
const colorMap = {
  black: '#1a1a1a', white: '#f5f5f5', grey: '#9ca3af', gray: '#9ca3af',
  red: '#ef4444', blue: '#3b82f6', navy: '#1e3a5f', green: '#22c55e',
  yellow: '#eab308', orange: '#f97316', pink: '#ec4899', purple: '#a855f7',
  brown: '#92400e', beige: '#d4b896', denim: '#4a6fa5', silver: '#c0c0c0',
  gold: '#f0c040', camel: '#c19a6b', olive: '#6b7c45', cream: '#fffdd0',
};

export function ColorSwatch({ color, size = 'sm' }) {
  const bg = colorMap[color?.toLowerCase()] || '#e5e7eb';
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <span
      className={`${sizes[size]} rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-dark-500 inline-block flex-shrink-0`}
      style={{ backgroundColor: bg }}
      title={color}
    />
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────
export function StatsCard({ icon: Icon, label, value, color = 'purple', trend }) {
  const colors = {
    purple: 'from-primary-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-display font-bold text-[var(--color-text)] mt-1">{value}</p>
          {trend && <p className="text-xs text-emerald-500 mt-1 font-medium">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, placeholder, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} className="input">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-[var(--color-text-muted)] text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
            danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
