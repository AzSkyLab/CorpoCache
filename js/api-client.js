/**
 * CorpoCache API Client
 * Handles all communication with the Express backend
 */

const ApiClient = (function () {
  const API_BASE = '/api';
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  /**
   * Make an HTTP request with retry logic
   */
  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, config);

        if (response.status === 401) {
          console.error('Unexpected 401 from API');
          throw new Error('Authentication error');
        }

        if (response.status === 204) {
          return null;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
      } catch (error) {
        lastError = error;

        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * (attempt + 1))
          );
        }
      }
    }

    console.error('API request failed after retries:', lastError);
    throw lastError;
  }

  // ============ Authentication ============

  async function getAuthStatus() {
    try {
      const response = await fetch(`${API_BASE}/me`);
      if (response.ok) {
        const data = await response.json();
        if (data.id) {
          return {
            authenticated: true,
            user: {
              id: data.id,
              provider: data.provider || 'local',
              email: data.email || 'user@home.lab',
              roles: data.roles || ['authenticated'],
            },
          };
        }
      }
    } catch (e) {
      console.log('API not available');
    }
    return { authenticated: false };
  }

  // ============ Credit Cards ============

  async function getCreditCards() {
    return request('/creditCards');
  }

  async function createCreditCard(card) {
    return request('/creditCards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  }

  async function updateCreditCard(id, card) {
    return request(`/creditCards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(card),
    });
  }

  async function deleteCreditCard(id) {
    return request(`/creditCards/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Bills ============

  async function getBills() {
    return request('/bills');
  }

  async function createBill(bill) {
    return request('/bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    });
  }

  async function updateBill(id, bill) {
    return request(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bill),
    });
  }

  async function deleteBill(id) {
    return request(`/bills/${id}`, {
      method: 'DELETE',
    });
  }

  async function toggleBillPaid(id) {
    return request(`/bills/${id}/paid`, {
      method: 'PUT',
    });
  }

  async function resetAllBillsPaid() {
    return request('/bills/resetPaid', {
      method: 'PUT',
    });
  }

  // ============ Loans ============

  async function getLoans() {
    return request('/loans');
  }

  async function createLoan(loan) {
    return request('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    });
  }

  async function updateLoan(id, loan) {
    return request(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loan),
    });
  }

  async function deleteLoan(id) {
    return request(`/loans/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Expenses ============

  async function getExpenses() {
    return request('/expenses');
  }

  async function createExpense(expense) {
    return request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async function deleteExpense(id) {
    return request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async function clearAllExpenses() {
    return request('/expenses/all', {
      method: 'DELETE',
    });
  }

  // ============ Salary Data ============

  async function getSalaryData() {
    return request('/salaryData');
  }

  async function saveSalaryData(data) {
    return request('/salaryData', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ Profit Data ============

  async function getProfitData() {
    return request('/profitData');
  }

  async function saveProfitData(data) {
    return request('/profitData', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ Historical Data ============

  async function getHistoricalData() {
    return request('/historicalData');
  }

  async function createHistoricalSnapshot(data) {
    return request('/historicalData', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async function deleteHistoricalSnapshot(id) {
    return request(`/historicalData/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ User Data ============

  async function getUserData() {
    return request('/userData');
  }

  async function saveUserData(data) {
    return request('/userData', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ Sync (Migration) ============

  async function syncAllData(data) {
    return request('/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Fetch All Data ============

  async function fetchAllData() {
    try {
      const [
        creditCards,
        bills,
        loans,
        expenses,
        salaryData,
        profitData,
        historicalData,
        userData,
      ] = await Promise.all([
        getCreditCards(),
        getBills(),
        getLoans(),
        getExpenses(),
        getSalaryData(),
        getProfitData(),
        getHistoricalData(),
        getUserData(),
      ]);

      return {
        creditCards: creditCards || [],
        bills: bills || [],
        loans: loans || [],
        expenses: expenses || [],
        salaryData: salaryData || {},
        profitData: profitData || {},
        historicalBillData: historicalData || [],
        currentAppMonth: userData?.currentAppMonth ?? new Date().getMonth(),
        currentAppYear: userData?.currentAppYear ?? new Date().getFullYear(),
      };
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      throw error;
    }
  }

  // Public API
  return {
    // Auth
    getAuthStatus,

    // Credit Cards
    getCreditCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,

    // Bills
    getBills,
    createBill,
    updateBill,
    deleteBill,
    toggleBillPaid,
    resetAllBillsPaid,

    // Loans
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,

    // Expenses
    getExpenses,
    createExpense,
    deleteExpense,
    clearAllExpenses,

    // Salary Data
    getSalaryData,
    saveSalaryData,

    // Profit Data
    getProfitData,
    saveProfitData,

    // Historical Data
    getHistoricalData,
    createHistoricalSnapshot,
    deleteHistoricalSnapshot,

    // User Data
    getUserData,
    saveUserData,

    // Sync
    syncAllData,
    fetchAllData,
  };
})();

// Make it globally available
window.ApiClient = ApiClient;
