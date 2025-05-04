// Global Tax Bracket Data (2025 projected brackets)
const taxBrackets2025 = {
    single: [
        { min: 0, max: 11600, rate: 10 },
        { min: 11600, max: 47150, rate: 12 },
        { min: 47150, max: 100525, rate: 22 },
        { min: 100525, max: 191950, rate: 24 },
        { min: 191950, max: 243725, rate: 32 },
        { min: 243725, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 }
    ],
    married: [
        { min: 0, max: 23200, rate: 10 },
        { min: 23200, max: 94300, rate: 12 },
        { min: 94300, max: 201050, rate: 22 },
        { min: 201050, max: 383900, rate: 24 },
        { min: 383900, max: 487450, rate: 32 },
        { min: 487450, max: 731200, rate: 35 },
        { min: 731200, max: Infinity, rate: 37 }
    ],
    head: [
        { min: 0, max: 16550, rate: 10 },
        { min: 16550, max: 63100, rate: 12 },
        { min: 63100, max: 100500, rate: 22 },
        { min: 100500, max: 191950, rate: 24 },
        { min: 191950, max: 243700, rate: 32 },
        { min: 243700, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 }
    ]
};

// Function to calculate federal tax using progressive tax brackets
function calculateFederalTax(annualIncome, filingStatus) {
    const brackets = taxBrackets2025[filingStatus] || taxBrackets2025.single;
    let tax = 0;
    let remainingIncome = annualIncome;
    
    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        
        const taxableAmountInBracket = Math.min(
            bracket.max - bracket.min,
            Math.max(0, remainingIncome)
        );
        
        tax += taxableAmountInBracket * (bracket.rate / 100);
        remainingIncome -= taxableAmountInBracket;
    }
    
    return tax;
}

// Function to calculate effective tax rate
function calculateEffectiveTaxRate(annualIncome, filingStatus) {
    const tax = calculateFederalTax(annualIncome, filingStatus);
    return (tax / annualIncome) * 100;
}

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
    
    // Setup scroll detection for containers
    setupScrollDetection();
});

/**
 * Gets the appropriate color class for the credit utilization percentage
 * @param {number} utilization - The credit utilization percentage
 * @returns {string} - The CSS class to apply for text color
 */
function getUtilizationColorClass(utilization) {
    if (utilization >= 61) {
        return 'text-neon-pink';    // 61%+: neon pink
    } else if (utilization >= 30) {
        return 'text-neon-yellow';  // 30% to 61%: neon yellow
    } else if (utilization >= 10) {
        return 'text-neon-blue';    // 10% to 30%: neon blue
    } else {
        return 'text-neon-green';   // 0% to 10%: neon green
    }
}

// Credit Card Company Logo Functions
/**
 * Identifies the credit card company based on the card name
 * @param {string} cardName - The name of the credit card
 * @returns {string} - The identified credit card company
 */
function identifyCreditCardCompany(cardName) {
    const nameLower = cardName.toLowerCase();
    
    // Check for common credit card companies
    if (nameLower.includes('visa')) return 'visa';
    if (nameLower.includes('mastercard')) return 'mastercard';
    if (nameLower.includes('amex') || nameLower.includes('american express')) return 'amex';
    if (nameLower.includes('discover')) return 'discover';
    if (nameLower.includes('capital one')) return 'capitalone';
    if (nameLower.includes('chase')) return 'chase';
    if (nameLower.includes('citi') || nameLower.includes('citibank')) return 'citi';
    if (nameLower.includes('wells fargo')) return 'wellsfargo';
    if (nameLower.includes('bank of america')) return 'bankofamerica';
    if (nameLower.includes('td bank') || nameLower.includes('td ')) return 'tdbank';
    if (nameLower.includes('usaa')) return 'usaa';
    if (nameLower.includes('pnc')) return 'pnc';
    if (nameLower.includes('barclays')) return 'barclays';
    if (nameLower.includes('navy federal') || nameLower.includes('navyfederal')) return 'navyfederal';
    if (nameLower.includes('synchrony')) return 'synchrony';
    if (nameLower.includes('apple')) return 'apple';
    if (nameLower.includes('amazon')) return 'amazon';
    if (nameLower.includes('paypal')) return 'paypal';
    
    // Return generic if no match found
    return 'generic';
}

/**
 * Gets the logo URL for a given credit card company
 * @param {string} company - The credit card company name
 * @returns {string} - The URL to the logo image
 */
function getCreditCardLogoUrl(cardType) {
    // Check if it's a custom image selection first
    switch (cardType.toLowerCase()) {
        case 'visa':
            return 'https://cdn.iconscout.com/icon/free/png-256/free-visa-3-226460.png';
        case 'mastercard':
            return 'https://cdn.iconscout.com/icon/free/png-256/free-mastercard-3-226466.png';
        case 'amex':
        case 'american express':
            return 'https://cdn.iconscout.com/icon/free/png-256/free-american-express-3-226464.png';
        case 'discover':
            return 'https://cdn.iconscout.com/icon/free/png-256/free-discover-3-226468.png';
        case 'capitalone':
        case 'capital one':
            return 'https://logo.clearbit.com/capitalone.com';
        case 'chase':
            return 'https://logo.clearbit.com/chase.com';
        case 'citi':
        case 'citibank':
            return 'https://logo.clearbit.com/citi.com';
        case 'apple':
        case 'apple card':
            return 'https://logo.clearbit.com/apple.com';
        case 'generic':
        default:
            return 'https://cdn.iconscout.com/icon/free/png-256/free-credit-card-459-226457.png';
    }
}

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
    window.openDate = document.getElementById('openDate');
    window.cardDueDate = document.getElementById('cardDueDate');
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
    window.taxBracket = document.getElementById('taxBracket');
    window.federalTaxRate = document.getElementById('federalTaxRate');
    window.oasdiTaxRate = document.getElementById('oasdiTaxRate');
    window.medicareTaxRate = document.getElementById('medicareTaxRate');
    window.stateTaxRate = document.getElementById('stateTaxRate');
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
    document.getElementById('creditCardModalTitle').textContent = 'Add Credit Card';
    cardName.value = '';
    creditLimit.value = '';
    currentBalance.value = '';
    openDate.value = '';
    cardDueDate.value = '';
    document.getElementById('editCardIndex').value = '-1';
    
    // Hide any previous validation errors
    document.getElementById('cardValidationErrors').classList.add('hidden');
    document.getElementById('cardErrorList').innerHTML = '';
    
    creditCardModal.classList.remove('hidden');
}

window.editCreditCard = function(index) {
    document.getElementById('creditCardModalTitle').textContent = 'Edit Credit Card';
    const card = creditCards[index];
    
    cardName.value = card.name;
    creditLimit.value = card.limit;
    currentBalance.value = card.balance;
    
    // Set the open date if it exists
    if (card.openDate) {
        openDate.value = card.openDate;
    } else {
        openDate.value = '';
    }
    
    // Set the due date if it exists
    if (card.dueDate) {
        cardDueDate.value = card.dueDate;
    } else {
        cardDueDate.value = '';
    }
    
    document.getElementById('editCardIndex').value = index;
    
    // Hide any previous validation errors
    document.getElementById('cardValidationErrors').classList.add('hidden');
    document.getElementById('cardErrorList').innerHTML = '';
    
    creditCardModal.classList.remove('hidden');
}

window.closeCreditCardModal = function() {
    creditCardModal.classList.add('hidden');
}

// Validate credit card form data
function validateCreditCardForm() {
    const errors = [];
    
    if (!cardName.value || cardName.value.trim() === '') {
        errors.push('Card Name is required');
    }
    
    const limitValue = parseFloat(creditLimit.value);
    if (isNaN(limitValue) || limitValue <= 0) {
        errors.push('Credit Limit must be a positive number');
    }
    
    const balanceValue = parseFloat(currentBalance.value);
    if (isNaN(balanceValue) || balanceValue < 0) {
        errors.push('Current Balance must be a non-negative number');
    }
    
    if (!openDate.value) {
        errors.push('Date Opened is required');
    } else {
        const selectedDate = new Date(openDate.value);
        const today = new Date();
        if (selectedDate > today) {
            errors.push('Date Opened cannot be in the future');
        }
    }
    
    const dueDateValue = parseInt(cardDueDate.value);
    if (!cardDueDate.value || isNaN(dueDateValue) || dueDateValue < 1 || dueDateValue > 31) {
        errors.push('Payment Due Date is required and must be a day between 1 and 31');
    }
    
    // If we have values for both limit and balance, check that balance doesn't exceed limit
    if (!isNaN(limitValue) && !isNaN(balanceValue) && balanceValue > limitValue) {
        errors.push('Current Balance cannot be greater than Credit Limit');
    }
    
    return errors;
}

// Display validation errors
function showValidationErrors(errors) {
    const errorContainer = document.getElementById('cardValidationErrors');
    const errorList = document.getElementById('cardErrorList');
    
    errorList.innerHTML = '';
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
    });
    
    errorContainer.classList.remove('hidden');
}

// Credit Card Functions
window.saveCreditCard = function() {
    // Validate form data
    const errors = validateCreditCardForm();
    if (errors.length > 0) {
        showValidationErrors(errors);
        return;
    }
    
    const card = {
        name: cardName.value.trim(),
        limit: parseFloat(creditLimit.value),
        balance: parseFloat(currentBalance.value),
        openDate: openDate.value,
        dueDate: parseInt(cardDueDate.value)
    };
    
    const editIndex = parseInt(document.getElementById('editCardIndex').value);
    
    if (editIndex >= 0 && editIndex < creditCards.length) {
        // Edit existing card
        creditCards[editIndex] = card;
    } else {
        // Add new card
        creditCards.push(card);
        
        // Also add a bill entry with amount $0 for this credit card
        const newBill = {
            name: `${card.name} Payment`,
            amount: 0,
            dueDate: card.dueDate,
            type: 'credit',
            priority: 'normal'
        };
        
        // Add the new bill
        bills.push(newBill);
        
        // Update the bills display
        renderBills();
        updatePaymentSchedule();
    }
    
    renderCreditCards();
    updateCreditSummary();
    closeCreditCardModal();
    
    // Dispatch event to trigger scroll detection check
    document.dispatchEvent(new Event('cardsChanged'));
}

function renderCreditCards() {
    if (creditCards.length === 0) {
        creditCardsContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No credit cards added yet</p>';
        return;
    }
    
    let html = '';
    creditCards.forEach((card, index) => {
        const utilization = (card.balance / card.limit) * 100;
        const payTo30 = (card.limit * 0.30) - card.balance;
        const payTo10 = (card.limit * 0.10) - card.balance;
        
        // Calculate account age in years from open date
        let accountAge = '';
        let accountAgeClass = 'text-neon-pink'; // Default for 0-2 years
        let ageYears = 0;
        let ageMonths = 0;
        
        if (card.openDate) {
            const openDate = new Date(card.openDate);
            const today = new Date();
            const monthsDiff = (today.getFullYear() - openDate.getFullYear()) * 12 + 
                              today.getMonth() - openDate.getMonth();
            ageYears = Math.floor(monthsDiff / 12);
            ageMonths = monthsDiff % 12;
            
            // Determine color class based on age ranges, matching the updateCreditSummary logic
            if (ageYears >= 25) {
                accountAgeClass = "text-neon-green"; // 25+ years
            } else if (ageYears >= 8) {
                accountAgeClass = "text-neon-blue";  // 8-24 years
            } else if (ageYears >= 3) {
                accountAgeClass = "text-neon-yellow"; // 3-7 years
            }
            
            if (ageYears > 0) {
                if (ageMonths > 0) {
                    accountAge = `<span class="${accountAgeClass}">${ageYears}</span> ${ageYears === 1 ? 'year' : 'years'}, <span class="${accountAgeClass}">${ageMonths}</span> ${ageMonths === 1 ? 'month' : 'months'} old`;
                } else {
                    accountAge = `<span class="${accountAgeClass}">${ageYears}</span> ${ageYears === 1 ? 'year' : 'years'} old`;
                }
            } else {
                accountAge = `<span class="text-neon-pink">${ageMonths}</span> ${ageMonths === 1 ? 'month' : 'months'} old`;
            }
        } else if (card.age) { 
            // Support for legacy data
            ageYears = Math.floor(card.age / 12);
            ageMonths = card.age % 12;
            
            // Determine color class based on age ranges, matching the updateCreditSummary logic
            if (ageYears >= 25) {
                accountAgeClass = "text-neon-green"; // 25+ years
            } else if (ageYears >= 8) {
                accountAgeClass = "text-neon-blue";  // 8-24 years
            } else if (ageYears >= 3) {
                accountAgeClass = "text-neon-yellow"; // 3-7 years
            }
            
            if (ageYears > 0) {
                if (ageMonths > 0) {
                    accountAge = `<span class="${accountAgeClass}">${ageYears}</span> ${ageYears === 1 ? 'year' : 'years'}, <span class="${accountAgeClass}">${ageMonths}</span> ${ageMonths === 1 ? 'month' : 'months'} old`;
                } else {
                    accountAge = `<span class="${accountAgeClass}">${ageYears}</span> ${ageYears === 1 ? 'year' : 'years'} old`;
                }
            } else {
                accountAge = `<span class="text-neon-pink">${ageMonths}</span> ${ageMonths === 1 ? 'month' : 'months'} old`;
            }
        } else {
            accountAge = '<span class="text-neon-pink">Age unknown</span>';
        }
        
        // Apply updated color coding to utilization based on new thresholds
        let utilizationColorClass = 'cyber-green'; // Default for 0-10%
        if (utilization > 61) {
            utilizationColorClass = 'cyber-pink'; // 61%+
        } else if (utilization > 30) {
            utilizationColorClass = 'cyber-yellow'; // 30%-61%
        } else if (utilization > 10) {
            utilizationColorClass = 'cyber-blue'; // 10%-30%
        }
        
        // Identify the credit card company and get the appropriate logo URL
        const cardCompany = card.customImage || identifyCreditCardCompany(card.name);
        const cardLogoUrl = getCreditCardLogoUrl(cardCompany);
        
        html += `
            <div class="border cyber-border rounded-lg p-4 mb-4 cyber-card">
                <div class="flex justify-between items-start">
                    <div class="flex items-center">
                        <div>
                            <h3 class="font-medium text-lg cyber-neon">${card.name}</h3>
                            <p class="text-sm">${accountAge}</p>
                        </div>
                        <img src="${cardLogoUrl}" alt="${cardCompany} logo" class="h-8 ml-3 card-logo cursor-pointer" onclick="showCardImageModal(${index})">
                    </div>
                    <div class="flex">
                        <button onclick="editCreditCard(${index})" class="text-neon-blue hover:text-neon-purple mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCreditCard(${index})" class="text-neon-pink hover:text-neon-purple">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Credit Limit</p>
                        <p class="font-medium">$${card.limit.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Current Balance</p>
                        <p class="font-medium ${getUtilizationColorClass(utilization)}">$${card.balance.toFixed(2)}</p>
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
                
                <div class="grid grid-cols-3 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Pay to 30% utilization</p>
                        <p class="font-medium ${payTo30 < 0 ? 'text-neon-pink' : 'text-neon-green'}">
                            $${Math.abs(payTo30).toFixed(2)} ${payTo30 > 0 ? 'available' : payTo30 < 0 ? 'needed' : 'at limit'}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Pay to 10% utilization</p>
                        <p class="font-medium ${payTo10 < 0 ? 'text-neon-pink' : 'text-neon-green'}">
                            $${Math.abs(payTo10).toFixed(2)} ${payTo10 > 0 ? 'available' : payTo10 < 0 ? 'needed' : 'at limit'}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Payment Due Date</p>
                        <p class="font-medium">${card.dueDate ? `${card.dueDate}${getOrdinalSuffix(card.dueDate)} of each month` : 'Not specified'}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    creditCardsContainer.innerHTML = html;
}

window.deleteCreditCard = function(index) {
    const deletedCard = creditCards[index];
    
    // First delete the card
    creditCards.splice(index, 1);
    
    // Then find and delete any bill entries that correspond to this card
    if (deletedCard && deletedCard.name) {
        const billName = `${deletedCard.name} Payment`;
        
        // Find the index of the corresponding bill
        const billIndex = bills.findIndex(bill => bill.name === billName && bill.type === 'credit');
        
        // If a matching bill is found, delete it
        if (billIndex !== -1) {
            bills.splice(billIndex, 1);
            
            // Update the bills display and payment schedule
            renderBills();
            updatePaymentSchedule();
        }
    }
    
    renderCreditCards();
    updateCreditSummary();
}

function updateCreditSummary() {
    const totalLimitValue = creditCards.reduce((sum, card) => sum + card.limit, 0);
    const totalBalanceValue = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const totalUtilizationValue = totalLimitValue > 0 ? (totalBalanceValue / totalLimitValue) * 100 : 0;
    
    // Update account count
    document.getElementById('totalAccounts').textContent = creditCards.length;
    
    // Determine color for total available credit
    let totalLimitColorClass = "text-neon-pink"; // Default for 0-2,500
    if (totalLimitValue > 50000) {
        totalLimitColorClass = "text-neon-green"; // 50,001+
    } else if (totalLimitValue > 15000) {
        totalLimitColorClass = "text-neon-blue";  // 15,001-50,000
    } else if (totalLimitValue > 2500) {
        totalLimitColorClass = "text-neon-yellow"; // 2,501-15,000
    }
    
    // Format total limit with color class
    totalLimit.innerHTML = `<span class="${totalLimitColorClass}">$${totalLimitValue.toFixed(2)}</span>`;
    
    // Apply utilization-based color to total balance using the same getUtilizationColorClass function
    totalBalance.innerHTML = `<span class="${getUtilizationColorClass(totalUtilizationValue)}">$${totalBalanceValue.toFixed(2)}</span>`;
    
    // Apply updated color coding to total utilization based on new thresholds
    let utilizationColorClass = 'text-neon-green'; // Default for 0-10%
    if (totalUtilizationValue > 61) {
        utilizationColorClass = 'text-neon-pink'; // 61%+
    } else if (totalUtilizationValue > 30) {
        utilizationColorClass = 'text-neon-yellow'; // 30%-61%
    } else if (totalUtilizationValue > 10) {
        utilizationColorClass = 'text-neon-blue'; // 10%-30%
    }
    totalUtilization.innerHTML = `<span class="${utilizationColorClass}">${totalUtilizationValue.toFixed(1)}%</span>`;
    
    // Calculate amount needed to reach 30% and 10% utilization
    const payTo30 = document.getElementById('payTo30');
    const payTo10 = document.getElementById('payTo10');
    
    if (totalLimitValue > 0) {
        const target30 = totalLimitValue * 0.30;
        const target10 = totalLimitValue * 0.10;
        const amountTo30 = totalBalanceValue - target30;
        const amountTo10 = totalBalanceValue - target10;
        
        if (amountTo30 <= 0) {
            payTo30.innerHTML = `<span class="text-neon-green">$${Math.abs(amountTo30).toFixed(2)}</span> <span class="text-gray-400 text-sm">available</span>`;
        } else {
            payTo30.innerHTML = `<span class="text-neon-pink">$${amountTo30.toFixed(2)}</span> <span class="text-gray-400 text-sm">needed</span>`;
        }
        
        if (amountTo10 <= 0) {
            payTo10.innerHTML = `<span class="text-neon-green">$${Math.abs(amountTo10).toFixed(2)}</span> <span class="text-gray-400 text-sm">available</span>`;
        } else {
            payTo10.innerHTML = `<span class="text-neon-pink">$${amountTo10.toFixed(2)}</span> <span class="text-gray-400 text-sm">needed</span>`;
        }
    } else {
        payTo30.innerHTML = `<span class="text-neon-green">$0</span>`;
        payTo10.innerHTML = `<span class="text-neon-green">$0</span>`;
    }
    
    // Calculate the age of oldest credit line
    const oldestCreditLine = document.getElementById('oldestCreditLine');
    if (creditCards.length > 0) {
        let oldestAgeInMonths = 0;
        const today = new Date();
        
        creditCards.forEach(card => {
            if (card.openDate) {
                const openDate = new Date(card.openDate);
                const ageInMonths = (today.getFullYear() - openDate.getFullYear()) * 12 + 
                                  today.getMonth() - openDate.getMonth();
                if (ageInMonths > oldestAgeInMonths) {
                    oldestAgeInMonths = ageInMonths;
                }
            } else if (card.age && card.age > oldestAgeInMonths) {
                // Support for legacy data
                oldestAgeInMonths = card.age;
            }
        });
        
        if (oldestAgeInMonths > 0) {
            const years = Math.floor(oldestAgeInMonths / 12);
            const months = oldestAgeInMonths % 12;
            
            // Determine color class based on age ranges
            let ageColorClass = "text-neon-pink"; // Default for 0-2 years
            if (years >= 25) {
                ageColorClass = "text-neon-green"; // 25+ years
            } else if (years >= 8) {
                ageColorClass = "text-neon-blue";  // 8-24 years
            } else if (years >= 3) {
                ageColorClass = "text-neon-yellow"; // 3-7 years
            }
            
            if (years > 0) {
                if (months > 0) {
                    oldestCreditLine.innerHTML = `<span class="${ageColorClass}">${years}</span> <span class="text-gray-400 text-sm">years</span>, <span class="${ageColorClass}">${months}</span> <span class="text-gray-400 text-sm">months</span>`;
                } else {
                    oldestCreditLine.innerHTML = `<span class="${ageColorClass}">${years}</span> <span class="text-gray-400 text-sm">years</span>`;
                }
            } else {
                oldestCreditLine.innerHTML = `<span class="text-neon-pink">${months}</span> <span class="text-gray-400 text-sm">months</span>`;
            }
        } else {
            oldestCreditLine.innerHTML = `<span class="text-neon-pink">0</span> years`;
        }
    } else {
        oldestCreditLine.innerHTML = `<span class="text-neon-pink">0</span> years`;
    }
}

// Bill Modal Functions
window.showAddBillModal = function() {
    document.getElementById('billModalTitle').textContent = 'Add Monthly Bill';
    billName.value = '';
    billAmount.value = '';
    billDueDate.value = '';
    billType.value = 'housing';
    billPriority.value = 'normal';
    document.getElementById('editBillIndex').value = '-1';
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    billModal.classList.remove('hidden');
}

window.editBill = function(index) {
    document.getElementById('billModalTitle').textContent = 'Edit Monthly Bill';
    const bill = bills[index];
    
    billName.value = bill.name;
    billAmount.value = bill.amount;
    billDueDate.value = bill.dueDate;
    // Set bill type if it exists, otherwise default to 'other'
    billType.value = bill.type || 'other';
    billPriority.value = bill.priority;
    
    document.getElementById('editBillIndex').value = index;
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    billModal.classList.remove('hidden');
}

window.closeBillModal = function() {
    billModal.classList.add('hidden');
}

// Validate bill form data
function validateBillForm() {
    const errors = [];
    
    if (!billName.value || billName.value.trim() === '') {
        errors.push('Bill Name is required');
    }
    
    const amountValue = parseFloat(billAmount.value);
    if (isNaN(amountValue) || amountValue < 0) {
        errors.push('Amount must be a non-negative number');
    }
    
    const dueDateValue = parseInt(billDueDate.value);
    if (isNaN(dueDateValue) || dueDateValue < 1 || dueDateValue > 31) {
        errors.push('Due Date must be a day between 1 and 31');
    }
    
    return errors;
}

// Display bill validation errors
function showBillValidationErrors(errors) {
    const errorContainer = document.getElementById('billValidationErrors');
    const errorList = document.getElementById('billErrorList');
    
    errorList.innerHTML = '';
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
    });
    
    errorContainer.classList.remove('hidden');
}

// Bill Functions
window.saveBill = function() {
    // Validate form data
    const errors = validateBillForm();
    if (errors.length > 0) {
        showBillValidationErrors(errors);
        return;
    }
    
    const bill = {
        name: billName.value.trim(),
        amount: parseFloat(billAmount.value),
        dueDate: parseInt(billDueDate.value),
        type: billType.value,
        priority: billPriority.value,
        isPaid: false // Add isPaid property, default to false
    };
    
    const editIndex = parseInt(document.getElementById('editBillIndex').value);
    
    if (editIndex >= 0 && editIndex < bills.length) {
        // Edit existing bill, preserve the paid status if it exists
        bill.isPaid = bills[editIndex].isPaid || false;
        bills[editIndex] = bill;
    } else {
        // Add new bill
        bills.push(bill);
    }
    
    renderBills();
    updatePaymentSchedule();
    updateExpenseSummary();
    closeBillModal();
    
    // Dispatch event to trigger scroll detection check
    document.dispatchEvent(new Event('billsChanged'));
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
        const priorityIcon = bill.priority === 'high' ? 'fa-exclamation-circle text-neon-pink' : 
                           bill.priority === 'low' ? 'fa-info-circle text-neon-blue' : 'fa-check-circle text-neon-purple';
        
        // Get bill type icon
        const typeIcon = getBillTypeIcon(bill.type || 'other');
        
        // Add paid class if bill is marked as paid
        const paidClass = bill.isPaid ? 'bill-paid' : '';
        
        html += `
            <div class="border cyber-border rounded-lg p-4 mb-3 cyber-card bill-item ${paidClass}" data-bill-index="${index}">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center">
                            <i class="fas ${typeIcon} mr-2 text-neon-green"></i>
                            <h3 class="font-medium text-lg cyber-neon">${bill.name}</h3>
                        </div>
                        <p class="text-sm text-gray-400">Due on ${bill.dueDate}th</p>
                    </div>
                    <div class="flex items-center">
                        <span class="font-medium mr-4">$${bill.amount.toFixed(2)}</span>
                        <i class="fas ${priorityIcon} mr-2 cyber-neon"></i>
                        <button onclick="editBill(${index})" class="text-neon-blue hover:text-neon-purple mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteBill(${index})" class="text-neon-pink hover:text-neon-purple">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    billsContainer.innerHTML = html;
    
    // Add click event listener to each bill item for marking as paid
    document.querySelectorAll('.bill-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't toggle if click was on a button
            if (e.target.closest('button')) return;
            
            const index = parseInt(this.getAttribute('data-bill-index'));
            toggleBillPaidStatus(index);
        });
    });
}

function getBillTypeIcon(type) {
    const icons = {
        'housing': 'fa-home',
        'utilities': 'fa-bolt',
        'internet': 'fa-wifi',
        'phone': 'fa-mobile-alt',
        'insurance': 'fa-shield-alt',
        'loan': 'fa-money-bill-wave',
        'credit': 'fa-credit-card',
        'subscription': 'fa-calendar-alt',
        'streaming': 'fa-stream',
        'healthcare': 'fa-heart',
        'childcare': 'fa-child',
        'other': 'fa-file-invoice-dollar'
    };
    return icons[type] || 'fa-file-invoice-dollar';
}

window.deleteBill = function(index) {
    bills.splice(index, 1);
    renderBills();
    updatePaymentSchedule();
    updateExpenseSummary();
    
    // Dispatch event to trigger scroll detection check
    document.dispatchEvent(new Event('billsChanged'));
}

function updatePaymentSchedule() {
    // Split bills between two paychecks (15th and end of month)
    const paycheck1 = bills.filter(bill => bill.dueDate <= 15);
    const paycheck2 = bills.filter(bill => bill.dueDate > 15);
    
    // Calculate total amounts
    const paycheck1TotalAmount = paycheck1.reduce((sum, bill) => sum + bill.amount, 0);
    const paycheck2TotalAmount = paycheck2.reduce((sum, bill) => sum + bill.amount, 0);
    
    // Calculate remaining unpaid amounts
    const paycheck1RemainingAmount = paycheck1.reduce((sum, bill) => sum + (bill.isPaid ? 0 : bill.amount), 0);
    const paycheck2RemainingAmount = paycheck2.reduce((sum, bill) => sum + (bill.isPaid ? 0 : bill.amount), 0);
    const totalRemainingAmount = paycheck1RemainingAmount + paycheck2RemainingAmount;
    
    // Update bill names in payment schedule
    paycheck1Bills.textContent = paycheck1.length > 0 ? 
        paycheck1.map(bill => bill.name).join(', ') : 'No bills scheduled';
    paycheck2Bills.textContent = paycheck2.length > 0 ? 
        paycheck2.map(bill => bill.name).join(', ') : 'No bills scheduled';
        
    // Update total amounts with neon pink color
    paycheck1Total.innerHTML = `<span class="text-neon-pink">$${paycheck1TotalAmount.toFixed(2)}</span>`;
    paycheck2Total.innerHTML = `<span class="text-neon-pink">$${paycheck2TotalAmount.toFixed(2)}</span>`;
    
    // Update remaining amounts with conditional colors
    // For paycheck 1: neon pink if equal to total, neon blue if less than total but not 0, neon green if 0
    let paycheck1RemainingClass = 'text-neon-pink';
    if (paycheck1RemainingAmount === 0) {
        paycheck1RemainingClass = 'text-neon-green';
    } else if (paycheck1RemainingAmount < paycheck1TotalAmount) {
        paycheck1RemainingClass = 'text-neon-blue';
    }
    
    // For paycheck 2: neon pink if equal to total, neon blue if less than total but not 0, neon green if 0
    let paycheck2RemainingClass = 'text-neon-pink';
    if (paycheck2RemainingAmount === 0) {
        paycheck2RemainingClass = 'text-neon-green';
    } else if (paycheck2RemainingAmount < paycheck2TotalAmount) {
        paycheck2RemainingClass = 'text-neon-blue';
    }
    
    // For total remaining: neon pink if equal to total, neon blue if less than total but not 0, neon green if 0
    let totalRemainingClass = 'text-neon-pink';
    if (totalRemainingAmount === 0) {
        totalRemainingClass = 'text-neon-green';
    } else if (totalRemainingAmount < (paycheck1TotalAmount + paycheck2TotalAmount)) {
        totalRemainingClass = 'text-neon-blue';
    }
    
    document.getElementById('paycheck1Remaining').innerHTML = `<span class="${paycheck1RemainingClass}">$${paycheck1RemainingAmount.toFixed(2)}</span>`;
    document.getElementById('paycheck2Remaining').innerHTML = `<span class="${paycheck2RemainingClass}">$${paycheck2RemainingAmount.toFixed(2)}</span>`;
    document.getElementById('totalRemaining').innerHTML = `<span class="${totalRemainingClass}">$${totalRemainingAmount.toFixed(2)}</span>`;
    
    // Update total bills count
    document.getElementById('totalBills').textContent = bills.length;
    
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
    const filingStatus = taxBracket.value;
    const oasdiTaxPct = parseFloat(oasdiTaxRate.value);
    const medicareTaxPct = parseFloat(medicareTaxRate.value);
    const stateTaxPct = parseFloat(stateTaxRate.value);
    const retirementPct = parseFloat(retirementContribution.value);
    const esppPct = parseFloat(esppContribution.value);
    
    if (isNaN(gross) || gross <= 0) {
        alert('Please enter a valid gross salary');
        return;
    }
    
    const grossPerPeriod = gross / periods;
    
    // Calculate federal tax using progressive tax brackets
    const federalTaxPerYear = calculateFederalTax(gross, filingStatus);
    const federalTaxAmount = federalTaxPerYear / periods;
    
    // Calculate effective federal tax rate and update the display field
    const effectiveFederalRate = calculateEffectiveTaxRate(gross, filingStatus);
    federalTaxRate.value = effectiveFederalRate.toFixed(2);
    
    // OASDI has a wage cap (for 2025, using estimated $168,600)
    // Note: Adjust this annually based on actual Social Security wage base
    const oasdiWageCap = 168600;
    const oasdiTaxAmount = Math.min(grossPerPeriod, oasdiWageCap / periods) * (oasdiTaxPct / 100);
    
    // Medicare has no wage cap, but higher income has additional 0.9% for income above $200,000/$250,000
    const medicareAdditionalRate = 0.9; // 0.9% additional for high earners
    let medicareTaxAmount = grossPerPeriod * (medicareTaxPct / 100);
    
    // Add additional Medicare tax for high earners (simplified for individual filers)
    if (gross > 200000) {
        const excessAmount = (gross - 200000) / periods;
        medicareTaxAmount += excessAmount * (medicareAdditionalRate / 100);
    }
    
    // State tax calculation
    const stateTaxAmount = grossPerPeriod * (stateTaxPct / 100);
    
    // Total tax and other deductions
    const totalTaxAmount = federalTaxAmount + oasdiTaxAmount + medicareTaxAmount + stateTaxAmount;
    const retirementAmount = grossPerPeriod * (retirementPct / 100);
    const esppAmount = grossPerPeriod * (esppPct / 100);
    const netPay = grossPerPeriod - totalTaxAmount - retirementAmount - esppAmount;
    const bonusAmount = gross * (bonusPct / 100);
    
    // Update the UI with calculated values
    document.getElementById('grossPay').textContent = `$${grossPerPeriod.toFixed(2)}`;
    document.getElementById('federalTaxAmount').textContent = `$${federalTaxAmount.toFixed(2)}`;
    document.getElementById('oasdiTaxAmount').textContent = `$${oasdiTaxAmount.toFixed(2)}`;
    document.getElementById('medicareTaxAmount').textContent = `$${medicareTaxAmount.toFixed(2)}`;
    document.getElementById('stateTaxAmount').textContent = `$${stateTaxAmount.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${totalTaxAmount.toFixed(2)}`;
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
    // Current date for reference is May 3, 2025
    
    // Load sample data for demo
    creditCards = [
        { 
            name: "Cyber Security", 
            limit: 10000, 
            balance: 3500, 
            openDate: "2023-05-03" // 24 months ago
        },
        { 
            name: "Digital Wave", 
            limit: 15000, 
            balance: 1200, 
            openDate: "2022-05-03" // 36 months ago
        }
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

function setupScrollDetection() {
    // Get the container elements
    const creditCardsWrapper = document.querySelector('.credit-cards-wrapper');
    const billsWrapper = document.querySelector('.bills-wrapper');
    
    // Function to check if content is actually scrollable
    const checkIfScrollable = (element) => {
        if (!element) return;
        
        // More accurate comparison to determine if scrolling is needed
        // Using a larger threshold to account for various browser renderings
        const threshold = 15; // Increased threshold to account for margins/padding/borders
        const isScrollable = element.scrollHeight > (element.clientHeight + threshold);
        
        if (isScrollable) {
            element.classList.add('actually-scrollable');
        } else {
            element.classList.remove('actually-scrollable');
        }
        
        // Debug info to help troubleshoot
        console.debug(`Element ${element.className} - scrollHeight: ${element.scrollHeight}, clientHeight: ${element.clientHeight}, isScrollable: ${isScrollable}`);
    };
    
    // Initial check when the page loads
    // Delay the initial check to ensure all content has been properly rendered
    setTimeout(() => {
        if (creditCardsWrapper) checkIfScrollable(creditCardsWrapper);
        if (billsWrapper) checkIfScrollable(billsWrapper);
    }, 300);
    
    // Set up mutation observer to detect content changes
    const observer = new MutationObserver((mutations) => {
        let creditCardsMutated = false;
        let billsMutated = false;
        
        for (const mutation of mutations) {
            if (mutation.target.closest('.credit-cards-wrapper')) {
                creditCardsMutated = true;
            }
            if (mutation.target.closest('.bills-wrapper')) {
                billsMutated = true;
            }
        }
        
        // Only check affected containers
        if (creditCardsMutated && creditCardsWrapper) {
            setTimeout(() => checkIfScrollable(creditCardsWrapper), 300);
        }
        if (billsMutated && billsWrapper) {
            setTimeout(() => checkIfScrollable(billsWrapper), 300);
        }
    });
    
    // Watch both containers for content changes
    if (creditCardsWrapper) {
        observer.observe(creditCardsWrapper, { childList: true, subtree: true, characterData: true });
    }
    if (billsWrapper) {
        observer.observe(billsWrapper, { childList: true, subtree: true, characterData: true });
    }
    
    // Also check when window is resized
    window.addEventListener('resize', () => {
        if (creditCardsWrapper) checkIfScrollable(creditCardsWrapper);
        if (billsWrapper) checkIfScrollable(billsWrapper);
    });
    
    // Add event listeners to detect mouse enter/leave
    if (creditCardsWrapper) {
        creditCardsWrapper.addEventListener('mouseenter', () => {
            checkIfScrollable(creditCardsWrapper);
        });
    }
    
    if (billsWrapper) {
        billsWrapper.addEventListener('mouseenter', () => {
            checkIfScrollable(billsWrapper);
        });
    }
    
    // Force a check after any DOM updates that might affect height
    const forceCheck = () => {
        if (creditCardsWrapper) checkIfScrollable(creditCardsWrapper);
        if (billsWrapper) checkIfScrollable(billsWrapper);
    };
    
    // Re-check if bills are added or removed
    document.addEventListener('billsChanged', forceCheck);
    document.addEventListener('cardsChanged', forceCheck);
}

// Function to show the card image selection modal
function showCardImageModal(cardIndex) {
    document.getElementById('editCardImageIndex').value = cardIndex;
    
    // Highlight currently selected image if any
    const currentCard = creditCards[cardIndex];
    const imageOptions = document.querySelectorAll('.card-image-option');
    
    // Reset all selections
    imageOptions.forEach(option => {
        option.classList.remove('border-neon-blue', 'border-2');
        option.classList.add('border-gray-600', 'border');
    });
    
    // If card has a custom image, highlight it
    if (currentCard.customImage) {
        const selectedOption = document.querySelector(`.card-image-option[data-image="${currentCard.customImage}"]`);
        if (selectedOption) {
            selectedOption.classList.remove('border-gray-600', 'border');
            selectedOption.classList.add('border-neon-blue', 'border-2');
        }
    }
    
    // Add click event listeners to all card image options
    imageOptions.forEach(option => {
        option.onclick = function() {
            // Remove highlight from all options
            imageOptions.forEach(opt => {
                opt.classList.remove('border-neon-blue', 'border-2');
                opt.classList.add('border-gray-600', 'border');
            });
            
            // Highlight selected option
            this.classList.remove('border-gray-600', 'border');
            this.classList.add('border-neon-blue', 'border-2');
            
            // Save the selection
            const imageType = this.getAttribute('data-image');
            saveCardImage(cardIndex, imageType);
        };
    });
    
    // Show the modal
    document.getElementById('cardImageModal').classList.remove('hidden');
}

// Function to save the selected card image
function saveCardImage(cardIndex, imageType) {
    // Update the card object
    creditCards[cardIndex].customImage = imageType;
    
    // Save to localStorage
    localStorage.setItem('creditCards', JSON.stringify(creditCards));
    
    // Re-render the credit cards to show the new image
    renderCreditCards();
    updateCreditSummary();
    
    // Close the modal
    closeCardImageModal();
}

// Function to close the card image modal
function closeCardImageModal() {
    document.getElementById('cardImageModal').classList.add('hidden');
}

// Function to reset the paid status of all bills
window.resetAllPayments = function() {
    // Set isPaid to false for all bills
    bills.forEach(bill => {
        bill.isPaid = false;
    });
    
    // Re-render bills to update the UI
    renderBills();
    
    // Update the payment schedule since paid status affects calculations
    updatePaymentSchedule();
}

// Function to toggle the paid status of a bill
function toggleBillPaidStatus(index) {
    // Make sure the index is valid
    if (index >= 0 && index < bills.length) {
        // Toggle the paid status
        bills[index].isPaid = !bills[index].isPaid;
        
        // Re-render bills to update the UI
        renderBills();
        
        // Update the payment schedule since paid status may affect calculations
        updatePaymentSchedule();
    }
}

function getOrdinalSuffix(n) {
    if (n >= 11 && n <= 13) {
        return 'th';
    }
    
    switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

/**
 * Returns the appropriate CSS color class based on credit utilization percentage
 * @param {number} utilization - The credit utilization percentage (0-100)
 * @returns {string} CSS class name for the appropriate neon color
 */
function getUtilizationColorClass(utilization) {
    if (utilization < 10) {
        return 'text-neon-green';
    } else if (utilization < 30) {
        return 'text-neon-blue';
    } else if (utilization < 61) {
        return 'text-neon-yellow';
    } else {
        return 'text-neon-pink';
    }
}