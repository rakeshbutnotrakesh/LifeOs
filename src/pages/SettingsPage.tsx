import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Bell,
  DollarSign,
  Calendar,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const {
    data,
    updateSettings,
    updateProfile,
    setTheme,
    toggleWidgetVisibility,
    exportBackup,
    importBackup,
    resetDemo,
    clearAll,
    addToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [name, setName] = useState(data.settings.profile.name);
  const [avatar, setAvatar] = useState(data.settings.profile.avatar);
  const [role, setRole] = useState(data.settings.profile.role);
  const [bio, setBio] = useState(data.settings.profile.bio);

  // Modals for dangerous actions
  const [isResetDemoModalOpen, setIsResetDemoModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      avatar: avatar.trim() || name.substring(0, 2).toUpperCase(),
      role: role.trim(),
      bio: bio.trim(),
    });
  };

  const handleCurrencyChange = (curr: 'INR' | 'USD' | 'EUR' | 'GBP') => {
    const symbolMap = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    updateSettings({ currency: curr, currencySymbol: symbolMap[curr] });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importBackup(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDark = data.settings.theme === 'dark';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-neutral-100">Settings &amp; Data Control</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Manage your personal workspace preferences, appearance, local backups and privacy
        </p>
      </div>

      {/* Privacy Notice Banner (User requested requirement #15) */}
      <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-indigo-200">Local &amp; Private by Design</h3>
          <p className="text-xs text-indigo-300/80 mt-1 leading-relaxed">
            &ldquo;LifeOS stores your personal information locally in your browser. Your data is not uploaded to external servers.&rdquo;
          </p>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-indigo-400 font-medium">
            <span>✓ No tracking scripts</span>
            <span>✓ No external database</span>
            <span>✓ Full offline capability</span>
          </div>
        </div>
      </div>

      {/* 1. Profile Settings */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <User className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-neutral-100">User Profile</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Avatar Initials
              </label>
              <input
                type="text"
                maxLength={3}
                value={avatar}
                onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 uppercase font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Academic Role / Tagline
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Computer Science Student & Freelancer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Bio / Personal Motto</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Appearance & Localization */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-neutral-100">Appearance &amp; Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-neutral-800 border-indigo-500 text-white shadow'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                Dark (Default)
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !isDark
                    ? 'bg-neutral-800 border-indigo-500 text-white shadow'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2">
              Currency Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['INR', 'USD', 'EUR', 'GBP'] as const).map((curr) => {
                const isSelected = data.settings.currency === curr;
                const symbols = { INR: '₹ INR', USD: '$ USD', EUR: '€ EUR', GBP: '£ GBP' };
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => handleCurrencyChange(curr)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {symbols[curr]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Week Start */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2">
              First Day of Week
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Monday', 'Sunday'] as const).map((day) => {
                const isSelected = data.settings.weekStart === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => updateSettings({ weekStart: day })}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dashboard Widget Customization */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-neutral-100">Dashboard Widget Layout</h3>
        </div>

        <p className="text-xs text-neutral-400">
          Enable or disable specific modules on your personal homepage:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.settings.dashboardWidgets.map((widget) => (
            <div
              key={widget.id}
              onClick={() => toggleWidgetVisibility(widget.id)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                widget.visible
                  ? 'bg-neutral-800/80 border-indigo-500/40 text-neutral-100'
                  : 'bg-neutral-900/40 border-neutral-800 text-neutral-500'
              }`}
            >
              <span className="text-xs font-semibold">{widget.name}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  widget.visible
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                {widget.visible ? 'Visible' : 'Hidden'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Data Backup, Export & Restore */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Download className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-neutral-100">Backup &amp; Migration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 space-y-2">
            <h4 className="font-bold text-xs text-neutral-200">Export All Data (JSON)</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Download your complete LifeOS database including tasks, exams, financial ledgers, and journals into an offline JSON backup.
            </p>
            <button
              onClick={exportBackup}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 space-y-2">
            <h4 className="font-bold text-xs text-neutral-200">Restore from JSON</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Upload a previously exported LifeOS JSON file to seamlessly restore all data.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select File to Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Danger Zone */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-500/20">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <h3 className="font-bold text-base text-rose-300">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-xs text-neutral-200">Load Sample Demo Data</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Populate realistic academic timetable, sample tasks, and financial transactions.
            </p>
          </div>
          <button
            onClick={() => setIsResetDemoModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-rose-500/20">
          <div>
            <div className="font-bold text-xs text-rose-300">Wipe All Local Storage Data</div>
            <p className="text-[11px] text-rose-400/80 mt-0.5">
              Permanently clear all tasks, study entries, financial transactions, and settings.
            </p>
          </div>
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-md shadow-rose-900/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset LifeOS</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={isResetDemoModalOpen}
        title="Load Sample Demo Data"
        message="This will reload the rich demo dataset with sample courses, exams, tasks, and habits. Any current unbacked data will be replaced. Continue?"
        confirmText="Load Demo Data"
        isDestructive={false}
        onConfirm={resetDemo}
        onCancel={() => setIsResetDemoModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Reset All Application Data"
        message="Warning: This will permanently delete all your tasks, courses, grades, finances, habits, notes, and settings. Are you absolutely certain?"
        confirmText="Yes, Wipe All Data"
        isDestructive={true}
        onConfirm={clearAll}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </div>
  );
};
