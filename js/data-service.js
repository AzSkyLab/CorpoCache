/**
 * CorpoCache Data Service
 * Abstraction layer that supports both localStorage (local mode) and API (cloud mode)
 * Maintains backward compatibility with existing global variables
 */

const DataService = (function () {
  // Storage mode: 'local' or 'api'
  let mode = 'api';
  let isInitialized = false;
  let isAuthenticated = false;
  let currentUser = null;

  // Local cache for API mode
  let cache = {
    creditCards: [],
    bills: [],
    loans: [],
    expenses: [],
    salaryData: {},
    profitData: {},
    historicalBillData: [],
    currentAppMonth: new Date().getMonth(),
    currentAppYear: new Date().getFullYear(),
  };

  // ID mapping for bills that reference credit cards
  let creditCardIdMap = new Map();
  let creditCardIndexMap = new Map();

  /**
   * Initialize the data service
   */
  async function init() {
    if (isInitialized) {
      return;
    }

    try {
      // Check authentication status
      const authStatus = await ApiClient.getAuthStatus();
      isAuthenticated = authStatus.authenticated;
      currentUser = authStatus.user;

      if (isAuthenticated) {
        try {
          const data = await ApiClient.fetchAllData();
          mode = 'api';
          syncToGlobals(data);
          buildCreditCardMaps();
          console.log('DataService: Initialized in API mode');
        } catch (apiError) {
          console.warn('DataService: API fetch failed, falling back to local mode', apiError);
          mode = 'local';
          loadFromLocalStorage();
        }
      } else {
        // API not reachable - use local storage as fallback
        mode = 'local';
        loadFromLocalStorage();
        console.log('DataService: Initialized in local mode (API unreachable)');
      }

      isInitialized = true;
      return { mode, isAuthenticated, currentUser };
    } catch (error) {
      console.error('DataService: Initialization error', error);
      mode = 'local';
      loadFromLocalStorage();
      isInitialized = true;
      return { mode, isAuthenticated: false, currentUser: null };
    }
  }

  /**
   * Load data from localStorage (fallback mode)
   */
  function loadFromLocalStorage() {
    try {
      cache.creditCards = JSON.parse(localStorage.getItem('creditCards') || '[]');
      cache.bills = JSON.parse(localStorage.getItem('bills') || '[]');
      cache.loans = JSON.parse(localStorage.getItem('loans') || '[]');
      cache.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      cache.salaryData = JSON.parse(localStorage.getItem('salaryData') || '{}');
      cache.profitData = JSON.parse(localStorage.getItem('profitData') || '{}');
      cache.historicalBillData = JSON.parse(localStorage.getItem('historicalBillData') || '[]');
      cache.currentAppMonth = parseInt(localStorage.getItem('currentAppMonth') || new Date().getMonth());
      cache.currentAppYear = parseInt(localStorage.getItem('currentAppYear') || new Date().getFullYear());
      syncToGlobals(cache);
    } catch (error) {
      console.error('DataService: Error loading from localStorage', error);
    }
  }

  /**
   * Sync cache/data to global variables for backward compatibility
   */
  function syncToGlobals(data) {
    // PostgreSQL DECIMAL columns return strings - coerce to numbers
    window.creditCards = (data.creditCards || []).map((c) => ({
      ...c,
      limit: Number(c.limit),
      balance: Number(c.balance),
      dueDate: Number(c.dueDate),
    }));
    window.bills = (data.bills || []).map((b) => ({
      ...b,
      amount: Number(b.amount),
      dueDate: Number(b.dueDate),
    }));
    window.loans = (data.loans || []).map((l) => ({
      ...l,
      originalAmount: Number(l.originalAmount),
      balance: Number(l.balance),
      interestRate: Number(l.interestRate),
      dueDate: Number(l.dueDate),
      term: l.term != null ? Number(l.term) : null,
      additionalPrincipal: Number(l.additionalPrincipal || 0),
      pmi: Number(l.pmi || 0),
      propertyTax: Number(l.propertyTax || 0),
      propertyInsurance: Number(l.propertyInsurance || 0),
    }));
    window.expenses = (data.expenses || []).map((e) => ({
      ...e,
      amount: Number(e.amount),
    }));
    window.salaryData = data.salaryData || {};
    window.profitData = data.profitData || {};
    window.historicalBillData = data.historicalBillData || [];
    window.currentAppMonth = data.currentAppMonth;
    window.currentAppYear = data.currentAppYear;
    Object.assign(cache, {
      ...data,
      creditCards: window.creditCards,
      bills: window.bills,
      loans: window.loans,
      expenses: window.expenses,
    });
  }

  /**
   * Build credit card ID maps for bill references
   */
  function buildCreditCardMaps() {
    creditCardIdMap.clear();
    creditCardIndexMap.clear();
    cache.creditCards.forEach((card, index) => {
      if (card.id) {
        creditCardIdMap.set(index, card.id);
        creditCardIndexMap.set(card.id, index);
      }
    });
  }

  /**
   * Save all data (called after any modification)
   */
  async function save() {
    if (mode === 'local') {
      saveToLocalStorage();
    }
  }

  /**
   * Save to localStorage (fallback)
   */
  function saveToLocalStorage() {
    try {
      localStorage.setItem('creditCards', JSON.stringify(window.creditCards));
      localStorage.setItem('bills', JSON.stringify(window.bills));
      localStorage.setItem('loans', JSON.stringify(window.loans));
      localStorage.setItem('expenses', JSON.stringify(window.expenses));
      localStorage.setItem('salaryData', JSON.stringify(window.salaryData));
      localStorage.setItem('profitData', JSON.stringify(window.profitData));
      localStorage.setItem('historicalBillData', JSON.stringify(window.historicalBillData));
      localStorage.setItem('currentAppMonth', window.currentAppMonth);
      localStorage.setItem('currentAppYear', window.currentAppYear);
      localStorage.setItem('lastSaved', new Date().toISOString());
    } catch (error) {
      console.error('DataService: Error saving to localStorage', error);
    }
  }

  // ============ Credit Card Operations ============

  async function saveCreditCard(cardData, index = -1) {
    if (mode === 'local') {
      if (index >= 0 && index < window.creditCards.length) {
        window.creditCards[index] = cardData;
      } else {
        window.creditCards.push(cardData);
      }
      saveToLocalStorage();
      return cardData;
    }

    if (index >= 0 && cache.creditCards[index]?.id) {
      const id = cache.creditCards[index].id;
      const updated = await ApiClient.updateCreditCard(id, cardData);
      cache.creditCards[index] = updated;
      window.creditCards[index] = updated;
      return updated;
    } else {
      const created = await ApiClient.createCreditCard(cardData);
      cache.creditCards.push(created);
      window.creditCards.push(created);
      buildCreditCardMaps();
      return created;
    }
  }

  async function deleteCreditCard(index) {
    if (mode === 'local') {
      window.creditCards.splice(index, 1);
      saveToLocalStorage();
      return true;
    }

    const card = cache.creditCards[index];
    if (card?.id) {
      await ApiClient.deleteCreditCard(card.id);
      cache.creditCards.splice(index, 1);
      window.creditCards.splice(index, 1);
      buildCreditCardMaps();
    }
    return true;
  }

  // ============ Bill Operations ============

  async function saveBill(billData, index = -1) {
    if (mode === 'local') {
      if (index >= 0 && index < window.bills.length) {
        window.bills[index] = billData;
      } else {
        window.bills.push(billData);
      }
      saveToLocalStorage();
      return billData;
    }

    const apiData = { ...billData };
    if (billData.creditCardId !== undefined && billData.creditCardId !== null && billData.creditCardId >= 0) {
      apiData.creditCardId = creditCardIdMap.get(billData.creditCardId) || null;
    }

    if (index >= 0 && cache.bills[index]?.id) {
      const id = cache.bills[index].id;
      const updated = await ApiClient.updateBill(id, apiData);
      if (updated.creditCardId) {
        updated.creditCardId = creditCardIndexMap.get(updated.creditCardId);
      }
      cache.bills[index] = updated;
      window.bills[index] = updated;
      return updated;
    } else {
      const created = await ApiClient.createBill(apiData);
      if (created.creditCardId) {
        created.creditCardId = creditCardIndexMap.get(created.creditCardId);
      }
      cache.bills.push(created);
      window.bills.push(created);
      return created;
    }
  }

  async function deleteBill(index) {
    if (mode === 'local') {
      window.bills.splice(index, 1);
      saveToLocalStorage();
      return true;
    }

    const bill = cache.bills[index];
    if (bill?.id) {
      await ApiClient.deleteBill(bill.id);
      cache.bills.splice(index, 1);
      window.bills.splice(index, 1);
    }
    return true;
  }

  async function toggleBillPaid(index) {
    if (mode === 'local') {
      window.bills[index].isPaid = !window.bills[index].isPaid;
      saveToLocalStorage();
      return window.bills[index];
    }

    const bill = cache.bills[index];
    if (bill?.id) {
      const result = await ApiClient.toggleBillPaid(bill.id);
      cache.bills[index].isPaid = result.isPaid;
      window.bills[index].isPaid = result.isPaid;
      return window.bills[index];
    }
    return null;
  }

  async function resetAllBillsPaid() {
    if (mode === 'local') {
      window.bills.forEach((bill) => (bill.isPaid = false));
      saveToLocalStorage();
      return true;
    }

    await ApiClient.resetAllBillsPaid();
    cache.bills.forEach((bill) => (bill.isPaid = false));
    window.bills.forEach((bill) => (bill.isPaid = false));
    return true;
  }

  // ============ Loan Operations ============

  async function saveLoan(loanData, index = -1) {
    if (mode === 'local') {
      if (index >= 0 && index < window.loans.length) {
        window.loans[index] = loanData;
      } else {
        window.loans.push(loanData);
      }
      saveToLocalStorage();
      return loanData;
    }

    if (index >= 0 && cache.loans[index]?.id) {
      const id = cache.loans[index].id;
      const updated = await ApiClient.updateLoan(id, loanData);
      cache.loans[index] = updated;
      window.loans[index] = updated;
      return updated;
    } else {
      const created = await ApiClient.createLoan(loanData);
      cache.loans.push(created);
      window.loans.push(created);
      return created;
    }
  }

  async function deleteLoan(index) {
    if (mode === 'local') {
      window.loans.splice(index, 1);
      saveToLocalStorage();
      return true;
    }

    const loan = cache.loans[index];
    if (loan?.id) {
      await ApiClient.deleteLoan(loan.id);
      cache.loans.splice(index, 1);
      window.loans.splice(index, 1);
    }
    return true;
  }

  // ============ Expense Operations ============

  async function saveExpense(expenseData) {
    if (mode === 'local') {
      window.expenses.push(expenseData);
      saveToLocalStorage();
      return expenseData;
    }

    const created = await ApiClient.createExpense(expenseData);
    cache.expenses.push(created);
    window.expenses.push(created);
    return created;
  }

  async function deleteExpense(index) {
    if (mode === 'local') {
      window.expenses.splice(index, 1);
      saveToLocalStorage();
      return true;
    }

    const expense = cache.expenses[index];
    if (expense?.id) {
      await ApiClient.deleteExpense(expense.id);
      cache.expenses.splice(index, 1);
      window.expenses.splice(index, 1);
    }
    return true;
  }

  async function clearAllExpenses() {
    if (mode === 'local') {
      window.expenses = [];
      saveToLocalStorage();
      return true;
    }

    await ApiClient.clearAllExpenses();
    cache.expenses = [];
    window.expenses = [];
    return true;
  }

  // ============ Salary/Profit Data Operations ============

  async function saveSalaryData(data) {
    window.salaryData = data;
    if (mode === 'local') {
      saveToLocalStorage();
      return data;
    }
    const numericData = convertSalaryDataToNumeric(data);
    await ApiClient.saveSalaryData(numericData);
    cache.salaryData = data;
    return data;
  }

  async function saveProfitData(data) {
    window.profitData = data;
    if (mode === 'local') {
      saveToLocalStorage();
      return data;
    }
    const numericData = convertProfitDataToNumeric(data);
    await ApiClient.saveProfitData(numericData);
    cache.profitData = data;
    return data;
  }

  function convertSalaryDataToNumeric(data) {
    return {
      annualSalary: parseNumeric(data.gross || data.annualSalary),
      payFrequency: data.payFrequency,
      filingStatus: data.filingStatus,
      stateTaxRate: parseNumeric(data.stateRate),
      grossPay: parseNumeric(data.grossPay),
      netPay: parseNumeric(data.netPay),
      federalTaxAmount: parseNumeric(data.federalTaxAmount),
      federalTaxRate: parseNumeric(data.federalTaxRate),
      oasdiTaxAmount: parseNumeric(data.oasdiTaxAmount),
      medicareTaxAmount: parseNumeric(data.medicareTaxAmount),
      stateTaxAmount: parseNumeric(data.stateTaxAmount),
      totalTaxAmount: parseNumeric(data.taxAmount),
      retirementAmount: parseNumeric(data.retirementAmount),
      esppAmountCalc: parseNumeric(data.esppAmount),
      insuranceTotal: parseNumeric(data.insuranceTotal),
      savingsTotal: parseNumeric(data.savingsTotal),
      afterTaxBonus: parseNumeric(data.afterTaxBonusAmount),
      bonusAmount: parseNumeric(data.bonusAmount),
      healthAmount: parseNumeric(data.healthAmount),
      dentalAmount: parseNumeric(data.dentalAmount),
      visionAmount: parseNumeric(data.visionAmount),
      fsaAmount: parseNumeric(data.fsaAmount),
      lastPayDate: data.lastPayDate,
      firstPayDate: data.firstPayDate,
    };
  }

  function convertProfitDataToNumeric(data) {
    return {
      monthlyIncome: parseNumeric(data.gpMonthlyIncome),
      monthlyBills: parseNumeric(data.gpMonthlyBills),
      monthlySurplus: parseNumeric(data.gpMonthlySurplus),
      paycheck1Net: parseNumeric(data.gpPaycheck1Net),
      paycheck1Bills: parseNumeric(data.gpPaycheck1Bills),
      paycheck1Surplus: parseNumeric(data.gpPaycheck1Surplus),
      paycheck2Net: parseNumeric(data.gpPaycheck2Net),
      paycheck2Bills: parseNumeric(data.gpPaycheck2Bills),
      paycheck2Surplus: parseNumeric(data.gpPaycheck2Surplus),
      paycheck3Net: parseNumeric(data.gpPaycheck3Net),
      paycheck3Bills: parseNumeric(data.gpPaycheck3Bills),
      paycheck3Surplus: parseNumeric(data.gpPaycheck3Surplus),
      hasThirdPaycheck: data.hasThirdPaycheckInSameMonth,
      annualIncome: parseNumeric(data.gpAnnualIncome),
      annualBonus: parseNumeric(data.gpAnnualBonus),
      annualBills: parseNumeric(data.gpAnnualBills),
      annualSurplus: parseNumeric(data.gpAnnualSurplus),
      annualSurplusWithBonus: parseNumeric(data.gpAnnualSurplusWithBonus),
      profitRatio: data.profitRatio,
      payFrequency: data.payFrequency,
    };
  }

  function parseNumeric(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,()%\s]/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        const isNegative = value.includes('-') || value.startsWith('(');
        return isNegative ? -Math.abs(num) : num;
      }
    }
    return null;
  }

  // ============ Historical Data Operations ============

  async function saveHistoricalSnapshot(data) {
    if (mode === 'local') {
      window.historicalBillData.push(data);
      saveToLocalStorage();
      return data;
    }
    const created = await ApiClient.createHistoricalSnapshot(data);
    cache.historicalBillData.push(created);
    window.historicalBillData.push(created);
    return created;
  }

  // ============ User Data Operations ============

  async function saveAppState(month, year) {
    window.currentAppMonth = month;
    window.currentAppYear = year;
    if (mode === 'local') {
      saveToLocalStorage();
      return { currentAppMonth: month, currentAppYear: year };
    }
    await ApiClient.saveUserData({ currentAppMonth: month, currentAppYear: year });
    cache.currentAppMonth = month;
    cache.currentAppYear = year;
    return { currentAppMonth: month, currentAppYear: year };
  }

  // ============ Utility ============

  function getMode() { return mode; }
  function isUserAuthenticated() { return isAuthenticated; }
  function getUser() { return currentUser; }

  // Public API
  return {
    init,
    getMode,
    isUserAuthenticated,
    getUser,
    save,

    // Credit Cards
    saveCreditCard,
    deleteCreditCard,

    // Bills
    saveBill,
    deleteBill,
    toggleBillPaid,
    resetAllBillsPaid,

    // Loans
    saveLoan,
    deleteLoan,

    // Expenses
    saveExpense,
    deleteExpense,
    clearAllExpenses,

    // Salary/Profit
    saveSalaryData,
    saveProfitData,

    // Historical
    saveHistoricalSnapshot,

    // App State
    saveAppState,
  };
})();

// Make it globally available
window.DataService = DataService;
