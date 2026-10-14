import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { getSupabaseCredentials, testSupabaseConnection } from '../../lib/supabase';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { showToast, refreshData } = useApp();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setKey(creds.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    if (!url || !key) {
      setTestResult({ success: false, message: 'Vui lòng nhập cả Supabase URL và Anon Public Key.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), key.trim());
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    if (!url || !key) {
      // Clear credentials -> return to local mode
      localStorage.removeItem('workday_supabase_url');
      localStorage.removeItem('workday_supabase_anon_key');
      showToast('info', 'Đã chuyển về chế độ Dữ liệu Đồng bộ Cục bộ (Local Database).');
      refreshData();
      onClose();
      return;
    }

    localStorage.setItem('workday_supabase_url', url.trim());
    localStorage.setItem('workday_supabase_anon_key', key.trim());
    showToast('success', 'Đã lưu cấu hình kết nối Supabase thành công!');
    refreshData();
    onClose();
  };

  const handleCopySqlHint = () => {
    navigator.clipboard.writeText('supabase_schema.sql');
    setIsCopied(true);
    showToast('info', 'File SQL đã có sẵn trong thư mục gốc dự án: supabase_schema.sql');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isConfigured = Boolean(url && key && !url.includes('your-project-id'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kết Nối Cơ Sở Dữ Liệu Trực Tuyến (Supabase)"
      subtitle="Quản lý đồng bộ dữ liệu tập trung giữa nhiều thiết bị và người dùng"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Status indicator banner */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            isConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <Database className={`w-5 h-5 shrink-0 mt-0.5 ${isConfigured ? 'text-emerald-600' : 'text-blue-600'}`} />
          <div className="text-sm">
            <p className="font-semibold">
              {isConfigured
                ? 'Đang cấu hình kết nối Supabase PostgreSQL'
                : 'Đang hoạt động ở chế độ Đồng Bộ Cục Bộ (Zero-Config)'}
            </p>
            <p className="mt-1 text-xs opacity-90 leading-relaxed">
              {isConfigured
                ? 'Dữ liệu được lưu trữ tập trung trên Supabase Cloud và bảo vệ bởi Row Level Security (RLS).'
                : 'Mọi thao tác đều được lưu trữ trực tiếp trên trình duyệt. Bạn có thể nhập thông tin Supabase bên dưới để kích hoạt đồng bộ đám mây trực tiếp cho toàn công ty.'}
            </p>
          </div>
        </div>

        {/* Input credentials */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">
              Khóa này an toàn để sử dụng ở frontend. Tuyệt đối không nhập Service Role Secret Key!
            </p>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Instructions Guide */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span>Hướng dẫn thiết lập Supabase trong 2 phút:</span>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              Mở Supabase <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
            <li>Tạo một dự án mới miễn phí trên Supabase.</li>
            <li>Vào mục <strong>SQL Editor</strong>, mở file <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">supabase_schema.sql</code> đã có trong dự án và bấm <strong>Run</strong> để tự động tạo bảng & RLS policies.</li>
            <li>Vào <strong>Project Settings -&gt; API</strong>, copy <strong>Project URL</strong> và <strong>anon key</strong> dán vào 2 ô phía trên.</li>
          </ol>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCopySqlHint}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-medium"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              File SQL hoàn chỉnh: <span className="font-mono underline">supabase_schema.sql</span>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !url || !key}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Kiểm tra kết nối
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
