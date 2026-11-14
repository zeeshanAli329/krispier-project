import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { KrispierLogo } from '../common/KrispierLogo';

interface AdminLoginProps {
  onLoginSuccess: (role: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin123@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login({ email: email.trim(), password });
      onLoginSuccess(user.role);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#151515] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#FFC400] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <KrispierLogo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          Krispier Staff Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#D1D5DB]">
          Kasur Operations & Management Suite
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#222222] border border-[#353535] py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-[#151515] border border-[#EF4444] text-[#EF4444] text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#EF4444]" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin123@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#151515] border border-[#353535] rounded-xl text-white text-xs placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#151515] border border-[#353535] rounded-xl text-white text-xs placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full py-3.5 px-4 bg-[#FFC400] hover:bg-[#FFB800] disabled:bg-[#353535] disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Management'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Credential Switchers for evaluation and easy testing */}
          <div className="mt-6 pt-6 border-t border-[#353535] space-y-3">
            <div className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider text-center">
              Quick Role Test Logins
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin123@gmail.com', 'Admin@123')}
                className="cursor-pointer p-2.5 rounded-xl bg-[#151515] hover:bg-[#2d2d2d] text-left border border-[#353535] hover:border-[#FFC400] transition-colors"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#FFC400]" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-[#A0A0A0] truncate">admin123@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('waiter@smartdine.com', 'Waiter@123')}
                className="cursor-pointer p-2.5 rounded-xl bg-[#151515] hover:bg-[#2d2d2d] text-left border border-[#353535] hover:border-[#FFC400] transition-colors"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#FFC400]" />
                  <span>Waiter</span>
                </div>
                <div className="text-[10px] text-[#A0A0A0] truncate">waiter@smartdine.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('cook@smartdine.com', 'Cook@123')}
                className="cursor-pointer p-2.5 rounded-xl bg-[#151515] hover:bg-[#2d2d2d] text-left border border-[#353535] hover:border-[#FFC400] transition-colors"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Cook (KDS)</span>
                </div>
                <div className="text-[10px] text-[#A0A0A0] truncate">cook@smartdine.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('delivery@smartdine.com', 'Delivery@123')}
                className="cursor-pointer p-2.5 rounded-xl bg-[#151515] hover:bg-[#2d2d2d] text-left border border-[#353535] hover:border-[#FFC400] transition-colors"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Delivery</span>
                </div>
                <div className="text-[10px] text-[#A0A0A0] truncate">delivery@smartdine.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
