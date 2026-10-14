import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Profile, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  CheckCircle,
  Shield,
  Building,
} from 'lucide-react';

const DEPARTMENTS = [
  'Phòng Kỹ Thuật',
  'Phòng Kinh Doanh',
  'Phòng Nhân Sự',
  'Phòng Kế Toán',
  'Phòng Marketing',
  'Ban Giám Đốc',
];

export const EmployeeManagement: React.FC = () => {
  const { profiles, createProfile, updateProfile, toggleLockProfile, deleteProfile } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCode('');
    setName('');
    setEmail('');
    setDepartment(DEPARTMENTS[0]);
    setPosition('');
    setRole('employee');
    setEditingProfile(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    // Suggest next code, e.g. NV006
    const nextNum = profiles.length + 1;
    setCode(`NV${String(nextNum).padStart(3, '0')}`);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Profile) => {
    setEditingProfile(p);
    setCode(p.employee_code);
    setName(p.full_name);
    setEmail(p.email);
    setDepartment(p.department);
    setPosition(p.position);
    setRole(p.role);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !email) {
      alert('Vui lòng điền đầy đủ Mã NV, Họ tên và Email.');
      return;
    }

    setIsSubmitting(true);
    if (editingProfile) {
      await updateProfile(editingProfile.id, {
        employee_code: code.trim().toUpperCase(),
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        department,
        position: position.trim() || 'Nhân viên',
        role,
      });
    } else {
      await createProfile({
        employee_code: code.trim().toUpperCase(),
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        department,
        position: position.trim() || 'Nhân viên',
        role,
        is_locked: false,
      });
    }
    setIsSubmitting(false);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${name} khỏi hệ thống?`)) {
      await deleteProfile(id);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Quản Lý Nhân Sự
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Danh Sách Thành Viên & Phân Quyền
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hồ sơ nhân viên, mã nhân viên, cấp tài khoản và khóa tài khoản vi phạm
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Thêm Nhân Viên Mới
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã NV, họ tên, email, phòng ban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs font-medium text-slate-500">
          Tổng số: <strong>{filteredProfiles.length}</strong> nhân viên
        </span>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nhân viên</th>
                <th className="py-3.5 px-4">Mã NV</th>
                <th className="py-3.5 px-4">Phòng ban</th>
                <th className="py-3.5 px-4">Chức vụ</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={
                        p.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          p.full_name
                        )}&background=2563eb&color=fff`
                      }
                      alt=""
                      className="w-8 h-8 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{p.full_name}</div>
                      <div className="text-[11px] text-slate-400">{p.email}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {p.employee_code}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{p.department}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.position}</td>
                  <td className="py-3.5 px-4">
                    {p.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        Admin
                      </span>
                    ) : p.role === 'manager' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        Quản lý
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Nhân viên
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {p.is_locked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        <Lock className="w-3 h-3" />
                        Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleLockProfile(p.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.is_locked
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-amber-600 hover:bg-amber-50'
                      }`}
                      title={p.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}
                    >
                      {p.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDelete(p.id, p.full_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa nhân viên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Profile Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProfile ? 'Cập Nhật Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên Mới'}
        subtitle="Thông tin sẽ được liên kết trực tiếp với tài khoản đăng nhập"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mã nhân viên
              </label>
              <input
                type="text"
                required
                placeholder="NV001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vai trò hệ thống
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Nhân viên</option>
                <option value="manager">Trưởng phòng / Quản lý</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email đăng nhập
            </label>
            <input
              type="email"
              required
              placeholder="nhanvien@workday.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phòng ban
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Chức vụ
              </label>
              <input
                type="text"
                placeholder="Chuyên viên"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Đang lưu...' : editingProfile ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
