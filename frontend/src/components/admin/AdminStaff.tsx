import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { api } from '../../services/api';
import {
  Users,
  ChefHat,
  Bike,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

interface AdminStaffProps {
  initialRoleFilter?: 'all' | 'waiter' | 'cook' | 'delivery';
}

export const AdminStaff: React.FC<AdminStaffProps> = ({ initialRoleFilter = 'all' }) => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'waiter' | 'cook' | 'delivery'>(initialRoleFilter);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('waiter');
  const [phone, setPhone] = useState('');
  const [assignedTables, setAssignedTables] = useState<string>('T01, T02, T03');

  const loadStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaffList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleOpenAdd = (defaultRole?: Role) => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole(defaultRole || (roleFilter !== 'all' ? (roleFilter as Role) : 'waiter'));
    setPhone('');
    setAssignedTables('T01, T02');
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingStaff(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setPhone(user.phone || '');
    setAssignedTables(user.assignedTables ? user.assignedTables.join(', ') : '');
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedTables = assignedTables
        .split(',')
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);

      if (editingStaff) {
        const payload: any = { name, phone, assignedTables: parsedTables };
        if (password.trim()) payload.password = password.trim();
        const updated = await api.updateStaff(editingStaff.id || (editingStaff as any)._id, payload);
        setStaffList((prev) =>
          prev.map((s) => ((s.id || (s as any)._id) === (updated.id || (updated as any)._id) ? updated : s))
        );
      } else {
        const payload = {
          name,
          email,
          password,
          role,
          phone,
          assignedTables: parsedTables,
        };
        const created = await api.createStaff(payload);
        setStaffList((prev) => [...prev, created]);
      }
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving staff account');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await api.toggleStaffStatus(id);
      setStaffList((prev) =>
        prev.map((s) => ((s.id || (s as any)._id) === id ? { ...s, active: updated.active } : s))
      );
    } catch (err: any) {
      alert(err.message || 'Error toggling account status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff account?')) return;
    try {
      await api.deleteStaff(id);
      setStaffList((prev) => prev.filter((s) => (s.id || (s as any)._id) !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting account');
    }
  };

  const filtered = staffList.filter((s) => {
    if (roleFilter === 'all') return true;
    return s.role === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Krispier Kasur Staff Directory</h2>
          <p className="text-xs text-[#A0A0A0]">
            Manage credentials for Waiters, Fryers & Cooks (KDS), and Kasur Delivery Riders
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Role selector tabs */}
          <div className="flex items-center gap-1 bg-[#151515] p-1 rounded-xl border border-[#353535]">
            {(['all', 'waiter', 'cook', 'delivery'] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`cursor-pointer px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  roleFilter === r
                    ? 'bg-[#FFC400] text-black shadow-sm'
                    : 'text-[#D1D5DB] hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Staff' : `${r}s`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Employee</span>
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#222222] rounded-2xl border border-[#353535] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-[#A0A0A0] font-black uppercase tracking-wider border-b border-[#353535]">
              <tr>
                <th className="px-5 py-3.5">Employee Name</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Assigned Tables / Duty</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353535] text-[#D1D5DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#888888]">
                    No employees registered in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const empId = emp.id || (emp as any)._id;
                  return (
                    <tr key={empId} className="hover:bg-[#282828] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{emp.name}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`capitalize font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 w-max uppercase ${
                            emp.role === 'waiter'
                              ? 'bg-[#151515] border border-[#FFC400] text-[#FFC400]'
                              : emp.role === 'cook'
                              ? 'bg-[#151515] border border-[#EF4444] text-[#EF4444]'
                              : 'bg-[#151515] border border-[#22C55E] text-[#22C55E]'
                          }`}
                        >
                          {emp.role === 'waiter' && <Users className="w-3 h-3 text-[#FFC400]" />}
                          {emp.role === 'cook' && <ChefHat className="w-3 h-3 text-[#EF4444]" />}
                          {emp.role === 'delivery' && <Bike className="w-3 h-3 text-[#22C55E]" />}
                          <span>{emp.role}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[#D1D5DB] font-mono text-[11px]">
                        {emp.email}
                      </td>

                      <td className="px-5 py-3.5 text-[#D1D5DB]">{emp.phone || '—'}</td>

                      <td className="px-5 py-3.5">
                        {emp.role === 'waiter' ? (
                          emp.assignedTables && emp.assignedTables.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {emp.assignedTables.map((t) => (
                                <span
                                  key={t}
                                  className="bg-[#151515] border border-[#353535] text-[#FFC400] text-[10px] font-black px-2 py-0.5 rounded-md"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#888888]">All Tables</span>
                          )
                        ) : emp.role === 'cook' ? (
                          <span className="text-[#FFC400] font-bold">Kitchen Fry Line</span>
                        ) : (
                          <span className="text-[#22C55E] font-bold">Kasur Delivery</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(empId)}
                          className={`cursor-pointer px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border ${
                            emp.active !== false
                              ? 'bg-[#151515] border-[#22C55E] text-[#22C55E]'
                              : 'bg-[#151515] border-[#353535] text-[#888888]'
                          }`}
                        >
                          {emp.active !== false ? 'Active' : 'Deactivated'}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp)}
                            className="cursor-pointer p-2 bg-[#151515] hover:bg-[#FFC400] hover:text-black text-[#D1D5DB] rounded-xl transition-all border border-[#353535]"
                            title="Edit employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(empId)}
                            className="cursor-pointer p-2 bg-[#151515] hover:bg-[#EF4444] text-[#D1D5DB] hover:text-white rounded-xl transition-all border border-[#353535]"
                            title="Remove account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#222222] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#353535] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {editingStaff ? 'Edit Staff Member' : 'Register New Employee'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asad Malik"
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              {!editingStaff && (
                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">
                    System Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="cursor-pointer w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400] capitalize"
                  >
                    <option value="waiter">Waiter (Floor Service & Table Orders)</option>
                    <option value="cook">Cook / Fryer Chef (KDS System)</option>
                    <option value="delivery">Delivery Rider (Kasur Portal)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Login Email *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingStaff}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@krispier.pk"
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white disabled:bg-[#111111] placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">
                  {editingStaff ? 'Set New Password (Leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 4882200"
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              {role === 'waiter' && (
                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">
                    Assigned Tables (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={assignedTables}
                    onChange={(e) => setAssignedTables(e.target.value)}
                    placeholder="T01, T02, T03, T04"
                    className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400] font-mono"
                  />
                  <span className="text-[10px] text-[#A0A0A0] mt-1 block">
                    Waiter will receive live calls and food ready chimes for these tables.
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer px-4 py-2.5 bg-[#151515] text-[#D1D5DB] font-bold rounded-xl border border-[#353535]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  {editingStaff ? 'Save Changes' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
