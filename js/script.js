// Data storage
let creditCards = [];
let bills = [];
let expenses = [];

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    initElements();
    
    // Load sample data
    loadSampleData();
    
    // Initial renders
    renderCreditCards();
    updateCreditSummary();
    renderBills();
    updatePaymentSchedule();
    renderExpenses();
    updateExpenseSummary();
    
    // Add cyber effects
    initCyberEffects();
});

function initElements() {
    window.creditCardsContainer = document.getElementById('creditCardsContainer');
    window.billsContainer = document.getElementById('billsContainer');
    window.expensesContainer = document.getElementById('expensesContainer');
    window.totalLimit = document.getElementById('totalLimit');
    window.totalBalance = document.getElementById('totalBalance');
    window.totalUtilization = document.getElementById('totalUtilization');
    window.paycheck1Bills = document.getElementById('paycheck1Bills');
    window.paycheck2Bills = document.getElementById('paycheck2Bills');
    window.paycheck1Total = document.getElementById('paycheck1Total');
    window.paycheck2Total = document.getElementById('paycheck2Total');
    window.totalBillsAmount = document.getElementById('totalBillsAmount');
    window.totalExpensesAmount = document.getElementById('totalExpensesAmount');
    window.totalOutgoings = document.getElementById('totalOutgoings');
    
    // Modal Elements
    window.creditCardModal = document.getElementById('creditCardModal');
    window.billModal = document.getElementById('billModal');
    window.expenseModal = document.getElementById('expenseModal');
    
    // Form Elements
    window.cardName = document.getElementById('cardName');
    window.creditLimit = document.getElementById('creditLimit');
    window.currentBalance = document.getElementById('currentBalance');
    window.creditAge = document.getElementById('creditAge');
    window.billName = document.getElementById('billName');
    window.billAmount = document.getElementById('billAmount');
    window.billDueDate = document.getElementById('billDueDate');
    window.billPriority = document.getElementById('billPriority');
    window.expenseName = document.getElementById('expenseName');
    window.expenseAmount = document.getElementById('expenseAmount');
    window.expenseCategory = document.getElementById('expenseCategory');
    
    // Salary Calculator Elements
    window.grossSalary = document.getElementById('grossSalary');
    window.payFrequency = document.getElementById('payFrequency');
    window.bonusPercentage = document.getElementById('bonusPercentage');
    window.taxRate = document.getElementById('taxRate');
    window.retirementContribution = document.getElementById('retirementContribution');
    window.esppContribution = document.getElementById('esppContribution');
    window.salaryResults = document.getElementById('salaryResults');
    
    // Savings Estimator Elements
    window.monthlyIncome = document.getElementById('monthlyIncome');
    window.savingsGoal = document.getElementById('savingsGoal');
    window.currentSavings = document.getElementById('currentSavings');
    window.savingsInterest = document.getElementById('savingsInterest');
    window.savingsResults = document.getElementById('savingsResults');
}

function initCyberEffects() {
    // Add glitch effect to titles
    const titles = document.querySelectorAll('h1, h2');
    titles.forEach(title => {
        title.classList.add('cyber-text-glow');
    });
    
    // Random neon flicker effect for certain elements
    setInterval(() => {
        const neonElements = document.querySelectorAll('.cyber-neon');
        neonElements.forEach(el => {
            if (Math.random() > 0.9) {
                el.style.opacity = '0.7';
                setTimeout(() => {
                    el.style.opacity = '1';
                }, 100);
            }
        });
    }, 2000);
}

// Modal Functions
window.addCreditCard = function() {
    cardName.value = '';
    creditLimit.value = '';
    currentBalance.value = '';
    creditAge.value = '';
    creditCardModal.classList.remove('hidden');
}

window.closeCreditCardModal = function() {
    creditCardModal.classList.add('hidden');
}

window.showAddBillModal = function() {
    billName.value = '';
    billAmount.value = '';
    billDueDate.value = '';
    billPriority.value = 'normal';
    billModal.classList.remove('hidden');
}

window.closeBillModal = function() {
    billModal.classList.add('hidden');
}

window.showAddExpenseModal = function() {
    expenseName.value = '';
    expenseAmount.value = '';
    expenseCategory.value = 'food';
    expenseModal.classList.remove('hidden');
}

window.closeExpenseModal = function() {
    expenseModal.classList.add('hidden');
}

// Credit Card Functions
window.saveCreditCard = function() {
    const card = {
        name: cardName.value,
        limit: parseFloat(creditLimit.value),
        balance: parseFloat(currentBalance.value),
        age: parseInt(creditAge.value)
    };
    
    creditCards.push(card);
    renderCreditCards();
    updateCreditSummary();
    closeCreditCardModal();
}

function renderCreditCards() {
    if (creditCards.length === 0) {
        creditCardsContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No credit cards added yet</p>';
        return;
    }
    
    let html = '';
    creditCards.forEach((card, index) => {
        const utilization = (card.balance / card.limit) * 100;
        const payTo29 = (card.limit * 0.29) - card.balance;
        const payTo9 = (card.limit * 0.09) - card.balance;
        
        const utilizationColorClass = utilization > 30 ? 'cyber-pink' : utilization > 10 ? 'cyber-yellow' : 'cyber-green';
        
        html += `
            <div class="border cyber-border rounded-lg p-4 mb-4 cyber-card">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium text-lg cyber-neon">${card.name}</h3>
                        <p class="text-sm text-gray-400">${card.age} months old</p>
                    </div>
                    <button onclick="deleteCreditCard(${index})" class="text-neon-pink hover:text-neon-purple">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Credit Limit</p>
                        <p class="font-medium">$${card.limit.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Current Balance</p>
                        <p class="font-medium">$${card.balance.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="mt-4">
                    <p class="text-sm text-gray-400">Credit Utilization</p>
                    <div class="flex items-center">
                        <div class="cyber-progress-bar flex-1 mr-2">
                            <div class="cyber-progress-fill ${utilizationColorClass}" 
                                 style="width: ${Math.min(100, utilization)}%"></div>
                        </div>
                        <span class="font-medium">${utilization.toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Pay to 29% utilization</p>
                        <p class="font-medium ${payTo29 < 0 ? 'text-neon-pink' : 'text-neon-green'}">
                            $${Math.abs(payTo29).toFixed(2)} ${payTo29 < 0 ? 'over' : 'needed'}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Pay to 9% utilization</p>
                        <p class="font-medium ${payTo9 < 0 ? 'text-neon-pink' : 'text-neon-green'}">
                            $${Math.abs(payTo9).toFixed(2)} ${payTo9 < 0 ? 'over' : 'needed'}
                        </p>
                    </div>
                </div>
            </div>
        `;
    });
    
    creditCardsContainer.innerHTML = html;
}

window.deleteCreditCard = function(index) {
    creditCards.splice(index, 1);
    renderCreditCards();
    updateCreditSummary();
}

function updateCreditSummary() {
    const totalLimitValue = creditCards.reduce((sum, card) => sum + card.limit, 0);
    const totalBalanceValue = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const totalUtilizationValue = totalLimitValue > 0 ? (totalBalanceValue / totalLimitValue) * 100 : 0;
    
    totalLimit.textContent = `$${totalLimitValue.toFixed(2)}`;
    totalBalance.textContent = `$${totalBalanceValue.toFixed(2)}`;
    totalUtilization.textContent = `${totalUtilizationValue.toFixed(1)}%`;
    
    // Calculate amount needed to reach 29% and 9% utilization
    const payTo29 = document.getElementById('payTo29');
    const payTo9 = document.getElementById('payTo9');
    
    if (totalLimitValue > 0) {
        const target29 = totalLimitValue * 0.29;
        const target9 = totalLimitValue * 0.09;
        const amountTo29 = totalBalanceValue - target29;
        const amountTo9 = totalBalanceValue - target9;
        
        if (amountTo29 <= 0) {
            payTo29.innerHTML = `<span class="text-neon-green">$0</span> <span class="text-gray-400 text-sm">(Under target)</span>`;
        } else {
            payTo29.innerHTML = `<span class="text-neon-green">$${amountTo29.toFixed(2)}</span> <span class="text-gray-400 text-sm">needed</span>`;
        }
        
        if (amountTo9 <= 0) {
            payTo9.innerHTML = `<span class="text-neon-blue">$0</span> <span class="text-gray-400 text-sm">(Under target)</span>`;
        } else {
            payTo9.innerHTML = `<span class="text-neon-blue">$${amountTo9.toFixed(2)}</span> <span class="text-gray-400 text-sm">needed</span>`;
        }
    } else {
        payTo29.innerHTML = `<span class="text-neon-green">$0</span>`;
        payTo9.innerHTML = `<span class="text-neon-blue">$0</span>`;
    }
}

// Bill Functions
window.saveBill = function() {
    const bill = {
        name: billName.value,
        amount: parseFloat(billAmount.value),
        dueDate: parseInt(billDueDate.value),
        priority: billPriority.value
    };
    
    bills.push(bill);
    renderBills();
    updatePaymentSchedule();
    updateExpenseSummary();
    closeBillModal();
}

function renderBills() {
    if (bills.length === 0) {
        billsContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No bills added yet</p>';
        return;
    }
    
    // Sort bills by due date
    bills.sort((a, b) => a.dueDate - b.dueDate);
    
    let html = '';
    bills.forEach((bill, index) => {
        const priorityColor = bill.priority === 'high' ? 'bg-glass-blue border-neon-pink' : 
                            bill.priority === 'low' ? 'bg-glass-blue border-neon-blue' : 'bg-glass-purple border-neon-purple';
        const priorityIcon = bill.priority === 'high' ? 'fa-exclamation-circle text-neon-pink' : 
                           bill.priority === 'low' ? 'fa-info-circle text-neon-blue' : 'fa-check-circle text-neon-purple';
        
        html += `
            <div class="border cyber-border rounded-lg p-4 mb-3 cyber-card">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-medium cyber-neon">${bill.name}</h3>
                        <p class="text-sm text-gray-400">Due on ${bill.dueDate}th</p>
                    </div>
                    <div class="flex items-center">
                        <span class="font-medium mr-4">$${bill.amount.toFixed(2)}</span>
                        <i class="fas ${priorityIcon} mr-2 cyber-neon"></i>
                        <button onclick="deleteBill(${index})" class="text-gray-400 hover:text-neon-pink">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    billsContainer.innerHTML = html;
}

window.deleteBill = function(index) {
    bills.splice(index, 1);
    renderBills();
    updatePaymentSchedule();
    updateExpenseSummary();
}

function updatePaymentSchedule() {
    // Split bills between two paychecks (15th and end of month)
    const paycheck1 = bills.filter(bill => bill.dueDate <= 15);
    const paycheck2 = bills.filter(bill => bill.dueDate > 15);
    
    const paycheck1TotalAmount = paycheck1.reduce((sum, bill) => sum + bill.amount, 0);
    const paycheck2TotalAmount = paycheck2.reduce((sum, bill) => sum + bill.amount, 0);
    
    paycheck1Bills.textContent = paycheck1.length > 0 ? 
        paycheck1.map(bill => bill.name).join(', ') : 'No bills scheduled';
    paycheck2Bills.textContent = paycheck2.length > 0 ? 
        paycheck2.map(bill => bill.name).join(', ') : 'No bills scheduled';
        
    paycheck1Total.textContent = `Total: $${paycheck1TotalAmount.toFixed(2)}`;
    paycheck2Total.textContent = `Total: $${paycheck2TotalAmount.toFixed(2)}`;
    
    // Update total bills amount
    const totalBills = paycheck1TotalAmount + paycheck2TotalAmount;
    totalBillsAmount.textContent = `$${totalBills.toFixed(2)}`;
    updateExpenseSummary();
}

// Expense Functions
window.saveExpense = function() {
    const expense = {
        name: expenseName.value,
        amount: parseFloat(expenseAmount.value),
        category: expenseCategory.value
    };
    
    expenses.push(expense);
    renderExpenses();
    updateExpenseSummary();
    closeExpenseModal();
}

function renderExpenses() {
    if (expenses.length === 0) {
        expensesContainer.innerHTML = '<p class="text-gray-400 text-center py-2">No expenses added yet</p>';
        return;
    }
    
    // Group expenses by category
    const categories = {};
    expenses.forEach((expense, index) => {
        if (!categories[expense.category]) {
            categories[expense.category] = [];
        }
        categories[expense.category].push({...expense, index});
    });
    
    let html = '';
    for (const [category, categoryExpenses] of Object.entries(categories)) {
        const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const categoryIcon = getCategoryIcon(category);
        
        html += `
            <div class="mb-4">
                <div class="flex items-center mb-2">
                    <i class="fas ${categoryIcon} mr-2 text-neon-blue"></i>
                    <h4 class="font-medium capitalize cyber-neon">${category}</h4>
                    <span class="ml-auto font-medium">$${categoryTotal.toFixed(2)}</span>
                </div>
                
                <div class="ml-6 space-y-2">
                    ${categoryExpenses.map(expense => `
                        <div class="flex items-center justify-between">
                            <span>${expense.name}</span>
                            <div class="flex items-center">
                                <span class="mr-3">$${expense.amount.toFixed(2)}</span>
                                <button onclick="deleteExpense(${expense.index})" class="text-gray-400 hover:text-neon-pink">
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    expensesContainer.innerHTML = html;
}

function getCategoryIcon(category) {
    const icons = {
        'food': 'fa-utensils',
        'entertainment': 'fa-film',
        'transportation': 'fa-car',
        'shopping': 'fa-shopping-bag',
        'health': 'fa-heartbeat',
        'other': 'fa-coins'
    };
    return icons[category] || 'fa-coins';
}

window.deleteExpense = function(index) {
    expenses.splice(index, 1);
    renderExpenses();
    updateExpenseSummary();
}

function updateExpenseSummary() {
    const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const total = totalBills + totalExpenses;
    
    totalBillsAmount.textContent = `$${totalBills.toFixed(2)}`;
    totalExpensesAmount.textContent = `$${totalExpenses.toFixed(2)}`;
    totalOutgoings.textContent = `$${total.toFixed(2)}`;
}

// Salary Calculator Functions
window.calculateSalary = function() {
    const gross = parseFloat(grossSalary.value);
    const periods = parseInt(payFrequency.value);
    const bonusPct = parseFloat(bonusPercentage.value);
    const taxPct = parseFloat(taxRate.value);
    const retirementPct = parseFloat(retirementContribution.value);
    const esppPct = parseFloat(esppContribution.value);
    
    if (isNaN(gross) || gross <= 0) {
        alert('Please enter a valid gross salary');
        return;
    }
    
    const grossPerPeriod = gross / periods;
    const taxAmount = grossPerPeriod * (taxPct / 100);
    const retirementAmount = grossPerPeriod * (retirementPct / 100);
    const esppAmount = grossPerPeriod * (esppPct / 100);
    const netPay = grossPerPeriod - taxAmount - retirementAmount - esppAmount;
    const bonusAmount = gross * (bonusPct / 100);
    
    document.getElementById('grossPay').textContent = `$${grossPerPeriod.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('retirementAmount').textContent = `$${retirementAmount.toFixed(2)}`;
    document.getElementById('esppAmount').textContent = `$${esppAmount.toFixed(2)}`;
    document.getElementById('netPay').textContent = `$${netPay.toFixed(2)}`;
    document.getElementById('bonusAmount').textContent = `$${bonusAmount.toFixed(2)}`;
    
    salaryResults.classList.remove('hidden');
    
    // Update monthly income in savings estimator if empty
    if (!monthlyIncome.value && netPay > 0) {
        monthlyIncome.value = (netPay * periods / 12).toFixed(2);
    }
}

// Savings Estimator Functions
window.calculateSavings = function() {
    const income = parseFloat(monthlyIncome.value);
    const goalPct = parseFloat(savingsGoal.value);
    const current = parseFloat(currentSavings.value) || 0;
    const interestRate = parseFloat(savingsInterest.value) / 100;
    
    if (isNaN(income) || income <= 0) {
        alert('Please enter a valid monthly income');
        return;
    }
    
    if (isNaN(goalPct) || goalPct < 0 || goalPct > 100) {
        alert('Please enter a valid savings goal percentage (0-100)');
        return;
    }
    
    const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalOutgoings = totalBills + totalExpenses;
    const disposableIncome = income - totalOutgoings;
    
    const monthlySavings = Math.min(disposableIncome, income * (goalPct / 100));
    const year1Savings = monthlySavings * 12;
    const year5Savings = monthlySavings * 60;
    
    // Calculate future value with compound interest
    const futureValue = (pv, rate, nper, pmt) => {
        return pv * Math.pow(1 + rate/12, nper) + pmt * (Math.pow(1 + rate/12, nper) - 1) / (rate/12);
    };
    
    const totalWithInterest = futureValue(current, interestRate, 60, monthlySavings);
    
    document.getElementById('monthlyNetIncome').textContent = `$${income.toFixed(2)}`;
    document.getElementById('monthlyOutgoings').textContent = `$${totalOutgoings.toFixed(2)}`;
    document.getElementById('disposableIncome').textContent = `$${disposableIncome.toFixed(2)}`;
    document.getElementById('monthlySavings').textContent = `$${monthlySavings.toFixed(2)}`;
    document.getElementById('year1Savings').textContent = `$${year1Savings.toFixed(2)}`;
    document.getElementById('year5Savings').textContent = `$${year5Savings.toFixed(2)}`;
    document.getElementById('totalWithInterest').textContent = `$${totalWithInterest.toFixed(2)}`;
    
    // Update progress bar
    const progressBar = document.getElementById('savingsProgress');
    const progressText = document.getElementById('savingsStatus');
    
    if (current > 0 && monthlySavings > 0) {
        const progressPct = Math.min(100, (current / (monthlySavings * 12)) * 100);
        progressBar.style.width = `${progressPct}%`;
        progressText.textContent = `${progressPct.toFixed(1)}% of annual goal achieved`;
    } else {
        progressBar.style.width = '0%';
        progressText.textContent = '0% of monthly goal achieved';
    }
    
    savingsResults.classList.remove('hidden');
}

function loadSampleData() {
    // Load sample data for demo
    creditCards = [
        { name: "Cyber Security", limit: 10000, balance: 3500, age: 24 },
        { name: "Digital Wave", limit: 15000, balance: 1200, age: 36 }
    ];
    
    bills = [
        { name: "Neural Rent", amount: 1200, dueDate: 1, priority: "high" },
        { name: "Augmentation Payment", amount: 350, dueDate: 15, priority: "normal" },
        { name: "Net Connection", amount: 75, dueDate: 20, priority: "low" },
        { name: "Grid Power", amount: 120, dueDate: 10, priority: "normal" }
    ];
    
    expenses = [
        { name: "Synthetic Food", amount: 400, category: "food" },
        { name: "Street Eats", amount: 200, category: "food" },
        { name: "Virtual Reality", amount: 50, category: "entertainment" },
        { name: "Body Mods", amount: 30, category: "health" },
        { name: "Transit Fuel", amount: 150, category: "transportation" }
    ];
}