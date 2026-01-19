/**
 * CorpoCache API Client
 * Handles all communication with the Azure Functions backend
 */

const ApiClient = (function () {
  // Detect local development mode
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Use local Azure Functions URL in dev mode, otherwise use relative path
  const API_BASE = isLocalDev ? 'http://localhost:7071/api' : '/api';
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  // Track if we're in local dev mode (set after first API call)
  let localDevMode = false;

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

        // Handle 401 - redirect to login (skip in local dev mode)
        if (response.status === 401 && !isLocalDev) {
          window.location.href = '/.auth/login/github?post_login_redirect_uri=' + encodeURIComponent(window.location.pathname);
          throw new Error('Authentication required');
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }

        // Parse JSON response
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
      } catch (error) {
        lastError = error;

        // Don't retry on auth errors
        if (error.message === 'Authentication required') {
          throw error;
        }

        // Wait before retrying
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
    // In local dev mode, check if API is running and return mock auth
    if (isLocalDev) {
      try {
        const response = await fetch(`${API_BASE}/me`);
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            localDevMode = true;
            return {
              authenticated: true,
              user: {
                id: data.id,
                provider: data.provider || 'local',
                email: data.email || 'dev@localhost',
                roles: data.roles || ['authenticated'],
              },
            };
          }
        }
      } catch (e) {
        console.log('Local API not available, using localStorage mode');
      }
      return { authenticated: false };
    }

    // Production mode - use Azure Static Web Apps auth
    try {
      const response = await fetch('/.auth/me');
      const data = await response.json();
      if (data.clientPrincipal) {
        return {
          authenticated: true,
          user: {
            id: data.clientPrincipal.userId,
            provider: data.clientPrincipal.identityProvider,
            email: data.clientPrincipal.userDetails,
            roles: data.clientPrincipal.userRoles,
          },
        };
      }
      return { authenticated: false };
    } catch (error) {
      console.error('Failed to get auth status:', error);
      return { authenticated: false };
    }
  }

  function login(provider = 'github') {
    const redirectUri = encodeURIComponent(window.location.pathname);
    window.location.href = `/.auth/login/${provider}?post_login_redirect_uri=${redirectUri}`;
  }

  function logout() {
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/';
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
    login,
    logout,

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
