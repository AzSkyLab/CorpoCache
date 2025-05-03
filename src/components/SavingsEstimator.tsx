import React, { useEffect, useState } from 'react';
import { getUserData, setUserData, Bill, IncomeData, SavingsData } from '../data/userData';
import styles from './SavingsEstimator.module.css';

const USER_ID = 'demo-user';

const FEDERAL_TAX = 0.22;
const OASDI_TAX = 0.062;
const MEDICARE_TAX = 0.0145;
const STATE_TAX = 0.05;

const SavingsEstimator: React.FC = () => {
  const [income, setIncome] = useState<IncomeData | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [savings, setSavings] = useState<SavingsData>({ estimatedMonthlySavings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserData(USER_ID)
      .then(data => {
        setIncome(data?.income || null);
        setBills(data?.bills || []);
        setSavings(data?.savings || { estimatedMonthlySavings: 0 });
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, []);

  if (!income) {
    return (
      <section className={styles.section} aria-labelledby="savings-estimator-heading">
        <h2 id="savings-estimator-heading">Savings Estimator</h2>
        <div>Please enter your income first.</div>
      </section>
    );
  }

  // Calculate net monthly income
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
  const netMonthly = net / 12;

  // Calculate total unpaid bills for the month
  const unpaidBills = bills.filter(b => !b.paid);
  const totalBills = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  const estimatedSavings = netMonthly - totalBills;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const user = (await getUserData(USER_ID)) || { id: USER_ID, creditCards: [], bills: [], income, savings: { estimatedMonthlySavings: 0 }, month: '' };
      user.savings.estimatedMonthlySavings = estimatedSavings;
      await setUserData(user);
      setSavings({ estimatedMonthlySavings: estimatedSavings });
      setSaved(true);
    } catch {
      setError('Failed to save estimated savings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="savings-estimator-heading">
      <h2 id="savings-estimator-heading">Savings Estimator</h2>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !error && (
        <>
          <div className={styles.summary}>
            <div>Net Monthly Income: ${netMonthly.toLocaleString()}</div>
            <div>Unpaid Bills: -${totalBills.toLocaleString()}</div>
            <div><strong>Estimated Monthly Savings: ${estimatedSavings.toLocaleString()}</strong></div>
          </div>
          <button onClick={handleSave}>Save Estimated Savings</button>
          {saved && <div className={styles.saved}>Saved!</div>}
          <div className={styles.savedValue}>
            <strong>Saved Value for Month:</strong> ${savings.estimatedMonthlySavings.toLocaleString()}
          </div>
        </>
      )}
    </section>
  );
};

export default SavingsEstimator;
