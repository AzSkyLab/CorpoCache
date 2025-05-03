import React from 'react';
import CreditCards from './components/CreditCards';
import MonthlyBills from './components/MonthlyBills';
import Income from './components/Income';
import SavingsEstimator from './components/SavingsEstimator';

const App: React.FC = () => {
  return (
    <main>
      <h1>Chrome Cache</h1>
      <CreditCards />
      <MonthlyBills />
      <Income />
      <SavingsEstimator />
    </main>
  );
};

export default App;
