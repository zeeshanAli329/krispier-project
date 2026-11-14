import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setOrder(categories.length + 1);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description);
    setOrder(cat.order);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        const updated = await api.updateCategory(editingCat._id, { name, description, order });
        setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const created = await api.createCategory({ name, description, order });
        setCategories((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food category?')) return;
    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Fast-Food Categories ({categories.length})</h2>
          <p className="text-xs text-[#A0A0A0]">Manage Krispier menu sections and display order</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-[#222222] rounded-2xl border border-[#353535] hover:border-[#FFC400] shadow-lg p-5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-[#151515] border border-[#353535] text-[#FFC400] flex items-center justify-center font-black text-xs">
                  {cat.order}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="cursor-pointer p-1.5 text-[#D1D5DB] hover:text-[#FFC400] bg-[#151515] border border-[#353535] rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat._id)}
                    className="cursor-pointer p-1.5 text-[#D1D5DB] hover:text-[#EF4444] bg-[#151515] border border-[#353535] rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white">{cat.name}</h3>
              <p className="text-xs text-[#A0A0A0] mt-1 line-clamp-2 leading-relaxed">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#353535] mt-4 flex justify-between items-center text-[11px] text-[#888888]">
              <span>Slug: {cat.slug}</span>
              <span className="text-[#22C55E] font-bold">Active</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#222222] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#353535] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Signature Wings & Dips"
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of this food category..."
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Display Sort Order</label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer px-4 py-2.5 bg-[#151515] text-[#D1D5DB] font-bold rounded-xl border border-[#353535]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
