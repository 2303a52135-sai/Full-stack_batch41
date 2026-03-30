import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiPhotograph, HiX } from 'react-icons/hi';
import { Modal } from '../ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['tops','bottoms','dresses','outerwear','shoes','accessories','activewear','underwear','sleepwear'];
const OCCASIONS  = ['casual','formal','business','party','sport','outdoor','beach','home'];
const SEASONS    = ['spring','summer','autumn','winter','all-season'];
const COLORS     = ['black','white','grey','navy','blue','red','green','yellow','orange','pink','purple','brown','beige','denim','camel','olive','silver','gold'];

const initialForm = {
  name:'', category:'tops', color:'black', brand:'', subcategory:'',
  occasion:['casual'], season:['all-season'], material:'', size:'',
  notes:'', tags:'', purchasePrice:'',
};

export default function AddClothingModal({ isOpen, onClose, onSave, editItem }) {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name || '',
        category: editItem.category || 'tops',
        color: editItem.color || 'black',
        brand: editItem.brand || '',
        subcategory: editItem.subcategory || '',
        occasion: editItem.occasion || ['casual'],
        season: editItem.season || ['all-season'],
        material: editItem.material || '',
        size: editItem.size || '',
        notes: editItem.notes || '',
        tags: editItem.tags?.join(', ') || '',
        purchasePrice: editItem.purchasePrice || '',
      });
      setImagePreview(editItem.image?.url || '');
    } else {
      setForm(initialForm);
      setImagePreview('');
      setImageFile(null);
    }
  }, [editItem, isOpen]);

  const onDrop = useCallback(files => {
    const file = files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, maxFiles: 1, maxSize: 5 * 1024 * 1024,
  });

  const toggleMulti = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Item name is required');
    if (form.occasion.length === 0) return toast.error('Select at least one occasion');
    if (form.season.length === 0) return toast.error('Select at least one season');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(val => formData.append(k, val));
        else if (v !== '') formData.append(k, v);
      });
      if (imageFile) formData.append('image', imageFile);

      let res;
      if (editItem) {
        res = await api.put(`/clothing/${editItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Item updated!');
      } else {
        res = await api.post('/clothing', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Item added to wardrobe!');
      }
      onSave && onSave(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const MultiSelect = ({ label, field, options }) => (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggleMulti(field, opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all
              ${form[field].includes(opt)
                ? 'bg-primary-500 text-white border-primary-500'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-primary-400'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Edit Item' : 'Add to Wardrobe'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Image upload */}
          <div className="space-y-4">
            <div>
              <label className="label">Photo</label>
              <div {...getRootProps()} className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all
                ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-[var(--color-border)] hover:border-primary-400'}`}
                style={{ aspectRatio: '1' }}>
                <input {...getInputProps()} />
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
                      <HiPhotograph className="w-10 h-10 opacity-30" />
                      <p className="text-xs text-center px-4">{isDragActive ? 'Drop here' : 'Drag photo or click to upload'}</p>
                      <p className="text-[10px] opacity-60">JPG, PNG, WebP · Max 5MB</p>
                    </div>
                }
                {imagePreview && (
                  <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(''); setImageFile(null); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
                    <HiX className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="label">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => {
                  const colorHex = { black:'#1a1a1a',white:'#f5f5f5',grey:'#9ca3af',navy:'#1e3a5f',blue:'#3b82f6',red:'#ef4444',green:'#22c55e',yellow:'#eab308',orange:'#f97316',pink:'#ec4899',purple:'#a855f7',brown:'#92400e',beige:'#d4b896',denim:'#4a6fa5',camel:'#c19a6b',olive:'#6b7c45',silver:'#c0c0c0',gold:'#f0c040' };
                  return (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                      title={c}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-primary-500 scale-110 ring-2 ring-primary-300' : 'border-white shadow-sm ring-1 ring-gray-200 dark:ring-dark-500'}`}
                      style={{ backgroundColor: colorHex[c] || '#ccc' }} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-4">
            <div>
              <label className="label">Item Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. White Oxford Shirt" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Brand</label>
                <input className="input" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Zara" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Size</label>
                <input className="input" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} placeholder="M, L, 32, etc." />
              </div>
              <div>
                <label className="label">Price (₹/$)</label>
                <input className="input" type="number" value={form.purchasePrice} onChange={e => setForm(p => ({ ...p, purchasePrice: e.target.value }))} placeholder="0" min="0" />
              </div>
            </div>
            <div>
              <label className="label">Material</label>
              <input className="input" value={form.material} onChange={e => setForm(p => ({ ...p, material: e.target.value }))} placeholder="Cotton, Polyester, etc." />
            </div>
          </div>
        </div>

        <MultiSelect label="Occasion *" field="occasion" options={OCCASIONS} />
        <MultiSelect label="Season *" field="season" options={SEASONS} />

        <div>
          <label className="label">Tags (comma-separated)</label>
          <input className="input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="summer, office, classic" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes about this item..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : editItem ? 'Update Item' : 'Add to Wardrobe'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
