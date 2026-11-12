import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { store } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transport',
  'Bills & Utilities',
  'Entertainment',
  'Salary & Income',
  'Other',
];

export const ExpenseTrackerView: React.FC = () => {
  const { toast } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    store.get('aerokit_expenses', [
      {
        id: '1',
        type: 'income',
        title: 'Monthly Salary',
        amount: 3200,
        category: 'Salary & Income',
        date: new Date().toLocaleDateString(),
      },
      {
        id: '2',
        type: 'expense',
        title: 'Groceries & Market',
        amount: 145.5,
        category: 'Food & Dining',
        date: new Date().toLocaleDateString(),
      },
      {
        id: '3',
        type: 'expense',
        title: 'Coffee & Breakfast',
        amount: 18.25,
        category: 'Food & Dining',
        date: new Date().toLocaleDateString(),
      },
    ])
  );

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [showAdd, setShowAdd] = useState(false);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) {
      toast('Please enter a valid title and amount');
      return;
    }
    const newTx: Transaction = {
      id: Date.now().toString(),
      type,
      title: title.trim(),
      amount: num,
      category,
      date: new Date().toLocaleDateString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    store.set('aerokit_expenses', updated);
    setTitle('');
    setAmount('');
    setShowAdd(false);
    toast('Transaction added');
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    store.set('aerokit_expenses', updated);
    toast('Transaction deleted');
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header
        title="Expenses Tracker"
        rightAction={
          <button
            className="ib"
            onClick={() => setShowAdd(!showAdd)}
            aria-label="Add transaction"
            type="button"
            title="Add transaction"
          >
            <Icon name={showAdd ? 'trash' : 'bolt'} size={18} color="var(--ac)" />
          </button>
        }
      />

      {/* Balance Overview Card */}
      <div
        className="glass"
        style={{
          padding: '16px',
          borderRadius: '18px',
          marginBottom: '12px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '11.5px', color: 'var(--mut)', fontWeight: 600 }}>
          Net Balance
        </span>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: balance >= 0 ? 'var(--ac)' : '#ff6b6b',
            margin: '4px 0 10px',
          }}
        >
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--bd)', paddingTop: '10px' }}>
          <div>
            <small style={{ color: 'var(--mut)', fontSize: '10px', display: 'block' }}>Income</small>
            <b style={{ color: 'var(--cy)', fontSize: '14px' }}>
              +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </b>
          </div>
          <div style={{ width: '1px', background: 'var(--bd)' }} />
          <div>
            <small style={{ color: 'var(--mut)', fontSize: '10px', display: 'block' }}>Expenses</small>
            <b style={{ color: '#ff6b6b', fontSize: '14px' }}>
              -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </b>
          </div>
        </div>
      </div>

      {/* Add Transaction Drawer */}
      {showAdd && (
        <form onSubmit={handleAdd} className="glass" style={{ padding: '14px', borderRadius: '18px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <button
              type="button"
              className={`tabs ${type === 'expense' ? 'on' : ''}`}
              onClick={() => setType('expense')}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '10px',
                background: type === 'expense' ? 'rgba(255,107,107,0.2)' : 'var(--s2)',
                border: type === 'expense' ? '1px solid #ff6b6b' : '1px solid var(--bd)',
                color: type === 'expense' ? '#ff6b6b' : 'var(--mut)',
                fontWeight: 700,
                fontSize: '11px',
              }}
            >
              Expense (-)
            </button>
            <button
              type="button"
              className={`tabs ${type === 'income' ? 'on' : ''}`}
              onClick={() => setType('income')}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '10px',
                background: type === 'income' ? 'rgba(198,255,61,0.2)' : 'var(--s2)',
                border: type === 'income' ? '1px solid var(--ac)' : '1px solid var(--bd)',
                color: type === 'income' ? 'var(--ac)' : 'var(--mut)',
                fontWeight: 700,
                fontSize: '11px',
              }}
            >
              Income (+)
            </button>
          </div>

          <label className="fld" style={{ marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Description (e.g. Dinner, Grocery)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="fld" style={{ marginBottom: '8px' }}>
            <input
              type="number"
              placeholder="Amount ($)"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label className="fld" style={{ marginBottom: '10px' }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn" style={{ width: '100%', height: '38px', fontSize: '13px' }}>
            <span>Add Transaction</span>
          </button>
        </form>
      )}

      {/* Transaction List */}
      <div className="sec">
        <span>Transactions ({transactions.length})</span>
        {transactions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setTransactions([]);
              store.set('aerokit_expenses', []);
              toast('All transactions cleared');
            }}
            style={{ fontSize: '11px', color: 'var(--mut)' }}
          >
            Clear All
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px' }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--mut)', fontSize: '12px' }}>
            No transactions recorded yet. Tap + to add one.
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="rec glass"
              style={{
                padding: '10px 12px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                className="mini"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: tx.type === 'income' ? 'rgba(198,255,61,0.15)' : 'rgba(255,107,107,0.15)',
                  color: tx.type === 'income' ? 'var(--ac)' : '#ff6b6b',
                }}
              >
                <Icon name={tx.type === 'income' ? 'arrow' : 'trash'} size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: 'var(--tx)' }}>
                  {tx.title}
                </span>
                <small style={{ fontSize: '10.5px', color: 'var(--mut)' }}>
                  {tx.category} · {tx.date}
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: tx.type === 'income' ? 'var(--ac)' : '#ff6b6b',
                    display: 'block',
                  }}
                >
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(tx.id)}
                  style={{ color: 'var(--dim)', fontSize: '11px' }}
                  aria-label="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseTrackerView;
