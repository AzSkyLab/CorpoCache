const API = 'http://localhost:7071/api';

async function put(endpoint, data) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function post(endpoint, data) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function main() {
  // Add salary data
  const salaryData = {
    annualSalary: 95000,
    payFrequency: 26,
    filingStatus: 'single',
    stateTaxRate: 5.75,
    retirementPercent: 6,
    esppPercent: 10,
    healthAmount: 150,
    dentalAmount: 25,
    visionAmount: 10,
    fsaAmount: 100,
    bonusAmount: 8000,
    grossPay: 3653.85,
    netPay: 2456.32,
    federalTaxAmount: 485.50,
    federalTaxRate: 13.29,
    oasdiTaxAmount: 226.54,
    medicareTaxAmount: 52.98,
    stateTaxAmount: 210.10,
    totalTaxAmount: 975.12,
    retirementAmount: 219.23,
    esppAmountCalc: 365.38,
    insuranceTotal: 285,
    savingsTotal: 584.61,
    afterTaxBonus: 5200
  };

  console.log('Adding salary data...');
  await put('/salaryData', salaryData);
  console.log('Salary data added');

  // Add profit data
  const profitData = {
    monthlyIncome: 4912.64,
    monthlyBills: 3250.99,
    monthlySurplus: 1661.65,
    paycheck1Net: 2456.32,
    paycheck1Bills: 1850.99,
    paycheck1Surplus: 605.33,
    paycheck2Net: 2456.32,
    paycheck2Bills: 1400.00,
    paycheck2Surplus: 1056.32,
    hasThirdPaycheck: false,
    annualIncome: 58951.68,
    annualBonus: 5200,
    annualBills: 39011.88,
    annualSurplus: 19939.80,
    annualSurplusWithBonus: 25139.80,
    profitRatio: 33.82,
    payFrequency: 26
  };

  console.log('Adding profit data...');
  await put('/profitData', profitData);
  console.log('Profit data added');

  // Add expenses
  const expenses = [
    { name: 'Groceries', amount: 156.32, category: 'Food' },
    { name: 'Gas', amount: 45.00, category: 'Transportation' },
    { name: 'Coffee', amount: 24.50, category: 'Food' },
    { name: 'Amazon', amount: 89.99, category: 'Shopping' },
    { name: 'Uber Eats', amount: 38.75, category: 'Food' },
    { name: 'Target', amount: 67.23, category: 'Shopping' },
    { name: 'Spotify', amount: 10.99, category: 'Entertainment' },
    { name: 'Haircut', amount: 35.00, category: 'Personal' }
  ];

  console.log('Adding expenses...');
  for (const expense of expenses) {
    await post('/expenses', expense);
  }
  console.log('Expenses added');

  // Add historical data for past 6 months
  const now = new Date();
  console.log('Adding historical data...');

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const historicalEntry = {
      month: month,
      year: year,
      bills: [
        { name: 'Rent', amount: 1500, type: 'normal', dueDate: 1, isPaid: true },
        { name: 'Electric', amount: 95 + Math.floor(Math.random() * 50), type: 'normal', dueDate: 15, isPaid: true },
        { name: 'Internet', amount: 80, type: 'normal', dueDate: 10, isPaid: true },
        { name: 'Phone', amount: 85, type: 'normal', dueDate: 20, isPaid: true },
        { name: 'Car Insurance', amount: 145, type: 'normal', dueDate: 5, isPaid: true },
        { name: 'Netflix', amount: 15.99, type: 'normal', dueDate: 8, isPaid: true },
        { name: 'Gym', amount: 50, type: 'normal', dueDate: 1, isPaid: true },
        { name: 'Chase Freedom', amount: 200 + Math.floor(Math.random() * 300), type: 'credit', dueDate: 15, isPaid: true },
        { name: 'Amex Gold', amount: 350 + Math.floor(Math.random() * 400), type: 'credit', dueDate: 22, isPaid: true }
      ]
    };

    await post('/historicalData', historicalEntry);
    console.log('Historical data for ' + (month + 1) + '/' + year + ' added');
  }

  // Add another loan
  const studentLoan = {
    name: 'Student Loan',
    originalAmount: 35000,
    balance: 28500,
    interestRate: 4.5,
    dueDate: 28,
    type: 'student',
    term: 120
  };
  await post('/loans', studentLoan);
  console.log('Student loan added');

  console.log('\nAll test data added! Refresh your browser.');
}

main().catch(console.error);
