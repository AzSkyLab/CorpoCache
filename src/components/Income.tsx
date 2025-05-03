import React, { useEffect, useState } from 'react';
import { IncomeData, getUserData, setUserData } from '../data/userData';
import styles from './Income.module.css';

const USER_ID = 'demo-user';

const defaultIncome: IncomeData = {
  salary: 0,
  k401Percent: 0,
  esppPercent: 0,
  insurance: 0,
  bonusPercent: 0,
};

const FEDERAL_TAX = 0.22;
const OASDI_TAX = 0.062;
const MEDICARE_TAX = 0.0145;
const STATE_TAX = 0.05;

const Income: React.FC = () => {
  const [income, setIncome] = useState<IncomeData>(defaultIncome);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getUserData(USER_ID)
      .then(data => setIncome(data?.income || defaultIncome))
      .catch(() => setError('Failed to load income.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIncome(i => ({ ...i, [name]: Number(value) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = (await getUserData(USER_ID)) || { id: USER_ID, creditCards: [], bills: [], income: defaultIncome, savings: { estimatedMonthlySavings: 0 }, month: '' };
      user.income = income;
      await setUserData(user);
    } catch {
      setError('Failed to save income.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const gross = income.salary + (income.salary * (income.bonusPercent / 100));
  const k401 = gross * (income.k401Percent / 100);
  const espp = gross * (income.esppPercent / 100);
  const insurance = income.insurance;
  const taxable = gross - k401 - espp;
  const federal = taxable * FEDERAL_TAX;
  const oasdi = taxable * OASDI_TAX;
  const medicare = taxable * MEDICARE_TAX;
  const state = taxable * STATE_TAX;
  const net = taxable - federal - oasdi - medicare - state - insurance;

  return (
    <section className={styles.section} aria-labelledby="income-heading">
      <h2 id="income-heading">Income</h2>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !error && (
        <form className={styles.incomeForm} onSubmit={handleSave} aria-label="Income Entry">
          <label>
            Yearly Salary
            <input name="salary" value={income.salary} onChange={handleChange} type="number" min={0} required />
          </label>
          <label>
            401k %
            <input name="k401Percent" value={income.k401Percent} onChange={handleChange} type="number" min={0} max={100} required />
          </label>
          <label>
            ESPP %
            <input name="esppPercent" value={income.esppPercent} onChange={handleChange} type="number" min={0} max={100} required />
          </label>
          <label>
            Insurance (annual)
            <input name="insurance" value={income.insurance} onChange={handleChange} type="number" min={0} required />
          </label>
          <label>
            Bonus %
            <input name="bonusPercent" value={income.bonusPercent} onChange={handleChange} type="number" min={0} max={100} required />
          </label>
          <button type="submit">Save</button>
        </form>
      )}
      {!loading && !error && (
        <div className={styles.summary}>
          <h3>Tax Breakdown</h3>
          <div>Gross: ${gross.toLocaleString()}</div>
          <div>401k: -${k401.toLocaleString()}</div>
          <div>ESPP: -${espp.toLocaleString()}</div>
          <div>Insurance: -${insurance.toLocaleString()}</div>
          <div>Taxable: ${taxable.toLocaleString()}</div>
          <div>Federal: -${federal.toLocaleString()}</div>
          <div>OASDI: -${oasdi.toLocaleString()}</div>
          <div>Medicare: -${medicare.toLocaleString()}</div>
          <div>State: -${state.toLocaleString()}</div>
          <div><strong>Net (annual): ${net.toLocaleString()}</strong></div>
          <div><strong>Net (monthly): ${(net / 12).toLocaleString()}</strong></div>
        </div>
      )}
    </section>
  );
};

export default Income;
