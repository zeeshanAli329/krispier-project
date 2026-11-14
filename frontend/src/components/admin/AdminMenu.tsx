import React, { useState, useEffect } from 'react';
import { FoodItem, Category } from '../../types';
import { api } from '../../services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export const AdminMenu: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 950,
    category: '',
    image: '/src/assets/images/food_krispier_burger_1794472995581.jpg',
    isAvailable: true,
    preparationTime: 15,
    spicyLevel: 1,
    isVegetarian: false,
    isChefSpecial: false,
  });

  const availableImages = [
    { label: 'Krispier Thunder Zinger Burger', path: '/src/assets/images/food_krispier_burger_1794472995581.jpg' },
    { label: 'Crispy Broast Fried Chicken', path: '/src/assets/images/food_krispier_fried_chicken_1794472997574.jpg' },
    { label: 'Signature Wings & Sauces', path: '/src/assets/images/food_krispier_wings_1794472995763.jpg' },
    { label: 'Volcano Loaded Cheesy Fries', path: '/src/assets/images/food_krispier_loaded_fries_1794472995792.jpg' },
    { label: 'Krispier Mega Feast Combo', path: '/src/assets/images/hero_krispier_feast_1794472994683.jpg' },
  ];

  const loadData = async () => {
    try {
      const [fList, cList] = await Promise.all([api.getFoods(), api.getCategories()]);
      setFoods(fList);
      setCategories(cList);
      if (cList.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: cList[0].name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 850,
      category: categories[0]?.name || 'Crispy Burgers',
      image: availableImages[0].path,
      isAvailable: true,
      preparationTime: 15,
      spicyLevel: 1,
      isVegetarian: false,
      isChefSpecial: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime,
      spicyLevel: item.spicyLevel,
      isVegetarian: item.isVegetarian,
      isChefSpecial: item.isChefSpecial,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updated = await api.updateFood(editingItem._id, formData);
        setFoods((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
      } else {
        const created = await api.createFood(formData);
        setFoods((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving food item');
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const toggled = await api.toggleFoodAvailability(id);
      setFoods((prev) => prev.map((f) => (f._id === id ? toggled : f)));
    } catch (err: any) {
      alert(err.message || 'Error toggling availability');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      await api.deleteFood(id);
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting dish');
    }
  };

  const filtered = foods.filter((f) => {
    const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchQ = f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-[#222222] p-4 rounded-2xl border border-[#353535] shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fast-food items..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cursor-pointer px-3.5 py-2.5 text-xs bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
          >
            <option value="All">All Categories ({foods.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="cursor-pointer w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Fast-Food Item</span>
        </button>
      </div>

      {/* Food items table */}
      <div className="bg-[#222222] rounded-2xl border border-[#353535] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-[#A0A0A0] font-black uppercase tracking-wider border-b border-[#353535]">
              <tr>
                <th className="px-5 py-3.5">Dish / Photo</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price (PKR)</th>
                <th className="px-5 py-3.5">Prep Time</th>
                <th className="px-5 py-3.5">Attributes</th>
                <th className="px-5 py-3.5">Available</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353535] text-[#D1D5DB]">
              {filtered.map((dish) => (
                <tr key={dish._id} className="hover:bg-[#282828] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover bg-[#151515] border border-[#353535] shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white">{dish.name}</div>
                        <div className="text-[11px] text-[#A0A0A0] line-clamp-1 max-w-xs">
                          {dish.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-bold text-white">{dish.category}</td>

                  <td className="px-5 py-3.5 font-black text-[#FFC400] tabular-nums">
                    PKR {dish.price.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5 text-[#D1D5DB] tabular-nums font-medium">
                    {dish.preparationTime} mins
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {dish.isChefSpecial && (
                        <span className="text-[10px] bg-[#151515] border border-[#FFC400] text-[#FFC400] font-bold px-2 py-0.5 rounded-md uppercase">
                          Special
                        </span>
                      )}
                      {dish.isVegetarian && (
                        <span className="text-[10px] bg-[#151515] border border-emerald-800 text-emerald-400 font-bold px-2 py-0.5 rounded-md uppercase">
                          Veg
                        </span>
                      )}
                      {dish.spicyLevel > 0 && (
                        <span className="text-[10px] bg-[#151515] border border-red-900 text-red-400 font-bold px-1.5 py-0.5 rounded-md">
                          {'🌶️'.repeat(dish.spicyLevel)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(dish._id)}
                      className={`cursor-pointer px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border ${
                        dish.isAvailable
                          ? 'bg-[#151515] border-[#22C55E] text-[#22C55E]'
                          : 'bg-[#151515] border-[#EF4444] text-[#EF4444]'
                      }`}
                    >
                      {dish.isAvailable ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(dish)}
                        className="cursor-pointer p-2 bg-[#151515] hover:bg-[#FFC400] hover:text-black text-[#D1D5DB] rounded-xl transition-all border border-[#353535]"
                        title="Edit dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(dish._id)}
                        className="cursor-pointer p-2 bg-[#151515] hover:bg-[#EF4444] text-[#D1D5DB] hover:text-white rounded-xl transition-all border border-[#353535]"
                        title="Delete dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#222222] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#353535] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                {editingItem ? 'Edit Fast-Food Item' : 'Add New Krispier Item'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer p-1 rounded-lg text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Krispier Thunder Zinger Burger"
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">Price (in PKR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="cursor-pointer w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Item Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, secret sauces, crunch details..."
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              {/* Photo selector */}
              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Food Photography</label>
                <select
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="cursor-pointer w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400] mb-2"
                >
                  {availableImages.map((img) => (
                    <option key={img.path} value={img.path}>
                      {img.label}
                    </option>
                  ))}
                </select>
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#353535] bg-[#151515]">
                  <img
                    src={formData.image}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.preparationTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preparationTime: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">Spiciness Level (0-3)</label>
                  <select
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData({ ...formData, spicyLevel: Number(e.target.value) })}
                    className="cursor-pointer w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                  >
                    <option value={0}>Mild / Not Spicy</option>
                    <option value={1}>Mild Heat 🌶️</option>
                    <option value={2}>Medium Spicy 🌶️🌶️</option>
                    <option value={3}>Fire Spicy 🌶️🌶️🌶️</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    className="cursor-pointer accent-[#FFC400] rounded"
                  />
                  <span>Vegetarian Option</span>
                </label>

                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isChefSpecial}
                    onChange={(e) => setFormData({ ...formData, isChefSpecial: e.target.checked })}
                    className="cursor-pointer accent-[#FFC400] rounded"
                  />
                  <span>Krispier Crave Special</span>
                </label>

                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="cursor-pointer accent-[#FFC400] rounded"
                  />
                  <span>Available In Kitchen</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#353535] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer px-4 py-2.5 bg-[#151515] hover:bg-[#2d2d2d] text-[#D1D5DB] font-bold rounded-xl border border-[#353535]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
