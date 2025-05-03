import React, { useEffect, useState } from 'react';
import { Bill, getUserData, setUserData } from '../data/userData';
import styles from './MonthlyBills.module.css';

const USER_ID = 'demo-user';

type PaycheckLabel = '15th' | 'last';

interface BillFormProps {
  bill?: Bill;
  onSave: (bill: Bill) => void;
  onCancel: () => void;
}

const emptyBill: Bill = {
  id: '',
  name: '',
  amount: 0,
  dueDate: '',
  paid: false,
  paycheckLabel: '15th',
};

const BillForm: React.FC<BillFormProps> = ({ bill, onSave, onCancel }) => {
  const [form, setForm] = useState<Bill>(bill || { ...emptyBill, id: crypto.randomUUID() });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className={styles.billForm} onSubmit={handleSubmit} aria-label={bill ? 'Edit Bill' : 'Add Bill'}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Bill Name" required />
      <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" required type="number" min={0} />
      <input name="dueDate" value={form.dueDate} onChange={handleChange} placeholder="Due Date" required type="date" />
      <select name="paycheckLabel" value={form.paycheckLabel} onChange={handleChange} required>
        <option value="15th">15th Paycheck</option>
        <option value="last">Last Paycheck</option>
      </select>
      <div className={styles.formActions}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

const MonthlyBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserData(USER_ID)
      .then(data => setBills(data?.bills || []))
      .catch(() => setError('Failed to load bills.'))
      .finally(() => setLoading(false));
  }, []);

  const saveBills = async (newBills: Bill[]) => {
    setLoading(true);
    setError(null);
    try {
      const user = (await getUserData(USER_ID)) || { id: USER_ID, creditCards: [], bills: [], income: { salary: 0, k401Percent: 0, esppPercent: 0, insurance: 0, bonusPercent: 0 }, savings: { estimatedMonthlySavings: 0 }, month: '' };
      user.bills = newBills;
      await setUserData(user);
      setBills(newBills);
    } catch {
      setError('Failed to save bills.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (bill: Bill) => {
    setEditing(bill);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const newBills = bills.filter(b => b.id !== id);
    saveBills(newBills);
  };

  const handleSave = (bill: Bill) => {
    let newBills;
    if (editing) {
      newBills = bills.map(b => (b.id === bill.id ? bill : b));
    } else {
      newBills = [...bills, bill];
    }
    saveBills(newBills);
    setShowForm(false);
    setEditing(null);
  };

  const handlePaidToggle = (id: string) => {
    const newBills = bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b);
    saveBills(newBills);
  };

  // Totals by paycheck label
  const totalByLabel = (label: PaycheckLabel) =>
    bills.filter(b => b.paycheckLabel === label).reduce((sum, b) => sum + b.amount, 0);

  return (
    <section className={styles.section} aria-labelledby="monthly-bills-heading">
      <h2 id="monthly-bills-heading">Monthly Bills and Expenses</h2>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !error && (
        <>
          <button className={styles.addBtn} onClick={handleAdd}>Add Bill</button>
          {showForm && (
            <BillForm
              bill={editing || undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          )}
          <div className={styles.billsList}>
            {bills.length === 0 && <div>No bills added.</div>}
            {bills.map(bill => (
              <article key={bill.id} className={styles.bill} aria-label={`Bill: ${bill.name}`}>
                <div><strong>{bill.name}</strong> (${bill.amount.toLocaleString()})</div>
                <div>Due: {bill.dueDate}</div>
                <div>Paycheck: {bill.paycheckLabel === '15th' ? '15th' : 'Last'}</div>
                <div>Status: <input type="checkbox" checked={bill.paid} onChange={() => handlePaidToggle(bill.id)} aria-label={bill.paid ? 'Mark as unpaid' : 'Mark as paid'} /> {bill.paid ? 'Paid' : 'Unpaid'}</div>
                <div className={styles.billActions}>
                  <button onClick={() => handleEdit(bill)}>Edit</button>
                  <button onClick={() => handleDelete(bill.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.summary}>
            <strong>15th Paycheck Total:</strong> ${totalByLabel('15th').toLocaleString()}<br />
            <strong>Last Paycheck Total:</strong> ${totalByLabel('last').toLocaleString()}
          </div>
        </>
      )}
    </section>
  );
};

export default MonthlyBills;
