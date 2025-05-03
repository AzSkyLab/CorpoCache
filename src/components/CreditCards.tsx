import React, { useEffect, useState } from 'react';
import { CreditCard, getUserData, setUserData, UserData } from '../data/userData';
import styles from './CreditCards.module.css';

// Mock user ID for demo; replace with real auth/user context in production
const USER_ID = 'demo-user';

interface CreditCardFormProps {
  card?: CreditCard;
  onSave: (card: CreditCard) => void;
  onCancel: () => void;
}

const emptyCard: CreditCard = {
  id: '',
  name: '',
  dateOpened: '',
  creditLimit: 0,
  currentBalance: 0,
};

const CreditCardForm: React.FC<CreditCardFormProps> = ({ card, onSave, onCancel }) => {
  const [form, setForm] = useState<CreditCard>(card || { ...emptyCard, id: crypto.randomUUID() });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name.includes('Limit') || name.includes('Balance') ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className={styles.cardForm} onSubmit={handleSubmit} aria-label={card ? 'Edit Credit Card' : 'Add Credit Card'}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Card Name" required />
      <input name="dateOpened" value={form.dateOpened} onChange={handleChange} placeholder="Date Opened (YYYY-MM)" required type="month" />
      <input name="creditLimit" value={form.creditLimit} onChange={handleChange} placeholder="Credit Limit" required type="number" min={0} />
      <input name="currentBalance" value={form.currentBalance} onChange={handleChange} placeholder="Current Balance" required type="number" min={0} />
      <div className={styles.formActions}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

const CreditCards: React.FC = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CreditCard | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserData(USER_ID)
      .then(data => setCards(data?.creditCards || []))
      .catch(() => setError('Failed to load credit cards.'))
      .finally(() => setLoading(false));
  }, []);

  const saveCards = async (newCards: CreditCard[]) => {
    setLoading(true);
    setError(null);
    try {
      const user = (await getUserData(USER_ID)) || { id: USER_ID, creditCards: [], bills: [], income: { salary: 0, k401Percent: 0, esppPercent: 0, insurance: 0, bonusPercent: 0 }, savings: { estimatedMonthlySavings: 0 }, month: '' };
      user.creditCards = newCards;
      await setUserData(user);
      setCards(newCards);
    } catch {
      setError('Failed to save credit cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (card: CreditCard) => {
    setEditing(card);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const newCards = cards.filter(c => c.id !== id);
    saveCards(newCards);
  };

  const handleSave = (card: CreditCard) => {
    let newCards;
    if (editing) {
      newCards = cards.map(c => (c.id === card.id ? card : c));
    } else {
      newCards = [...cards, card];
    }
    saveCards(newCards);
    setShowForm(false);
    setEditing(null);
  };

  // Utilization calculations
  const totalLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalBalance = cards.reduce((sum, c) => sum + c.currentBalance, 0);
  const utilization = totalLimit ? (totalBalance / totalLimit) * 100 : 0;

  const payToUnder = (limit: number, balance: number, percent: number) => {
    const target = limit * percent;
    return balance > target ? balance - target : 0;
  };

  return (
    <section className={styles.section} aria-labelledby="credit-cards-heading">
      <h2 id="credit-cards-heading">Credit Cards</h2>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !error && (
        <>
          <button className={styles.addBtn} onClick={handleAdd}>Add Card</button>
          {showForm && (
            <CreditCardForm
              card={editing || undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          )}
          <div className={styles.cardsList}>
            {cards.length === 0 && <div>No credit cards added.</div>}
            {cards.map(card => {
              const util = card.creditLimit ? (card.currentBalance / card.creditLimit) * 100 : 0;
              return (
                <article key={card.id} className={styles.card} aria-label={`Credit card: ${card.name}`}>
                  <div><strong>{card.name}</strong> (Opened: {card.dateOpened})</div>
                  <div>Limit: ${card.creditLimit.toLocaleString()}</div>
                  <div>Balance: ${card.currentBalance.toLocaleString()}</div>
                  <div>Utilization: {util.toFixed(1)}%</div>
                  <div>Pay to &lt;29%: ${payToUnder(card.creditLimit, card.currentBalance, 0.29).toFixed(2)}</div>
                  <div>Pay to &lt;9%: ${payToUnder(card.creditLimit, card.currentBalance, 0.09).toFixed(2)}</div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(card)}>Edit</button>
                    <button onClick={() => handleDelete(card.id)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className={styles.summary}>
            <strong>Total Limit:</strong> ${totalLimit.toLocaleString()}<br />
            <strong>Total Balance:</strong> ${totalBalance.toLocaleString()}<br />
            <strong>Total Utilization:</strong> {utilization.toFixed(1)}%
          </div>
        </>
      )}
    </section>
  );
};

export default CreditCards;
