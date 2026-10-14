import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

interface LoginFormProps {
  onOpenResetPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onOpenResetPassword }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Đăng nhập không thành công.');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = await login(demoEmail, '123456');
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Đăng nhập không thành công.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 p-8 text-center text-white relative">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-1 ring-white/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase">Workday Manager</h1>
          <p className="text-xs text-blue-100 font-medium mt-1">
            Hệ Thống Quản Lý Ngày Nghỉ Phép Công Ty
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email tài khoản
              </label>
              <input
                type="email"
                required
                placeholder="nguyenvana@workday.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={onOpenResetPassword}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Switcher (As required for testing) */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Tài khoản mẫu thử nghiệm (1-Click)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('nguyenvana@workday.vn')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    Nguyễn Văn A (NV001)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Nghỉ 3.0/4.5 ngày • <span className="text-emerald-600 font-semibold">Trong hạn mức</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  Nhân viên
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('tranthib@workday.vn')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-rose-700">
                    Trần Thị B (NV002)
                  </div>
                  <div className="text-[10px] text-rose-600 font-semibold">
                    Nghỉ 5.0/4.5 ngày • VƯỢT HẠN MỨC 0.5 NGÀY
                  </div>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  Cảnh báo đỏ
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@workday.vn')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                    Trần Văn Quản Trị (NV000)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Quản lý toàn bộ nhân sự, hạn mức & xuất Excel
                  </div>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dominhtuan@workday.vn')}
                className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-left transition-all opacity-80"
              >
                <div>
                  <div className="text-xs font-bold text-slate-600">
                    Đỗ Minh Tuấn (NV005)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tài khoản đã bị quản trị viên khóa
                  </div>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  Thử khóa
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
