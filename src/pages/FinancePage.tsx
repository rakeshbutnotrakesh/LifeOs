import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  Search,
  Download,
  AlertCircle,
  Tag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Transaction, TransactionType, ExpenseCategory } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Education: '#6366f1',
  Transport: '#06b6d4',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Bills: '#ef4444',
  Healthcare: '#10b981',
  Other: '#64748b',
};

export const FinancePage: React.FC = () => {
  const { data, addTransaction, updateTransaction, deleteTransaction, updateSettings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Budget edit state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(data.settings.monthlyBudget.toString());

  // Delete transaction confirmation
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // Form states
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory | string>('Food');
  const [formNote, setFormNote] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI');

  const currencySymbol = data.settings.currencySymbol || '₹';

  // Metrics computation
  const totalIncome = useMemo(
    () =>
      data.transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [data.transactions]
  );

  const totalExpense = useMemo(
    () =>
      data.transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [data.transactions]
  );

  const availableBalance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  const budgetUsedPct =
    data.settings.monthlyBudget > 0
      ? Math.round((totalExpense / data.settings.monthlyBudget) * 100)
      : 0;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tx.note.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          tx.paymentMethod?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.transactions, filterType, filterCategory, searchQuery]);

  // Category breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    data.transactions
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#6366f1',
    }));
  }, [data.transactions]);

  // Monthly Spending trend for Bar Chart
  const monthlyTrendData = useMemo(() => {
    // Group transactions by month or day
    const daysMap: Record<string, { day: string; expense: number; income: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[key] = { day: dayLabel, expense: 0, income: 0 };
    }

    data.transactions.forEach((tx) => {
      if (daysMap[tx.date]) {
        if (tx.type === 'expense') daysMap[tx.date].expense += tx.amount;
        if (tx.type === 'income') daysMap[tx.date].income += tx.amount;
      }
    });

    return Object.values(daysMap);
  }, [data.transactions]);

  const openCreateModal = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setFormType(type);
    setFormAmount('');
    setFormCategory('Food');
    setFormNote('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('UPI');
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormNote(tx.note);
    setFormDate(tx.date);
    setFormPaymentMethod(tx.paymentMethod || 'UPI');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (!amt || amt <= 0) return;

    if (editingTx) {
      updateTransaction(editingTx.id, {
        type: formType,
        amount: amt,
        category: formCategory,
        note: formNote.trim() || `${formCategory} transaction`,
        date: formDate,
        paymentMethod: formPaymentMethod,
      });
    } else {
      addTransaction({
        type: formType,
        amount: amt,
        category: formCategory,
        note: formNote.trim() || `${formCategory} transaction`,
        date: formDate,
        paymentMethod: formPaymentMethod,
      });
    }
    setIsModalOpen(false);
  };

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      updateSettings({ monthlyBudget: val });
    }
    setIsEditingBudget(false);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'Payment Method'];
    const rows = data.transactions.map((t) => [
      t.date,
      t.type,
      `"${t.category}"`,
      t.amount,
      `"${t.note}"`,
      `"${t.paymentMethod || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lifeos-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Personal Finance &amp; Cash Flow</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitor income, categorized expenses, savings goals and monthly budget
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => openCreateModal('expense')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => openCreateModal('income')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Metrics 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Income */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Inflows
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {currencySymbol}
            {totalIncome.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Stipend, freelance &amp; deposits</p>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Outflows
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">
            {currencySymbol}
            {totalExpense.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Rent, food &amp; personal bills</p>
        </div>

        {/* Card 3: Net Available Balance */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black ${
              availableBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'
            }`}
          >
            {currencySymbol}
            {availableBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Savings Rate: <span className="font-semibold text-neutral-300">{savingsRate}%</span>
          </p>
        </div>

        {/* Card 4: Monthly Budget */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Monthly Budget
            </span>
            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="p-1 rounded text-neutral-400 hover:text-white"
              title="Edit Budget Target"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingBudget ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-xs text-white"
                autoFocus
              />
              <button
                onClick={handleSaveBudget}
                className="px-2 py-1 rounded bg-indigo-600 text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="text-2xl font-black text-neutral-100">
              {currencySymbol}
              {data.settings.monthlyBudget.toLocaleString()}
            </div>
          )}

          <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsedPct > 100
                  ? 'bg-rose-500'
                  : budgetUsedPct > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5">
            {budgetUsedPct}% of budget consumed
          </p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 7-Day Cashflow Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-neutral-100">7-Day Spending &amp; Income Trend</h3>
              <p className="text-xs text-neutral-400">Daily inflows vs outflows</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => `${currencySymbol}${val}`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown Donut Chart (1 col) */}
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-neutral-100">Expense Breakdown</h3>
            <p className="text-xs text-neutral-400">Categorical distribution</p>
          </div>

          <div className="h-48 w-full my-2">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                No expenses logged yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => `${currencySymbol}${val}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-neutral-400">
                  {c.name}: {currencySymbol}
                  {c.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-base text-neutral-100">
            Transaction Ledger ({filteredTransactions.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search note or category..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
              />
            </div>

            {/* Type selector */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Category selector */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Education">Education</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Bills</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Description / Note</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Payment Method</th>
                <th className="pb-3 px-3 text-right">Amount</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No transactions match your query
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isInc = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-3 text-neutral-400 font-mono">{tx.date}</td>
                      <td className="py-3 px-3 font-semibold text-neutral-200">{tx.note}</td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[tx.category] || '#6366f1'}20`,
                            color: CATEGORY_COLORS[tx.category] || '#818cf8',
                            border: `1px solid ${CATEGORY_COLORS[tx.category] || '#6366f1'}40`,
                          }}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-400">{tx.paymentMethod || 'UPI'}</td>
                      <td
                        className={`py-3 px-3 text-right font-bold font-mono text-sm ${
                          isInc ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isInc ? '+' : '-'}
                        {currencySymbol}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1 rounded text-neutral-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTxId(tx.id)}
                            className="p-1 rounded text-neutral-400 hover:text-rose-400"
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

      {/* CREATE / EDIT TRANSACTION MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold">
                {editingTx ? 'Edit Transaction' : 'Record Transaction'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    formType === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    formType === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  Income (+)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  >
                    <option value="Food">Food</option>
                    <option value="Education">Education</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills">Bills</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    placeholder="UPI, Card, Cash"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Note / Description</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="What was this for?"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  {editingTx ? 'Save Changes' : 'Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTxId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This will adjust your total balances."
        confirmText="Delete"
        onConfirm={() => {
          if (deleteTxId) deleteTransaction(deleteTxId);
        }}
        onCancel={() => setDeleteTxId(null)}
      />
    </div>
  );
};
