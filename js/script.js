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
    
    // Process each bracket in order
    for (let i = 0; i < brackets.length; i++) {
        const bracket = brackets[i];
        
        // Calculate the taxable amount in the current bracket
        let taxableInThisBracket;
        
        if (annualIncome > bracket.max) {
            // If income exceeds this bracket, tax the full bracket range
            taxableInThisBracket = bracket.max - bracket.min;
        } else if (annualIncome > bracket.min) {
            // If income falls within this bracket, tax only the portion in this bracket
            taxableInThisBracket = annualIncome - bracket.min;
        } else {
            // If income is below this bracket minimum, no tax in this bracket
            taxableInThisBracket = 0;
        }
        
        // Add tax for this bracket
        tax += taxableInThisBracket * (bracket.rate / 100);
        
        // If income doesn't exceed this bracket, we're done
        if (annualIncome <= bracket.max) {
            break;
        }
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
let loans = []; // Add loans array for loan tracking
let salaryData = {}; // Object to store salary calculation data
let profitData = {}; // Object to store profit calculation data

// Persistence functions for localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('creditCards', JSON.stringify(creditCards));
        localStorage.setItem('bills', JSON.stringify(bills));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('loans', JSON.stringify(loans));
        localStorage.setItem('salaryData', JSON.stringify(salaryData));
        localStorage.setItem('profitData', JSON.stringify(profitData));
        
        // Save the last save timestamp
        localStorage.setItem('lastSaved', new Date().toISOString());
        
        // Show a brief save confirmation
        showSaveConfirmation();
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        alert('Failed to save your data. Your browser storage might be full or restricted.');
    }
}

function loadFromLocalStorage() {
    try {
        // Load credit cards
        const savedCreditCards = localStorage.getItem('creditCards');
        if (savedCreditCards) {
            creditCards = JSON.parse(savedCreditCards);
        }
        
        // Load bills
        const savedBills = localStorage.getItem('bills');
        if (savedBills) {
            bills = JSON.parse(savedBills);
        }
        
        // Load expenses
        const savedExpenses = localStorage.getItem('expenses');
        if (savedExpenses) {
            expenses = JSON.parse(savedExpenses);
        }
        
        // Load loans
        const savedLoans = localStorage.getItem('loans');
        if (savedLoans) {
            loans = JSON.parse(savedLoans);
        }
        
        // Load salary data
        const savedSalaryData = localStorage.getItem('salaryData');
        if (savedSalaryData) {
            salaryData = JSON.parse(savedSalaryData);
        }
        
        // Load profit data
        const savedProfitData = localStorage.getItem('profitData');
        if (savedProfitData) {
            profitData = JSON.parse(savedProfitData);
        }
        
        // Update UI with loaded data
        renderCreditCards();
        updateCreditSummary();
        renderBills();
        updatePaymentSchedule();
        renderExpenses();
        updateExpenseSummary();
        if (typeof renderLoans === 'function') {
            renderLoans();
            updateLoanSummary();
        }
        
        // Load salary data if available
        loadSalaryDataToUI();
        
        // Show last saved time if available
        updateLastSavedInfo();
        
        return true;
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        return false;
    }
}

// Function to load salary data to the UI
function loadSalaryDataToUI() {
    if (Object.keys(salaryData).length > 0) {
        // Show the salary results container
        const salaryResults = document.getElementById('salaryResults');
        if (salaryResults) {
            salaryResults.classList.remove('hidden');
        }
        
        // Populate the salary fields with saved data
        if (salaryData.annualSalary) {
            document.getElementById('annualSalary').textContent = salaryData.annualSalary;
        }
        
        if (salaryData.grossPay) {
            document.getElementById('grossPay').textContent = salaryData.grossPay;
        }
        
        if (salaryData.netPay) {
            document.getElementById('netPay').textContent = salaryData.netPay;
        }
        
        if (salaryData.bonusAmount) {
            document.getElementById('bonusAmount').textContent = salaryData.bonusAmount;
        }
        
        if (salaryData.afterTaxBonusAmount) {
            document.getElementById('afterTaxBonusAmount').textContent = salaryData.afterTaxBonusAmount;
        }
        
        if (salaryData.federalTaxAmount) {
            document.getElementById('federalTaxAmount').textContent = salaryData.federalTaxAmount;
        }
        
        if (salaryData.oasdiTaxAmount) {
            document.getElementById('oasdiTaxAmount').textContent = salaryData.oasdiTaxAmount;
        }
        
        if (salaryData.medicareTaxAmount) {
            document.getElementById('medicareTaxAmount').textContent = salaryData.medicareTaxAmount;
        }
        
        if (salaryData.stateTaxAmount) {
            document.getElementById('stateTaxAmount').textContent = salaryData.stateTaxAmount;
        }
        
        if (salaryData.taxAmount) {
            document.getElementById('taxAmount').textContent = salaryData.taxAmount;
        }
        
        if (salaryData.retirementAmount) {
            document.getElementById('retirementAmount').textContent = salaryData.retirementAmount;
        }
        
        if (salaryData.esppAmount) {
            document.getElementById('esppAmount').textContent = salaryData.esppAmount;
        }
        
        if (salaryData.savingsTotal) {
            document.getElementById('savingsTotal').textContent = salaryData.savingsTotal;
        }
        
        if (salaryData.healthAmount) {
            document.getElementById('healthAmount').textContent = salaryData.healthAmount;
        }
        
        if (salaryData.dentalAmount) {
            document.getElementById('dentalAmount').textContent = salaryData.dentalAmount;
        }
        
        if (salaryData.visionAmount) {
            document.getElementById('visionAmount').textContent = salaryData.visionAmount;
        }
        
        if (salaryData.insuranceTotal) {
            document.getElementById('insuranceTotal').textContent = salaryData.insuranceTotal;
        }
        
        if (salaryData.federalTaxRate) {
            document.getElementById('federalTaxRate').textContent = salaryData.federalTaxRate;
        }
        
        if (salaryData.oasdiRate) {
            document.getElementById('oasdiRate').textContent = salaryData.oasdiRate;
        }
        
        if (salaryData.medicareRate) {
            document.getElementById('medicareRate').textContent = salaryData.medicareRate;
        }
        
        if (salaryData.stateRate) {
            document.getElementById('stateRate').textContent = salaryData.stateRate;
        }
        
        if (salaryData.bonusTaxRate) {
            document.getElementById('bonusTaxRate').textContent = salaryData.bonusTaxRate;
        }
        
        // UPDATE: Modify the Calculate Salary button to show Update Salary
        const calculateButton = document.querySelector('button[onclick="showSalaryModal()"]');
        if (calculateButton) {
            calculateButton.innerHTML = '<i class="fas fa-calculator mr-1"></i> Update Salary';
        }
        
        // After loading salary data, try to load the profit data
        loadProfitDataToUI();
    }
}

// Function to load profit data to the UI
function loadProfitDataToUI() {
    if (Object.keys(profitData).length > 0 && salaryData.netPay) {
        // Show the profit results container
        const profitResults = document.getElementById('grossProfitResults');
        if (profitResults) {
            profitResults.classList.remove('hidden');
        }
        
        // Hide the placeholder message
        const profitContainer = document.getElementById('grossProfitContainer');
        if (profitContainer) {
            profitContainer.innerHTML = '';
        }
        
        // Populate the profit fields with saved data
        if (profitData.gpMonthlyIncome) {
            document.getElementById('gpMonthlyIncome').textContent = profitData.gpMonthlyIncome;
        }
        
        if (profitData.gpMonthlyBills) {
            document.getElementById('gpMonthlyBills').textContent = profitData.gpMonthlyBills;
        }
        
        if (profitData.gpMonthlySurplus) {
            const element = document.getElementById('gpMonthlySurplus');
            if (element) {
                element.textContent = profitData.gpMonthlySurplus;
                // Apply the correct class based on surplus or deficit
                element.className = profitData.gpMonthlySurplusClass || 'font-bold text-neon-blue';
            }
        }
        
        if (profitData.gpPaycheck1Net) {
            document.getElementById('gpPaycheck1Net').textContent = profitData.gpPaycheck1Net;
        }
        
        if (profitData.gpPaycheck1Bills) {
            document.getElementById('gpPaycheck1Bills').textContent = profitData.gpPaycheck1Bills;
        }
        
        if (profitData.gpPaycheck1Surplus) {
            const element = document.getElementById('gpPaycheck1Surplus');
            if (element) {
                element.textContent = profitData.gpPaycheck1Surplus;
                element.className = profitData.gpPaycheck1SurplusClass || 'font-bold';
            }
        }
        
        if (profitData.gpPaycheck2Net) {
            document.getElementById('gpPaycheck2Net').textContent = profitData.gpPaycheck2Net;
        }
        
        if (profitData.gpPaycheck2Bills) {
            document.getElementById('gpPaycheck2Bills').textContent = profitData.gpPaycheck2Bills;
        }
        
        if (profitData.gpPaycheck2Surplus) {
            const element = document.getElementById('gpPaycheck2Surplus');
            if (element) {
                element.textContent = profitData.gpPaycheck2Surplus;
                element.className = profitData.gpPaycheck2SurplusClass || 'font-bold';
            }
        }
        
        if (profitData.gpAnnualIncome) {
            document.getElementById('gpAnnualIncome').textContent = profitData.gpAnnualIncome;
        }
        
        if (profitData.gpAnnualBonus) {
            document.getElementById('gpAnnualBonus').textContent = profitData.gpAnnualBonus;
        }
        
        if (profitData.gpAnnualBonusTaxRate) {
            document.getElementById('gpAnnualBonusTaxRate').textContent = profitData.gpAnnualBonusTaxRate;
        }
        
        if (profitData.gpAnnualBills) {
            document.getElementById('gpAnnualBills').textContent = profitData.gpAnnualBills;
        }
        
        if (profitData.gpAnnualSurplus) {
            const element = document.getElementById('gpAnnualSurplus');
            if (element) {
                element.textContent = profitData.gpAnnualSurplus;
                element.className = profitData.gpAnnualSurplusClass || 'font-bold text-neon-blue';
            }
        }
        
        if (profitData.gpAnnualSurplusWithBonus) {
            const element = document.getElementById('gpAnnualSurplusWithBonus');
            if (element) {
                element.textContent = profitData.gpAnnualSurplusWithBonus;
                element.className = profitData.gpAnnualSurplusWithBonusClass || 'font-bold text-neon-green';
            }
        }
        
        // Set the progress bar
        if (typeof profitData.profitRatio !== 'undefined') {
            const progressBar = document.getElementById('profitProgress');
            const progressStatus = document.getElementById('profitStatus');
            
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, Math.abs(profitData.profitRatio))}%`;
                progressBar.className = `cyber-progress-fill ${profitData.progressFillColor || 'cyber-blue'}`;
            }
            
            if (progressStatus && profitData.profitStatusText) {
                progressStatus.textContent = profitData.profitStatusText;
            }
        }
        
        // Show third paycheck section if needed
        if (profitData.hasThirdPaycheckInSameMonth) {
            const thirdPaycheckSection = document.getElementById('gpThirdPaycheckSection');
            if (thirdPaycheckSection) {
                thirdPaycheckSection.classList.remove('hidden');
                
                if (profitData.gpPaycheck3Net) {
                    document.getElementById('gpPaycheck3Net').textContent = profitData.gpPaycheck3Net;
                }
                
                if (profitData.gpPaycheck3Bills) {
                    document.getElementById('gpPaycheck3Bills').textContent = profitData.gpPaycheck3Bills;
                }
                
                if (profitData.gpPaycheck3Surplus) {
                    const element = document.getElementById('gpPaycheck3Surplus');
                    if (element) {
                        element.textContent = profitData.gpPaycheck3Surplus;
                        element.className = profitData.gpPaycheck3SurplusClass || 'font-bold text-neon-green';
                    }
                }
            }
        }
    }
}

// Clear all data from localStorage and reset the application
function clearAllData() {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
        try {
            // Clear all CorpoCache data but keep other localStorage items
            localStorage.removeItem('creditCards');
            localStorage.removeItem('bills');
            localStorage.removeItem('expenses');
            localStorage.removeItem('loans');
            localStorage.removeItem('salaryData');
            localStorage.removeItem('profitData');
            localStorage.removeItem('lastSaved');
            
            // Reset arrays
            creditCards = [];
            bills = [];
            expenses = [];
            loans = [];
            salaryData = {};
            profitData = {};
            
            // Update UI
            renderCreditCards();
            updateCreditSummary();
            renderBills();
            updatePaymentSchedule();
            renderExpenses();
            updateExpenseSummary();
            if (typeof renderLoans === 'function') {
                renderLoans();
                updateLoanSummary();
            }
            
            // Hide salary and profit results
            document.getElementById('salaryResults').classList.add('hidden');
            document.getElementById('grossProfitResults').classList.add('hidden');
            
            // Reset profit container
            document.getElementById('grossProfitContainer').innerHTML = '<p class="text-center text-gray-400 py-4">Complete the Salary Calculator to see your profit analysis</p>';
            
            // Hide last saved info
            const lastSavedElement = document.getElementById('lastSavedTime');
            if (lastSavedElement) {
                lastSavedElement.classList.add('hidden');
            }
            
            alert('All data has been cleared.');
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('An error occurred while clearing your data.');
        }
    }
}

// Export data to a JSON file for backup
function exportData() {
    try {
        const data = {
            creditCards,
            bills,
            expenses, 
            loans,
            salaryData,
            profitData,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        // Create a date string for the filename
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create a download link and trigger it
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = `corpocache-backup-${dateStr}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Failed to export your data.');
    }
}

// Import data from a previously exported JSON file
function importData() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate the data structure
                if (!data.creditCards || !data.bills || !data.expenses) {
                    throw new Error('Invalid data format');
                }
                
                // Confirm import
                if (confirm('This will replace all your current data. Continue?')) {
                    // Import the data
                    creditCards = data.creditCards || [];
                    bills = data.bills || [];
                    expenses = data.expenses || [];
                    loans = data.loans || [];
                    
                    // Import salary and profit data if available
                    salaryData = data.salaryData || {};
                    profitData = data.profitData || {};
                    
                    // Update UI
                    renderCreditCards();
                    updateCreditSummary();
                    renderBills();
                    updatePaymentSchedule();
                    renderExpenses();
                    updateExpenseSummary();
                    if (typeof renderLoans === 'function') {
                        renderLoans();
                        updateLoanSummary();
                    }
                    
                    // Load salary and profit data if available
                    loadSalaryDataToUI();
                    
                    // Save the imported data to localStorage
                    saveToLocalStorage();
                    
                    alert('Data imported successfully!');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Failed to import data: Invalid file format.');
            }
        };
        reader.readAsText(file);
    };
    
    fileInput.click();
}

function updateLastSavedInfo() {
    const lastSaved = localStorage.getItem('lastSaved');
    const lastSavedElement = document.getElementById('lastSavedTime');
    
    if (lastSavedElement && lastSaved) {
        const savedDate = new Date(lastSaved);
        const now = new Date();
        
        // Format the date and time
        const options = { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        };
        const formattedDate = savedDate.toLocaleDateString(undefined, options);
        
        // Calculate time difference
        const diffMs = now - savedDate;
        const diffMins = Math.round(diffMs / 60000);
        
        let timeAgo;
        if (diffMins < 1) {
            timeAgo = 'just now';
        } else if (diffMins < 60) {
            timeAgo = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else {
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) {
                timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
            } else {
                const diffDays = Math.floor(diffHours / 24);
                timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
            }
        }
        
        lastSavedElement.textContent = `Last saved: ${formattedDate} (${timeAgo})`;
        lastSavedElement.classList.remove('hidden');
    }
}

function showSaveConfirmation() {
    const saveConfirm = document.getElementById('saveConfirmation');
    if (saveConfirm) {
        saveConfirm.classList.remove('hidden');
        setTimeout(() => {
            saveConfirm.classList.add('hidden');
        }, 2000);
    } else {
        // Create a save confirmation message if it doesn't exist
        const saveConfirm = document.createElement('div');
        saveConfirm.id = 'saveConfirmation';
        saveConfirm.className = 'fixed bottom-4 right-4 bg-glass-green p-3 rounded shadow-lg z-50 text-white cyber-text-glow transition-opacity duration-300';
        saveConfirm.innerHTML = '<i class="fas fa-save mr-2"></i> Data saved successfully';
        document.body.appendChild(saveConfirm);
        
        setTimeout(() => {
            saveConfirm.classList.add('hidden');
        }, 2000);
    }
    
    // Update the last saved info
    updateLastSavedInfo();
}

// Auto-save functionality
let autoSaveTimer;

function setupAutoSave(interval = 60000) { // Default: save every minute
    // Clear any existing timer
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    
    // Set up new timer
    autoSaveTimer = setInterval(() => {
        saveToLocalStorage();
    }, interval);
}

// Immediately check for stored data when the script loads (outside any event listener)
(function() {
    console.log("Script initialized - checking for stored data...");
    const dataLoaded = loadFromLocalStorage();
    if (dataLoaded) {
        console.log("Data loaded from localStorage successfully");
    } else {
        console.log("No saved data found in localStorage");
    }
})();

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    initElements();
    
    // Set current month and year
    updateCurrentMonthAndYear();
    
    // Try to load data from localStorage
    const dataLoaded = loadFromLocalStorage();
    
    // If no data was loaded, use sample data
    if (!dataLoaded) {
        loadSampleData();
    }
    
    // Initial renders
    renderCreditCards();
    updateCreditSummary();
    renderBills();
    updatePaymentSchedule();
    renderExpenses();
    updateExpenseSummary();
    renderLoans(); 
    updateLoanSummary(); 
    
    // Add cyber effects
    initCyberEffects();
    
    // Setup scroll detection for containers
    setupScrollDetection();
    
    // Setup auto-save (save every minute)
    setupAutoSave();
    
    // Any additional initialization that was in other DOMContentLoaded event listeners
    // Initialize gross profit calculator
    initGrossProfitCalculator();
    
    // Initialize collapsible sections
    initCollapsibleSections();
});

// Function to update the month and year display in the Monthly Bills section
function updateCurrentMonthAndYear() {
    const currentDate = new Date();
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthElement = document.getElementById('currentMonth');
    const yearElement = document.getElementById('currentYear');
    
    if (monthElement) {
        monthElement.textContent = months[currentDate.getMonth()];
    }
    
    if (yearElement) {
        yearElement.textContent = currentDate.getFullYear();
    }
}

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
    window.healthInsurance = document.getElementById('healthInsurance');
    window.dentalInsurance = document.getElementById('dentalInsurance');
    window.visionInsurance = document.getElementById('visionInsurance');
    window.salaryResults = document.getElementById('salaryResults');
    
    // Savings Estimator Elements
    window.monthlyIncome = document.getElementById('monthlyIncome');
    window.savingsGoal = document.getElementById('savingsGoal');
    window.currentSavings = document.getElementById('currentSavings');
    window.savingsInterest = document.getElementById('savingsInterest');
    window.savingsResults = document.getElementById('savingsResults');
    
    // Initialize gross profit calculator
    initGrossProfitCalculator();
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
    document.getElementById('cardName').value = '';
    document.getElementById('creditLimit').value = '';
    document.getElementById('currentBalance').value = '';
    document.getElementById('openDate').value = '';
    document.getElementById('cardDueDate').value = '';
    document.getElementById('editCardIndex').value = '-1';
    
    // Hide any previous validation errors
    document.getElementById('cardValidationErrors').classList.add('hidden');
    document.getElementById('cardErrorList').innerHTML = '';
    
    document.getElementById('creditCardModal').classList.remove('hidden');
}

window.editCreditCard = function(index) {
    document.getElementById('creditCardModalTitle').textContent = 'Edit Credit Card';
    const card = creditCards[index];
    
    document.getElementById('cardName').value = card.name;
    document.getElementById('creditLimit').value = card.limit;
    document.getElementById('currentBalance').value = card.balance;
    
    // Set the open date if it exists
    if (card.openDate) {
        document.getElementById('openDate').value = card.openDate;
    } else {
        document.getElementById('openDate').value = '';
    }
    
    // Set the due date if it exists
    if (card.dueDate) {
        document.getElementById('cardDueDate').value = card.dueDate;
    } else {
        document.getElementById('cardDueDate').value = '';
    }
    
    document.getElementById('editCardIndex').value = index;
    
    // Hide any previous validation errors
    document.getElementById('cardValidationErrors').classList.add('hidden');
    document.getElementById('cardErrorList').innerHTML = '';
    
    document.getElementById('creditCardModal').classList.remove('hidden');
}

window.closeCreditCardModal = function() {
    document.getElementById('creditCardModal').classList.add('hidden');
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
    
    // Save data to localStorage
    saveToLocalStorage();
    
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
                oldestCreditLine.innerHTML = `<span class="text-neon-pink">${months}</span> <span class="text-gray-400 text-sm">months</span>`;
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
    
    // Save changes to localStorage
    saveToLocalStorage();
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
    document.getElementById('billName').value = '';
    document.getElementById('billAmount').value = '';
    document.getElementById('billDueDate').value = '';
    document.getElementById('billType').value = 'housing';
    document.getElementById('editBillIndex').value = '-1';
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    document.getElementById('billModal').classList.remove('hidden');
}

window.editBill = function(index) {
    document.getElementById('billModalTitle').textContent = 'Edit Monthly Bill';
    const bill = bills[index];
    
    document.getElementById('billName').value = bill.name;
    document.getElementById('billAmount').value = bill.amount;
    document.getElementById('billDueDate').value = bill.dueDate;
    // Set bill type if it exists, otherwise default to 'other'
    document.getElementById('billType').value = bill.type || 'other';
    
    document.getElementById('editBillIndex').value = index;
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    document.getElementById('billModal').classList.remove('hidden');
}

window.closeBillModal = function() {
    document.getElementById('billModal').classList.add('hidden');
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
        priority: 'normal', // Set default priority since we removed the field
        isPaid: false // Add isPaid property, default to false
    };
    
    const editIndex = parseInt(document.getElementById('editBillIndex').value);
    
    if (editIndex >= 0 && editIndex < bills.length) {
        // Edit existing bill, preserve the paid status if it exists
        bill.isPaid = bills[editIndex].isPaid || false;
        // Also preserve the existing priority if available
        if (bills[editIndex].priority) {
            bill.priority = bills[editIndex].priority;
        }
        bills[editIndex] = bill;
    } else {
        // Add new bill
        bills.push(bill);
    }
    
    renderBills();
    updatePaymentSchedule();
    updateExpenseSummary();
    closeBillModal();
    
    // Save data to localStorage
    saveToLocalStorage();
    
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
    
    // Save changes to localStorage
    saveToLocalStorage();
    
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
    
    // Get required DOM elements, with null checks
    const paycheck1Bills = document.getElementById('paycheck1Bills');
    const paycheck2Bills = document.getElementById('paycheck2Bills');
    const paycheck1Total = document.getElementById('paycheck1Total');
    const paycheck2Total = document.getElementById('paycheck2Total');
    
    // Update bill names in payment schedule
    if (paycheck1Bills) {
        paycheck1Bills.textContent = paycheck1.length > 0 ? 
            paycheck1.map(bill => bill.name).join(', ') : 'No bills scheduled';
    }
    
    if (paycheck2Bills) {
        paycheck2Bills.textContent = paycheck2.length > 0 ? 
            paycheck2.map(bill => bill.name).join(', ') : 'No bills scheduled';
    }
    
    // Update total amounts with neon pink color
    if (paycheck1Total) {
        paycheck1Total.innerHTML = `<span class="text-neon-pink">$${paycheck1TotalAmount.toFixed(2)}</span>`;
    }
    
    if (paycheck2Total) {
        paycheck2Total.innerHTML = `<span class="text-neon-pink">$${paycheck2TotalAmount.toFixed(2)}</span>`;
    }
    
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
    
    const paycheck1Remaining = document.getElementById('paycheck1Remaining');
    const paycheck2Remaining = document.getElementById('paycheck2Remaining');
    const totalRemaining = document.getElementById('totalRemaining');
    const totalBills = document.getElementById('totalBills');
    
    if (paycheck1Remaining) {
        paycheck1Remaining.innerHTML = `<span class="${paycheck1RemainingClass}">$${paycheck1RemainingAmount.toFixed(2)}</span>`;
    }
    
    if (paycheck2Remaining) {
        paycheck2Remaining.innerHTML = `<span class="${paycheck2RemainingClass}">$${paycheck2RemainingAmount.toFixed(2)}</span>`;
    }
    
    if (totalRemaining) {
        totalRemaining.innerHTML = `<span class="${totalRemainingClass}">$${totalRemainingAmount.toFixed(2)}</span>`;
    }
    
    // Update total bills count
    if (totalBills) {
        totalBills.textContent = bills.length;
    }
    
    // Call updateExpenseSummary with a null check
    try {
        updateExpenseSummary();
    } catch (e) {
        // Silently handle errors
    }
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
    
    // Save data to localStorage
    saveToLocalStorage();
}

function renderExpenses() {
    // Add null check for expensesContainer
    const expensesContainerElement = document.getElementById('expensesContainer');
    if (!expensesContainerElement) {
        // Silently return if the container is not found
        return;
    }
    
    if (expenses.length === 0) {
        expensesContainerElement.innerHTML = '<p class="text-gray-400 text-center py-2">No expenses added yet</p>';
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
    
    expensesContainerElement.innerHTML = html;
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
    
    // Save changes to localStorage
    saveToLocalStorage();
}

function updateExpenseSummary() {
    const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const total = totalBills + totalExpenses;
    
    // Get DOM elements with null checks
    const totalBillsAmountElement = document.getElementById('totalBillsAmount');
    const totalExpensesAmountElement = document.getElementById('totalExpensesAmount');
    const totalOutgoingsElement = document.getElementById('totalOutgoings');
    
    if (totalBillsAmountElement) {
        totalBillsAmountElement.textContent = `$${totalBills.toFixed(2)}`;
    }
    
    if (totalExpensesAmountElement) {
        totalExpensesAmountElement.textContent = `$${totalExpenses.toFixed(2)}`;
    }
    
    if (totalOutgoingsElement) {
        totalOutgoingsElement.textContent = `$${total.toFixed(2)}`;
    }
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
    
    // Insurance costs (dollar amounts per pay period)
    const healthCost = parseFloat(healthInsurance.value) || 0;
    const dentalCost = parseFloat(dentalInsurance.value) || 0;
    const visionCost = parseFloat(visionInsurance.value) || 0;
    const totalInsuranceCost = healthCost + dentalCost + visionCost;
    
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
    
    // Calculate net pay after all deductions including insurance
    const netPay = grossPerPeriod - totalTaxAmount - retirementAmount - esppAmount - totalInsuranceCost;
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
    
    // Update the insurance amounts
    document.getElementById('healthAmount').textContent = `$${healthCost.toFixed(2)}`;
    document.getElementById('dentalAmount').textContent = `$${dentalCost.toFixed(2)}`;
    document.getElementById('visionAmount').textContent = `$${visionCost.toFixed(2)}`;
    document.getElementById('insuranceTotal').textContent = `$${totalInsuranceCost.toFixed(2)}`;
    
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

// Function to check if all bills are marked as paid
function areAllBillsPaid() {
    return bills.every(bill => bill.isPaid === true);
}

// Function to show the complete month confirmation modal
window.completeMonthConfirm = function() {
    const allPaid = areAllBillsPaid();
    
    // Show the appropriate message based on whether all bills are paid
    document.getElementById('completeMonthMessage').classList.toggle('hidden', allPaid);
    document.getElementById('allPaidMessage').classList.toggle('hidden', !allPaid);
    
    // Show the modal
    document.getElementById('completeMonthModal').classList.remove('hidden');
}

// Function to close the complete month modal
window.closeCompleteMonthModal = function() {
    document.getElementById('completeMonthModal').classList.add('hidden');
}

// Function to complete the month and reset all bills
window.completeMonth = function() {
    const allPaid = areAllBillsPaid();
    
    // If not all bills are paid, mark them as paid
    if (!allPaid) {
        // Mark all bills as paid
        bills.forEach(bill => {
            bill.isPaid = true;
        });
        
        // Re-render bills to update the UI
        renderBills();
        
        // Update the payment schedule
        updatePaymentSchedule();
        
        // Reset all payments after a slight delay to show that all bills were marked as paid
        setTimeout(() => {
            resetAllPayments();
            // Update the month and year display
            updateCurrentMonthAndYear();
            // Close the modal
            closeCompleteMonthModal();
        }, 800);
    } else {
        // All bills are already paid, just reset
        resetAllPayments();
        // Update the month and year display
        updateCurrentMonthAndYear();
        // Close the modal
        closeCompleteMonthModal();
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

// Salary Modal Functions
window.showSalaryModal = function() {
    // Check if the salary results are already displayed
    const salaryResults = document.getElementById('salaryResults');
    const hasExistingData = salaryResults && !salaryResults.classList.contains('hidden');
    const calculateButton = document.querySelector('#salaryModal button.cyber-primary-btn');
    
    // Get all the required elements safely first
    const annualSalaryElement = document.getElementById('annualSalary');
    const bonusAmountElement = document.getElementById('bonusAmount');
    const bonusTaxRateElement = document.getElementById('bonusTaxRate');
    const retirementAmountElement = document.getElementById('retirementAmount');
    const esppAmountElement = document.getElementById('esppAmount');
    const healthAmountElement = document.getElementById('healthAmount');
    const dentalAmountElement = document.getElementById('dentalAmount');
    const visionAmountElement = document.getElementById('visionAmount');
    const payFrequencyElement = document.getElementById('payFrequency');
    
    if (hasExistingData && annualSalaryElement && annualSalaryElement.textContent) {
        // If we have existing salary data, transfer current values to the modal
        
        // Get annual salary directly instead of calculating from gross pay per period
        const annualSalary = parseFloat(annualSalaryElement.textContent.replace('$', ''));
        
        // Set gross salary from the stored annual value
        document.getElementById('modalGrossSalary').value = annualSalary;
        
        // Set pay frequency from previous value (either 24 for Semi-Monthly or 26 for Bi-Weekly)
        const payFrequencyValue = payFrequencyElement ? payFrequencyElement.value : '26';
        document.getElementById('modalPayFrequency').value = payFrequencyValue === '24' ? '24' : '26';
        
        // Check if we need to show the last pay date field
        toggleLastPayDateField();
        
        // Get bonus percentage from the display (divide by annual salary)
        if (bonusAmountElement && bonusAmountElement.textContent) {
            const bonusAmount = parseFloat(bonusAmountElement.textContent.replace('$', ''));
            const bonusPct = (bonusAmount / annualSalary) * 100;
            document.getElementById('modalBonusPercentage').value = bonusPct.toFixed(2);
        }
        
        // Set the bonus tax rate from the display, preserving the current value
        if (bonusTaxRateElement && bonusTaxRateElement.textContent) {
            const bonusTaxRateText = bonusTaxRateElement.textContent.replace(/[()%]/g, '').trim();
            const bonusTaxRate = parseFloat(bonusTaxRateText) || 25;
            document.getElementById('modalBonusTax').value = bonusTaxRate;
        }
        
        // For retirement and ESPP, calculate back from the amount shown
        if (payFrequencyElement) {
            const periods = parseInt(payFrequencyValue) || 26;
            const grossPerPeriod = annualSalary / periods;
            
            if (retirementAmountElement && retirementAmountElement.textContent) {
                const retirementAmount = parseFloat(retirementAmountElement.textContent.replace('$', ''));
                const retirementPct = (retirementAmount / grossPerPeriod) * 100;
                document.getElementById('modalRetirementContribution').value = retirementPct.toFixed(2);
            }
            
            if (esppAmountElement && esppAmountElement.textContent) {
                const esppAmount = parseFloat(esppAmountElement.textContent.replace('$', ''));
                const esppPct = (esppAmount / grossPerPeriod) * 100;
                document.getElementById('modalEsppContribution').value = esppPct.toFixed(2);
            }
        }
        
        // For insurance, just copy over the current values
        if (healthAmountElement && healthAmountElement.textContent) {
            document.getElementById('modalHealthInsurance').value = parseFloat(healthAmountElement.textContent.replace('$', ''));
        }
        
        if (dentalAmountElement && dentalAmountElement.textContent) {
            document.getElementById('modalDentalInsurance').value = parseFloat(dentalAmountElement.textContent.replace('$', ''));
        }
        
        if (visionAmountElement && visionAmountElement.textContent) {
            document.getElementById('modalVisionInsurance').value = parseFloat(visionAmountElement.textContent.replace('$', ''));
        }
        
        // Load the last pay date if we have it stored
        const lastPayDate = localStorage.getItem('lastPayDate');
        const modalPayFrequency = document.getElementById('modalPayFrequency');
        if (lastPayDate && modalPayFrequency && modalPayFrequency.value === '26') {
            const lastPayDateInput = document.getElementById('lastPayDate');
            if (lastPayDateInput) {
                lastPayDateInput.value = lastPayDate;
            }
        }
        
        // Update button text
        if (calculateButton) {
            calculateButton.textContent = 'Update Salary';
        }
    } else {
        // For new calculations, set default values
        const grossSalaryElement = document.getElementById('grossSalary');
        document.getElementById('modalGrossSalary').value = grossSalaryElement && grossSalaryElement.value ? grossSalaryElement.value : '';
        document.getElementById('modalPayFrequency').value = '26'; // Default to Bi-Weekly
        document.getElementById('modalBonusPercentage').value = 10;
        document.getElementById('modalBonusTax').value = 25;
        document.getElementById('modalTaxBracket').value = 'single';
        document.getElementById('modalRetirementContribution').value = 10;
        document.getElementById('modalEsppContribution').value = 10;
        document.getElementById('modalHealthInsurance').value = 0;
        document.getElementById('modalDentalInsurance').value = 0;
        document.getElementById('modalVisionInsurance').value = 0;
        
        // Set a default last pay date to today
        const lastPayDateInput = document.getElementById('lastPayDate');
        if (lastPayDateInput) {
            lastPayDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Show/hide last pay date field based on pay frequency
        toggleLastPayDateField();
        
        // Set button text for initial calculation
        if (calculateButton) {
            calculateButton.textContent = 'Calculate';
        }
    }
    
    // Set up event handler for pay frequency selection
    const modalPayFrequency = document.getElementById('modalPayFrequency');
    if (modalPayFrequency) {
        modalPayFrequency.addEventListener('change', function() {
            // Toggle last pay date field
            toggleLastPayDateField();
            
            // Hide the gross profit results if they're visible
            const grossProfitResults = document.getElementById('grossProfitResults');
            if (grossProfitResults && !grossProfitResults.classList.contains('hidden')) {
                grossProfitResults.classList.add('hidden');
            }
            
            // Reset the container with a message to recalculate
            const grossProfitContainer = document.getElementById('grossProfitContainer');
            if (grossProfitContainer) {
                grossProfitContainer.innerHTML = '<p class="text-center text-gray-400 py-4">Pay frequency changed. Please recalculate your salary.</p>';
            }
            
            // --- Fix: update hidden payFrequency field temporarily ---
            const hiddenPayFrequency = document.getElementById('payFrequency');
            const originalValue = hiddenPayFrequency ? hiddenPayFrequency.value : null;
            if (hiddenPayFrequency) {
                hiddenPayFrequency.value = this.value;
            }
            
            // Only call calculate if it's defined
            if (typeof calculateGrossProfit === 'function') {
                calculateGrossProfit();
            }
            
            if (hiddenPayFrequency && originalValue !== null) {
                hiddenPayFrequency.value = originalValue;
            }
        });
    }
    
    const salaryModal = document.getElementById('salaryModal');
    if (salaryModal) {
        salaryModal.classList.remove('hidden');
    }
}

// Function to toggle the visibility of the last pay date field based on pay frequency
function toggleLastPayDateField() {
    const payFrequency = document.getElementById('modalPayFrequency').value;
    const lastPayDateContainer = document.getElementById('lastPayDateContainer');
    
    if (payFrequency === '26') {
        // Show last pay date field for bi-weekly pay
        lastPayDateContainer.classList.remove('hidden');
    } else {
        // Hide last pay date field for other pay frequencies
        lastPayDateContainer.classList.add('hidden');
    }
    
    // Reset the gross profit results when pay frequency changes
    const grossProfitResults = document.getElementById('grossProfitResults');
    if (grossProfitResults && !grossProfitResults.classList.contains('hidden')) {
        grossProfitResults.classList.add('hidden');
    }
    
    // Reset the container with a message to recalculate
    const grossProfitContainer = document.getElementById('grossProfitContainer');
    if (grossProfitContainer) {
        grossProfitContainer.innerHTML = '<p class="text-center text-gray-400 py-4">Pay frequency changed. Please recalculate your salary.</p>';
    }
}

// Function to calculate salary from modal inputs
window.calculateSalaryFromModal = function() {
    // Get input values
    const gross = parseFloat(document.getElementById('modalGrossSalary').value);
    const periods = parseInt(document.getElementById('modalPayFrequency').value);
    const bonusPct = parseFloat(document.getElementById('modalBonusPercentage').value);
    const bonusTaxRate = parseFloat(document.getElementById('modalBonusTax').value) || 25;
    const filingStatus = document.getElementById('modalTaxBracket').value;
    const retirementPct = parseFloat(document.getElementById('modalRetirementContribution').value);
    const esppPct = parseFloat(document.getElementById('modalEsppContribution').value);
    
    // Get state selection and tax rate
    const stateSelect = document.getElementById('modalState');
    const stateTaxPct = parseFloat(stateSelect.options[stateSelect.selectedIndex].text.match(/\(([^)]+)%\)/)?.[1]) || 0;
    
    // Fixed rates for OASDI and Medicare
    const oasdiTaxPct = 6.2;
    const medicareTaxPct = 1.45;
    
    // Insurance costs (dollar amounts per pay period)
    const healthCost = parseFloat(document.getElementById('modalHealthInsurance').value) || 0;
    const dentalCost = parseFloat(document.getElementById('modalDentalInsurance').value) || 0;
    const visionCost = parseFloat(document.getElementById('modalVisionInsurance').value) || 0;
    const totalInsuranceCost = healthCost + dentalCost + visionCost;
    
    // Validation
    if (isNaN(gross) || gross <= 0) {
        alert('Please enter a valid gross salary');
        return;
    }
    
    // Perform calculations
    const grossPerPeriod = gross / periods;
    const federalTaxPerYear = calculateFederalTax(gross, filingStatus);
    const federalTaxAmount = federalTaxPerYear / periods;
    const effectiveFederalRate = calculateEffectiveTaxRate(gross, filingStatus);
    
    // OASDI has a wage cap (for 2025, using estimated $168,600)
    const oasdiWageCap = 168600;
    const oasdiTaxAmount = Math.min(grossPerPeriod, oasdiWageCap / periods) * (oasdiTaxPct / 100);
    
    // Medicare has no wage cap, but higher income has additional 0.9% 
    let medicareTaxAmount = grossPerPeriod * (medicareTaxPct / 100);
    if (gross > 200000) {
        const excessAmount = (gross - 200000) / periods;
        medicareTaxAmount += excessAmount * (0.9 / 100);
    }
    
    // State tax calculation
    const stateTaxAmount = grossPerPeriod * (stateTaxPct / 100);
    
    // Retirement and ESPP contributions
    const retirementAmount = grossPerPeriod * (retirementPct / 100);
    const esppAmount = grossPerPeriod * (esppPct / 100);
    const savingsTotal = retirementAmount + esppAmount;
    
    // Calculate net pay after all deductions
    const totalTaxAmount = federalTaxAmount + oasdiTaxAmount + medicareTaxAmount + stateTaxAmount;
    const netPay = grossPerPeriod - totalTaxAmount - retirementAmount - esppAmount - totalInsuranceCost;
    const bonusAmount = gross * (bonusPct / 100);
    
    // Calculate after-tax bonus amount with flat tax rate
    const afterTaxBonusAmount = bonusAmount * (1 - (bonusTaxRate / 100));
    
    // Handle bi-weekly pay date
    if (periods === 26) {
        const lastPayDate = document.getElementById('lastPayDate').value;
        if (lastPayDate) {
            localStorage.setItem('lastPayDate', lastPayDate);
        }
    } else {
        localStorage.removeItem('lastPayDate');
    }
    
    // Update hidden pay frequency field
    if (!document.getElementById('payFrequency')) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.id = 'payFrequency';
        hiddenField.value = periods;
        document.body.appendChild(hiddenField);
    } else {
        document.getElementById('payFrequency').value = periods;
    }
    
    // Update the UI with calculated values
    document.getElementById('annualSalary').textContent = `$${gross.toFixed(2)}`;
    document.getElementById('grossPay').textContent = `$${grossPerPeriod.toFixed(2)}`;
    document.getElementById('federalTaxRate').textContent = `(${effectiveFederalRate.toFixed(2)}%)`;
    document.getElementById('oasdiRate').textContent = `(${oasdiTaxPct}%)`;
    document.getElementById('medicareRate').textContent = `(${medicareTaxPct}%)`;
    document.getElementById('stateRate').textContent = `(${stateTaxPct}%)`;
    document.getElementById('federalTaxAmount').textContent = `$${federalTaxAmount.toFixed(2)}`;
    document.getElementById('oasdiTaxAmount').textContent = `$${oasdiTaxAmount.toFixed(2)}`;
    document.getElementById('medicareTaxAmount').textContent = `$${medicareTaxAmount.toFixed(2)}`;
    document.getElementById('stateTaxAmount').textContent = `$${stateTaxAmount.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${totalTaxAmount.toFixed(2)}`;
    document.getElementById('retirementAmount').textContent = `$${retirementAmount.toFixed(2)}`;
    document.getElementById('esppAmount').textContent = `$${esppAmount.toFixed(2)}`;
    document.getElementById('savingsTotal').textContent = `$${savingsTotal.toFixed(2)}`;
    document.getElementById('healthAmount').textContent = `$${healthCost.toFixed(2)}`;
    document.getElementById('dentalAmount').textContent = `$${dentalCost.toFixed(2)}`;
    document.getElementById('visionAmount').textContent = `$${visionCost.toFixed(2)}`;
    document.getElementById('insuranceTotal').textContent = `$${totalInsuranceCost.toFixed(2)}`;
    document.getElementById('netPay').textContent = `$${netPay.toFixed(2)}`;
    document.getElementById('bonusAmount').textContent = `$${bonusAmount.toFixed(2)}`;
    document.getElementById('afterTaxBonusAmount').textContent = `$${afterTaxBonusAmount.toFixed(2)}`;
    document.getElementById('bonusTaxRate').textContent = `(${bonusTaxRate}% tax)`;
    
    // Update the Calculate Salary button text and handler
    const calculateButton = document.querySelector('button[onclick="showSalaryModal()"]');
    if (calculateButton) {
        calculateButton.innerHTML = '<i class="fas fa-calculator mr-1"></i> Update Salary';
        calculateButton.setAttribute('onclick', 'showSalaryModal(true)');
    }
    
    // Show results and close modal
    document.getElementById('salaryResults').classList.remove('hidden');
    closeSalaryModal();
    
    // Update monthly income in savings estimator if available
    const monthlyIncomeElement = document.getElementById('monthlyIncome');
    if (monthlyIncomeElement && !monthlyIncomeElement.value && netPay > 0) {
        monthlyIncomeElement.value = (netPay * periods / 12).toFixed(2);
    }
    
    // Save salary data to our global object
    salaryData = {
        annualSalary: `$${gross.toFixed(2)}`,
        grossPay: `$${grossPerPeriod.toFixed(2)}`,
        netPay: `$${netPay.toFixed(2)}`,
        bonusAmount: `$${bonusAmount.toFixed(2)}`,
        afterTaxBonusAmount: `$${afterTaxBonusAmount.toFixed(2)}`,
        federalTaxAmount: `$${federalTaxAmount.toFixed(2)}`,
        oasdiTaxAmount: `$${oasdiTaxAmount.toFixed(2)}`,
        medicareTaxAmount: `$${medicareTaxAmount.toFixed(2)}`,
        stateTaxAmount: `$${stateTaxAmount.toFixed(2)}`,
        taxAmount: `$${totalTaxAmount.toFixed(2)}`,
        retirementAmount: `$${retirementAmount.toFixed(2)}`,
        esppAmount: `$${esppAmount.toFixed(2)}`,
        savingsTotal: `$${savingsTotal.toFixed(2)}`,
        healthAmount: `$${healthCost.toFixed(2)}`,
        dentalAmount: `$${dentalCost.toFixed(2)}`,
        visionAmount: `$${visionCost.toFixed(2)}`,
        insuranceTotal: `$${totalInsuranceCost.toFixed(2)}`,
        federalTaxRate: `(${effectiveFederalRate.toFixed(2)}%)`,
        oasdiRate: `(${oasdiTaxPct}%)`,
        medicareRate: `(${medicareTaxPct}%)`,
        stateRate: `(${stateTaxPct}%)`,
        bonusTaxRate: `(${bonusTaxRate}% tax)`,
        payFrequency: periods,
        gross: gross,
        filingStatus: filingStatus
    };
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Then calculate gross profit
    calculateGrossProfit();
}

// Function to calculate gross profit based on salary and bills data
function calculateGrossProfit() {
    // Check if salary data is available
    const netPayElement = document.getElementById('netPay');
    if (!netPayElement) return;
    
    const netPayText = netPayElement.textContent.replace('$', '').trim();
    const netPayPerPaycheck = parseFloat(netPayText) || 0;
    
    if (netPayPerPaycheck <= 0) {
        return;
    }
    
    // Clear the initial message
    const grossProfitContainer = document.getElementById('grossProfitContainer');
    if (grossProfitContainer) {
        grossProfitContainer.innerHTML = '';
    }
    
    // Get pay frequency and calculate monthly income
    const payFrequency = parseInt(document.getElementById('payFrequency')?.value) || 26;
    
    // Calculate monthly income based on pay frequency
    let payPerMonth;
    if (payFrequency === 26) {
        payPerMonth = netPayPerPaycheck * 26 / 12;
    } else {
        payPerMonth = netPayPerPaycheck * payFrequency / 12;
    }
    
    // Get annual salary and bonus
    const annualSalaryText = document.getElementById('annualSalary').textContent.replace('$', '').trim();
    const annualSalary = parseFloat(annualSalaryText) || 0;
    
    // Get the after-tax bonus amount
    const afterTaxBonusText = document.getElementById('afterTaxBonusAmount').textContent.replace('$', '').trim();
    const afterTaxBonus = parseFloat(afterTaxBonusText) || 0;
    
    // Get the bonus tax rate from the UI
    const bonusTaxRateText = document.getElementById('bonusTaxRate').textContent.replace(/[()%]/g, '').trim().split(' ')[0];
    const bonusTaxRate = parseFloat(bonusTaxRateText) || 25;
    
    // Update the annual bonus tax rate display
    const gpAnnualBonusTaxRate = document.getElementById('gpAnnualBonusTaxRate');
    if (gpAnnualBonusTaxRate) {
        gpAnnualBonusTaxRate.textContent = `${bonusTaxRate}%`;
    }
    
    // Get bills information
    // Split bills between two paychecks (15th and end of month)
    const paycheck1Bills = bills.filter(bill => bill.dueDate <= 15);
    const paycheck2Bills = bills.filter(bill => bill.dueDate > 15);
    
    // Calculate bills amounts
    const paycheck1BillsAmount = paycheck1Bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const paycheck2BillsAmount = paycheck2Bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const totalMonthlyBills = paycheck1BillsAmount + paycheck2BillsAmount;
    const annualBills = totalMonthlyBills * 12;
    
    // Calculate per-paycheck amounts
    let payPerPaycheck;
    
    if (payFrequency === 26) {
        payPerPaycheck = netPayPerPaycheck;
    } else {
        payPerPaycheck = payPerMonth * 12 / payFrequency;
    }
    
    // Calculate surplus/deficit for regular paychecks
    const paycheck1Surplus = payPerPaycheck - paycheck1BillsAmount;
    const paycheck2Surplus = payPerPaycheck - paycheck2BillsAmount;
    
    // Calculate third paycheck surplus (no bills assigned to it, pure income)
    const paycheck3Surplus = payPerPaycheck;
    
    const monthlySurplus = payPerMonth - totalMonthlyBills;
    
    // For annual surplus, we use the total annual income (based on frequency)
    const annualNetIncome = netPayPerPaycheck * payFrequency;
    const annualSurplus = annualNetIncome - annualBills;
    const annualSurplusWithBonus = annualSurplus + afterTaxBonus;
    
    // Calculate profit ratio for progress bar (as a percentage)
    const profitRatio = totalMonthlyBills > 0 ? Math.min(100, Math.max(0, monthlySurplus / totalMonthlyBills * 100)) : 0;
    
    // Update UI elements
    const gpMonthlyIncome = document.getElementById('gpMonthlyIncome');
    const gpMonthlyBills = document.getElementById('gpMonthlyBills');
    const gpMonthlySurplus = document.getElementById('gpMonthlySurplus');
    const gpPaycheck1Net = document.getElementById('gpPaycheck1Net');
    const gpPaycheck1Bills = document.getElementById('gpPaycheck1Bills');
    const gpPaycheck1Surplus = document.getElementById('gpPaycheck1Surplus');
    const gpPaycheck2Net = document.getElementById('gpPaycheck2Net');
    const gpPaycheck2Bills = document.getElementById('gpPaycheck2Bills');
    const gpPaycheck2Surplus = document.getElementById('gpPaycheck2Surplus');
    const gpPaycheck3Net = document.getElementById('gpPaycheck3Net');
    const gpPaycheck3Bills = document.getElementById('gpPaycheck3Bills');
    const gpPaycheck3Surplus = document.getElementById('gpPaycheck3Surplus');
    const gpAnnualIncome = document.getElementById('gpAnnualIncome');
    const gpAnnualBonus = document.getElementById('gpAnnualBonus');
    const gpAnnualBills = document.getElementById('gpAnnualBills');
    const gpAnnualSurplus = document.getElementById('gpAnnualSurplus');
    const gpAnnualSurplusWithBonus = document.getElementById('gpAnnualSurplusWithBonus');
    const profitProgress = document.getElementById('profitProgress');
    const profitStatus = document.getElementById('profitStatus');
    const grossProfitResults = document.getElementById('grossProfitResults');
    
    // Update UI with calculated values
    if (gpMonthlyIncome) gpMonthlyIncome.textContent = `$${payPerMonth.toFixed(2)}`;
    if (gpMonthlyBills) gpMonthlyBills.textContent = `$${totalMonthlyBills.toFixed(2)}`;
    
    // Set color based on surplus or deficit
    const monthlySurplusColor = monthlySurplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpMonthlySurplus) {
        gpMonthlySurplus.className = `font-bold ${monthlySurplusColor}`;
        // Display the surplus as positive or deficit as negative
        const monthlySurplusSign = monthlySurplus >= 0 ? "" : "-";
        gpMonthlySurplus.textContent = `${monthlySurplusSign}$${Math.abs(monthlySurplus).toFixed(2)}`;
    }
    
    // Variable to track if we have a third paycheck in the same month
    let hasThirdPaycheckInSameMonth = false;
    
    if (payFrequency === 26) {
        // Check if we have a third paycheck in the same month
        const lastPayDate = localStorage.getItem('lastPayDate');
        if (lastPayDate) {
            const payDate = new Date(lastPayDate);
            const today = new Date();
            
            // For simplicity, we'll just check if the current month has 3 paycheck weeks
            // This is a placeholder for actual third paycheck detection logic
            hasThirdPaycheckInSameMonth = (today.getMonth() % 2 === 0);
        }
    }
    
    // Update paycheck values
    if (gpPaycheck1Net) gpPaycheck1Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
    if (gpPaycheck1Bills) gpPaycheck1Bills.textContent = `$${paycheck1BillsAmount.toFixed(2)}`;
    
    const paycheck1SurplusColor = paycheck1Surplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpPaycheck1Surplus) {
        gpPaycheck1Surplus.className = `font-bold ${paycheck1SurplusColor}`;
        const paycheck1SurplusSign = paycheck1Surplus >= 0 ? "" : "-";
        gpPaycheck1Surplus.textContent = `${paycheck1SurplusSign}$${Math.abs(paycheck1Surplus).toFixed(2)}`;
    }
    
    if (gpPaycheck2Net) gpPaycheck2Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
    if (gpPaycheck2Bills) gpPaycheck2Bills.textContent = `$${paycheck2BillsAmount.toFixed(2)}`;
    
    const paycheck2SurplusColor = paycheck2Surplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpPaycheck2Surplus) {
        gpPaycheck2Surplus.className = `font-bold ${paycheck2SurplusColor}`;
        const paycheck2SurplusSign = paycheck2Surplus >= 0 ? "" : "-";
        gpPaycheck2Surplus.textContent = `${paycheck2SurplusSign}$${Math.abs(paycheck2Surplus).toFixed(2)}`;
    }
    
    // Update third paycheck section if applicable
    const gpThirdPaycheckSection = document.getElementById('gpThirdPaycheckSection');
    if (payFrequency === 26 && hasThirdPaycheckInSameMonth && gpThirdPaycheckSection) {
        gpThirdPaycheckSection.classList.remove('hidden');
        if (gpPaycheck3Net) gpPaycheck3Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
        if (gpPaycheck3Bills) gpPaycheck3Bills.textContent = `$0.00`;
        
        if (gpPaycheck3Surplus) {
            gpPaycheck3Surplus.className = "font-bold text-neon-green";
            gpPaycheck3Surplus.textContent = `$${paycheck3Surplus.toFixed(2)}`;
        }
    } else if (gpThirdPaycheckSection) {
        gpThirdPaycheckSection.classList.add('hidden');
    }
    
    // Update annual projections
    if (gpAnnualIncome) gpAnnualIncome.textContent = `$${annualNetIncome.toFixed(2)}`;
    if (gpAnnualBonus) gpAnnualBonus.textContent = `$${afterTaxBonus.toFixed(2)}`;
    if (gpAnnualBills) gpAnnualBills.textContent = `$${annualBills.toFixed(2)}`;
    
    const annualSurplusColor = annualSurplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpAnnualSurplus) {
        gpAnnualSurplus.className = `font-bold ${annualSurplusColor}`;
        const annualSurplusSign = annualSurplus >= 0 ? "" : "-";
        gpAnnualSurplus.textContent = `${annualSurplusSign}$${Math.abs(annualSurplus).toFixed(2)}`;
    }
    
    const annualSurplusWithBonusColor = annualSurplusWithBonus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpAnnualSurplusWithBonus) {
        gpAnnualSurplusWithBonus.className = `font-bold ${annualSurplusWithBonusColor}`;
        const annualSurplusWithBonusSign = annualSurplusWithBonus >= 0 ? "" : "-";
        gpAnnualSurplusWithBonus.textContent = `${annualSurplusWithBonusSign}$${Math.abs(annualSurplusWithBonus).toFixed(2)}`;
    }
    
    // Update progress bar
    const progressFillColor = monthlySurplus >= 0 ? "cyber-green" : "cyber-pink";
    if (profitProgress) {
        profitProgress.className = `cyber-progress-fill ${progressFillColor}`;
        profitProgress.style.width = `${Math.min(100, Math.abs(profitRatio))}%`;
    }
    
    // Update status text
    let profitStatusText = '';
    if (monthlySurplus >= 0) {
        const savingRate = (monthlySurplus / payPerMonth * 100).toFixed(1);
        profitStatusText = `You're saving ${savingRate}% of your monthly income (surplus: $${monthlySurplus.toFixed(2)})`;
    } else {
        const deficit = Math.abs(monthlySurplus);
        const deficitRate = (deficit / totalMonthlyBills * 100).toFixed(1);
        profitStatusText = `You're spending ${deficitRate}% more than your income (deficit: $${deficit.toFixed(2)})`;
    }
    if (profitStatus) profitStatus.textContent = profitStatusText;
    
    // Store profit calculation data
    profitData = {
        gpMonthlyIncome: `$${payPerMonth.toFixed(2)}`,
        gpMonthlyBills: `$${totalMonthlyBills.toFixed(2)}`,
        gpMonthlySurplus: `${monthlySurplus >= 0 ? '' : '-'}$${Math.abs(monthlySurplus).toFixed(2)}`,
        gpMonthlySurplusClass: `font-bold ${monthlySurplusColor}`,
        
        gpPaycheck1Net: `$${payPerPaycheck.toFixed(2)}`,
        gpPaycheck1Bills: `$${paycheck1BillsAmount.toFixed(2)}`,
        gpPaycheck1Surplus: `${paycheck1Surplus >= 0 ? '' : '-'}$${Math.abs(paycheck1Surplus).toFixed(2)}`,
        gpPaycheck1SurplusClass: `font-bold ${paycheck1SurplusColor}`,
        
        gpPaycheck2Net: `$${payPerPaycheck.toFixed(2)}`,
        gpPaycheck2Bills: `$${paycheck2BillsAmount.toFixed(2)}`,
        gpPaycheck2Surplus: `${paycheck2Surplus >= 0 ? '' : '-'}$${Math.abs(paycheck2Surplus).toFixed(2)}`,
        gpPaycheck2SurplusClass: `font-bold ${paycheck2SurplusColor}`,
        
        gpAnnualIncome: `$${annualNetIncome.toFixed(2)}`,
        gpAnnualBonus: `$${afterTaxBonus.toFixed(2)}`,
        gpAnnualBills: `$${annualBills.toFixed(2)}`,
        gpAnnualSurplus: `${annualSurplus >= 0 ? '' : '-'}$${Math.abs(annualSurplus).toFixed(2)}`,
        gpAnnualSurplusClass: `font-bold ${annualSurplusColor}`,
        gpAnnualSurplusWithBonus: `${annualSurplusWithBonus >= 0 ? '' : '-'}$${Math.abs(annualSurplusWithBonus).toFixed(2)}`,
        gpAnnualSurplusWithBonusClass: `font-bold ${annualSurplusWithBonusColor}`,
        
        profitRatio: profitRatio,
        progressFillColor: progressFillColor,
        profitStatusText: profitStatusText,
        payFrequency: payFrequency,
        hasThirdPaycheckInSameMonth: hasThirdPaycheckInSameMonth,
        gpAnnualBonusTaxRate: `${bonusTaxRate}%`
    };
    
    // If we have a third paycheck, save its data
    if (payFrequency === 26 && hasThirdPaycheckInSameMonth) {
        profitData.gpPaycheck3Net = `$${payPerPaycheck.toFixed(2)}`;
        profitData.gpPaycheck3Bills = `$0.00`;
        profitData.gpPaycheck3Surplus = `$${paycheck3Surplus.toFixed(2)}`;
        profitData.gpPaycheck3SurplusClass = "font-bold text-neon-green";
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Show results
    if (grossProfitResults) grossProfitResults.classList.remove('hidden');
}

// Hook into the salary calculator to trigger gross profit calculation
const originalCalculateSalaryFromModal = window.calculateSalaryFromModal;
window.calculateSalaryFromModal = function() {
    // Call original function first
    originalCalculateSalaryFromModal.apply(this, arguments);
    
    // Then calculate gross profit
    calculateGrossProfit();
};

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    // Add gross profit calculator initialization to the existing initialization
    const originalInitElements = window.initElements;
    window.initElements = function() {
        // Call original function first
        originalInitElements.apply(this, arguments);
        
        // Initialize gross profit calculator
        initGrossProfitCalculator();
        
        // Initialize collapsible sections
        initCollapsibleSections();
    };
    
    // Also call bill update to trigger gross profit calculation
    const originalUpdatePaymentSchedule = window.updatePaymentSchedule;
    window.updatePaymentSchedule = function() {
        // Call original function first
        originalUpdatePaymentSchedule.apply(this, arguments);
        
        // Update gross profit if salary results are showing
        const salaryResults = document.getElementById('salaryResults');
        if (salaryResults && !salaryResults.classList.contains('hidden')) {
            calculateGrossProfit();
        }
    };
});

// Function to update the Gross Profit Calculator when the Update Profit button is clicked
window.updateGrossProfit = function() {
    // Check if salary has been calculated
    const salaryResults = document.getElementById('salaryResults');
    if (salaryResults && salaryResults.classList.contains('hidden')) {
        alert('Please calculate your salary first');
        return;
    }
    
    // Call the gross profit calculation function
    calculateGrossProfit();
}

// Initialize collapsible sections
function initCollapsibleSections() {
    // Credit Rating Legend section
    const creditRatingLegendHeader = document.getElementById('creditRatingLegendHeader');
    const creditRatingLegendContent = document.getElementById('creditRatingLegendContent');
    
    if (creditRatingLegendHeader && creditRatingLegendContent) {
        const creditRatingChevron = creditRatingLegendHeader.querySelector('i.fa-chevron-down');
        
        creditRatingLegendHeader.addEventListener('click', function() {
            creditRatingLegendContent.classList.toggle('hidden');
            if (creditRatingChevron) {
                creditRatingChevron.classList.toggle('transform');
                creditRatingChevron.classList.toggle('rotate-180');
            }
        });
    }
    
    // Tax Bracket section
    const taxBracketHeader = document.getElementById('taxBracketHeader');
    const taxBracketContent = document.getElementById('taxBracketContent');
    
    if (taxBracketHeader && taxBracketContent) {
        const taxBracketChevron = taxBracketHeader.querySelector('i.fa-chevron-down');
        
        taxBracketHeader.addEventListener('click', function() {
            taxBracketContent.classList.toggle('hidden');
            if (taxBracketChevron) {
                taxBracketChevron.classList.toggle('transform');
                taxBracketChevron.classList.toggle('rotate-180');
            }
        });
    }
}

// Initialize collapsible sections directly
document.addEventListener('DOMContentLoaded', function() {
    // Initialize collapsible sections immediately rather than waiting for initElements
    setTimeout(function() {
        initCollapsibleSections();
    }, 500);
});

// Loan Functions
window.addLoan = function() {
    document.getElementById('loanModalTitle').textContent = 'Add Loan';
    document.getElementById('loanName').value = '';
    document.getElementById('loanAmount').value = '';
    document.getElementById('loanBalance').value = '';
    document.getElementById('interestRate').value = '';
    document.getElementById('loanDueDate').value = '';
    document.getElementById('loanType').value = 'personal';
    document.getElementById('loanTerm').value = '';
    document.getElementById('editLoanIndex').value = '-1';
    
    // Reset mortgage-specific fields
    resetMortgageFields();
    
    // Hide mortgage fields initially
    document.getElementById('mortgageFields').classList.add('hidden');
    
    // Set up the loan type change event handler
    setupLoanTypeChangeHandler();
    
    // Hide any previous validation errors
    document.getElementById('loanValidationErrors').classList.add('hidden');
    document.getElementById('loanErrorList').innerHTML = '';
    
    document.getElementById('loanModal').classList.remove('hidden');
}

window.editLoan = function(index) {
    document.getElementById('loanModalTitle').textContent = 'Edit Loan';
    const loan = loans[index];
    
    document.getElementById('loanName').value = loan.name;
    document.getElementById('loanAmount').value = loan.originalAmount;
    document.getElementById('loanBalance').value = loan.balance;
    document.getElementById('interestRate').value = loan.interestRate;
    document.getElementById('loanDueDate').value = loan.dueDate;
    document.getElementById('loanType').value = loan.type || 'personal';
    document.getElementById('loanTerm').value = loan.term || '';
    
    document.getElementById('editLoanIndex').value = index;
    
    // Set up mortgage fields event handler
    setupLoanTypeChangeHandler();
    
    // Set mortgage-specific fields if they exist
    if (loan.additionalPrincipal !== undefined) {
        document.getElementById('additionalPrincipal').value = loan.additionalPrincipal;
    } else {
        document.getElementById('additionalPrincipal').value = '0';
    }
    
    if (loan.pmi !== undefined) {
        document.getElementById('pmi').value = loan.pmi;
    } else {
        document.getElementById('pmi').value = '0';
    }
    
    if (loan.propertyTax !== undefined) {
        document.getElementById('propertyTax').value = loan.propertyTax;
    } else {
        document.getElementById('propertyTax').value = '0';
    }
    
    if (loan.propertyInsurance !== undefined) {
        document.getElementById('propertyInsurance').value = loan.propertyInsurance;
    } else {
        document.getElementById('propertyInsurance').value = '0';
    }
    
    // Hide any previous validation errors
    document.getElementById('loanValidationErrors').classList.add('hidden');
    document.getElementById('loanErrorList').innerHTML = '';
    
    document.getElementById('loanModal').classList.remove('hidden');
}

window.closeLoanModal = function() {
    document.getElementById('loanModal').classList.add('hidden');
}

// Validate loan form data
function validateLoanForm() {
    const errors = [];
    
    if (!loanName.value || loanName.value.trim() === '') {
        errors.push('Loan Name is required');
    }
    
    const amountValue = parseFloat(loanAmount.value);
    if (isNaN(amountValue) || amountValue <= 0) {
        errors.push('Original Loan Amount must be a positive number');
    }
    
    const balanceValue = parseFloat(loanBalance.value);
    if (isNaN(balanceValue) || balanceValue < 0) {
        errors.push('Current Balance must be a non-negative number');
    }
    
    const rateValue = parseFloat(interestRate.value);
    if (isNaN(rateValue) || rateValue < 0) {
        errors.push('Interest Rate must be a non-negative number');
    }
    
    const dueDateValue = parseInt(loanDueDate.value);
    if (isNaN(dueDateValue) || dueDateValue < 1 || dueDateValue > 31) {
        errors.push('Payment Due Date must be a day between 1 and 31');
    }
    
    // Validate term if provided
    if (loanTerm.value) {
        const termValue = parseInt(loanTerm.value);
        if (isNaN(termValue) || termValue <= 0) {
            errors.push('Loan Term must be a positive number');
        }
    }
    
    return errors;
}

// Display loan validation errors
function showLoanValidationErrors(errors) {
    const errorContainer = document.getElementById('loanValidationErrors');
    const errorList = document.getElementById('loanErrorList');
    
    errorList.innerHTML = '';
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
    });
    
    errorContainer.classList.remove('hidden');
}

window.saveLoan = function() {
    // Validate form data
    const errors = validateLoanForm();
    if (errors.length > 0) {
        showLoanValidationErrors(errors);
        return;
    }
    
    const loan = {
        name: loanName.value.trim(),
        originalAmount: parseFloat(loanAmount.value),
        balance: parseFloat(loanBalance.value),
        interestRate: parseFloat(interestRate.value),
        dueDate: parseInt(loanDueDate.value),
        type: loanType.value,
        term: loanTerm.value ? parseInt(loanTerm.value) : null,
        startDate: new Date().toISOString().split('T')[0]
    };
    
    // Add mortgage-specific fields if loan type is mortgage
    if (loan.type === 'mortgage') {
        loan.additionalPrincipal = parseFloat(document.getElementById('additionalPrincipal').value) || 0;
        loan.pmi = parseFloat(document.getElementById('pmi').value) || 0;
        loan.propertyTax = parseFloat(document.getElementById('propertyTax').value) || 0;
        loan.propertyInsurance = parseFloat(document.getElementById('propertyInsurance').value) || 0;
    }
    
    const editIndex = parseInt(document.getElementById('editLoanIndex').value);
    
    if (editIndex >= 0 && editIndex < loans.length) {
        // Edit existing loan, preserve the startDate if it exists
        if (loans[editIndex].startDate) {
            loan.startDate = loans[editIndex].startDate;
        }
        loans[editIndex] = loan;
        
        // Update any existing bill for this loan
        const billIndex = bills.findIndex(bill => 
            bill.name === `${loans[editIndex].name} Payment` && bill.type === 'loan');
            
        if (billIndex !== -1) {
            bills[billIndex].dueDate = loan.dueDate;
        }
    } else {
        // Add new loan
        loans.push(loan);
        
        // Create a corresponding bill entry
        const monthlyPayment = calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term);
        
        // For mortgages, include additional costs in the monthly payment
        let totalMonthlyPayment = monthlyPayment;
        if (loan.type === 'mortgage') {
            // Add PMI if provided
            totalMonthlyPayment += loan.pmi || 0;
            
            // Add monthly property tax
            if (loan.propertyTax) {
                totalMonthlyPayment += loan.propertyTax / 12;
            }
            
            // Add monthly property insurance
            if (loan.propertyInsurance) {
                totalMonthlyPayment += loan.propertyInsurance / 12;
            }
        }
        
        const newBill = {
            name: `${loan.name} Payment`,
            amount: totalMonthlyPayment,
            dueDate: loan.dueDate,
            type: 'loan',
            priority: 'high'
        };
        
        // Add the bill
        bills.push(newBill);
        
        // Update the bills display
        renderBills();
        updatePaymentSchedule();
    }
    
    renderLoans();
    updateLoanSummary();
    closeLoanModal();
    
    // Save changes to localStorage
    saveToLocalStorage();
    
    // Dispatch event to trigger scroll detection check
    document.dispatchEvent(new Event('loansChanged'));
}

window.deleteLoan = function(index) {
    const deletedLoan = loans[index];
    
    // First delete the loan
    loans.splice(index, 1);
    
    // Then find and delete any bill entries that correspond to this loan
    if (deletedLoan && deletedLoan.name) {
        const billName = `${deletedLoan.name} Payment`;
        
        // Find the index of the corresponding bill
        const billIndex = bills.findIndex(bill => bill.name === billName && bill.type === 'loan');
        
        // If a matching bill is found, delete it
        if (billIndex !== -1) {
            bills.splice(billIndex, 1);
            
            // Update the bills display and payment schedule
            renderBills();
            updatePaymentSchedule();
        }
    }
    
    renderLoans();
    updateLoanSummary();
}

function renderLoans() {
    const loansContainer = document.getElementById('loansContainer');
    
    if (!loansContainer) {
        console.error('Loans container not found');
        return;
    }
    
    if (loans.length === 0) {
        loansContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No loans added yet</p>';
        return;
    }
    
    let html = '';
    loans.forEach((loan, index) => {
        // Calculate monthly payment
        const monthlyPayment = calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term);
        
        // Calculate percent paid off 
        const percentPaid = (1 - (loan.balance / loan.originalAmount)) * 100;
        
        // Apply color coding based on percent paid off
        let progressColorClass = 'cyber-pink'; // Default for 0-25%
        if (percentPaid > 75) {
            progressColorClass = 'cyber-green'; // 75-100%
        } else if (percentPaid > 50) {
            progressColorClass = 'cyber-blue'; // 50-75%
        } else if (percentPaid > 25) {
            progressColorClass = 'cyber-yellow'; // 25-50%
        }
        
        // Get loan type icon
        const typeIcon = getLoanTypeIcon(loan.type || 'personal');
        
        // For mortgage loans, calculate total monthly cost including additional costs
        let totalMonthlyPayment = monthlyPayment;
        let mortgageDetails = '';
        
        if (loan.type === 'mortgage') {
            // Add additional principal if provided
            const additionalPrincipal = loan.additionalPrincipal || 0;
            
            // Add PMI if provided
            const pmi = loan.pmi || 0;
            totalMonthlyPayment += pmi;
            
            // Add monthly property tax
            const monthlyPropertyTax = loan.propertyTax ? loan.propertyTax / 12 : 0;
            totalMonthlyPayment += monthlyPropertyTax;
            
            // Add monthly property insurance
            const monthlyPropertyInsurance = loan.propertyInsurance ? loan.propertyInsurance / 12 : 0;
            totalMonthlyPayment += monthlyPropertyInsurance;
            
            // Create mortgage-specific details section
            mortgageDetails = `
                <div class="mt-4 border-t border-gray-700 pt-4">
                    <h4 class="text-sm font-medium text-white mb-2">Mortgage Details</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p class="text-xs text-gray-400">Base Payment</p>
                            <p class="font-medium text-neon-blue">$${monthlyPayment.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Additional Principal</p>
                            <p class="font-medium text-neon-green">$${additionalPrincipal.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">PMI</p>
                            <p class="font-medium text-neon-pink">$${pmi.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Property Tax (monthly)</p>
                            <p class="font-medium text-neon-yellow">$${monthlyPropertyTax.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-3">
                        <div>
                            <p class="text-xs text-gray-400">Property Insurance (monthly)</p>
                            <p class="font-medium text-neon-purple">$${monthlyPropertyInsurance.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Total Monthly Cost</p>
                            <p class="font-medium text-neon-blue text-lg">$${totalMonthlyPayment.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="mt-3">
                        <p class="text-xs text-gray-400">Annual Property Tax: <span class="text-white">$${(loan.propertyTax || 0).toFixed(2)}</span></p>
                        <p class="text-xs text-gray-400">Annual Property Insurance: <span class="text-white">$${(loan.propertyInsurance || 0).toFixed(2)}</span></p>
                    </div>
                </div>
            `;
        }
        
        html += `
            <div class="border cyber-border rounded-lg p-4 mb-4 cyber-card">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center">
                            <i class="fas ${typeIcon} mr-2 text-neon-green"></i>
                            <h3 class="font-medium text-lg cyber-neon">${loan.name}</h3>
                        </div>
                        <p class="text-sm text-gray-400">Payment due on ${loan.dueDate}${getOrdinalSuffix(loan.dueDate)} of each month</p>
                    </div>
                    <div class="flex">
                        <button onclick="editLoan(${index})" class="text-neon-blue hover:text-neon-purple mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteLoan(${index})" class="text-neon-pink hover:text-neon-purple">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Original Amount</p>
                        <p class="font-medium">$${loan.originalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Current Balance</p>
                        <p class="font-medium text-neon-blue">$${loan.balance.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="mt-4">
                    <div class="flex justify-between mb-1">
                        <p class="text-sm text-gray-400">Paid Off Progress</p>
                        <span class="text-sm">${percentPaid.toFixed(1)}%</span>
                    </div>
                    <div class="cyber-progress-bar">
                        <div class="cyber-progress-fill ${progressColorClass}" 
                             style="width: ${percentPaid}%"></div>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Interest Rate</p>
                        <p class="font-medium">${loan.interestRate.toFixed(2)}%</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">${loan.type === 'mortgage' ? 'Principal & Interest' : 'Monthly Payment'}</p>
                        <p class="font-medium text-neon-pink">$${monthlyPayment.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Loan Term</p>
                        <p class="font-medium">${loan.term ? `${loan.term} months` : 'Not specified'}</p>
                    </div>
                </div>
                
                ${mortgageDetails}
                
                <div class="mt-4">
                    <div class="flex justify-between text-sm text-gray-400">
                        <p>Total interest over life of loan:</p>
                        <p class="text-neon-purple">$${calculateTotalInterest(loan.originalAmount, loan.interestRate, loan.term).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    loansContainer.innerHTML = html;
}

function updateLoanSummary() {
    const totalOriginalValue = loans.reduce((sum, loan) => sum + loan.originalAmount, 0);
    const totalBalanceValue = loans.reduce((sum, loan) => sum + loan.balance, 0);
    const totalPayoffPercent = totalOriginalValue > 0 ? (1 - (totalBalanceValue / totalOriginalValue)) * 100 : 0;
    const totalMonthlyPayments = loans.reduce((sum, loan) => sum + calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term), 0);
    
    // Update loan count
    document.getElementById('totalLoans').textContent = loans.length;
    
    // Update total original amount
    document.getElementById('totalOriginalAmount').innerHTML = `<span class="text-white">$${totalOriginalValue.toFixed(2)}</span>`;
    
    // Update total current balance with color
    let balanceColorClass = 'text-neon-pink';
    if (totalPayoffPercent > 75) {
        balanceColorClass = 'text-neon-green';
    } else if (totalPayoffPercent > 50) {
        balanceColorClass = 'text-neon-blue';
    } else if (totalPayoffPercent > 25) {
        balanceColorClass = 'text-neon-yellow';
    }
    document.getElementById('totalLoanBalance').innerHTML = `<span class="${balanceColorClass}">$${totalBalanceValue.toFixed(2)}</span>`;
    
    // Update total monthly payment
    document.getElementById('totalMonthlyPayment').innerHTML = `<span class="text-neon-pink">$${totalMonthlyPayments.toFixed(2)}</span>`;
    
    // Update payoff progress bar
    const progressBar = document.getElementById('loanPayoffProgress');
    progressBar.style.width = `${totalPayoffPercent}%`;
    
    // Set progress bar color
    let progressColorClass = 'cyber-pink';
    if (totalPayoffPercent > 75) {
        progressColorClass = 'cyber-green';
    } else if (totalPayoffPercent > 50) {
        progressColorClass = 'cyber-blue';
    } else if (totalPayoffPercent > 25) {
        progressColorClass = 'cyber-yellow';
    }
    progressBar.className = `cyber-progress-fill ${progressColorClass}`;
    
    // Update payoff percent text
    document.getElementById('loanPayoffPercent').textContent = `${totalPayoffPercent.toFixed(1)}%`;
}

function getLoanTypeIcon(type) {
    const icons = {
        'personal': 'fa-user',
        'auto': 'fa-car',
        'student': 'fa-graduation-cap',
        'mortgage': 'fa-home',
        'medical': 'fa-hospital',
        'credit': 'fa-credit-card',
        'business': 'fa-briefcase',
        'other': 'fa-money-bill-wave'
    };
    return icons[type] || 'fa-money-bill-wave';
}

// Calculate monthly loan payment using the standard amortization formula
function calculateLoanPayment(principal, interestRate, term) {
    // If term is not defined, assume minimum payment of 1% of principal
    if (!term || term <= 0) {
        return principal * 0.01;
    }
    
    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 100 / 12;
    
    // If interest rate is zero, simple division
    if (monthlyRate === 0) {
        return principal / term;
    }
    
    // Calculate monthly payment using amortization formula
    return principal * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
}

// Calculate total interest paid over the loan term
function calculateTotalInterest(principal, interestRate, term) {
    // If term is not defined, can't calculate total interest
    if (!term || term <= 0) {
        return 0;
    }
    
    const monthlyPayment = calculateLoanPayment(principal, interestRate, term);
    const totalPayments = monthlyPayment * term;
    return totalPayments - principal;
}

// Functions to handle mortgage-specific fields
function setupLoanTypeChangeHandler() {
    const loanTypeSelect = document.getElementById('loanType');
    loanTypeSelect.addEventListener('change', function() {
        if (this.value === 'mortgage') {
            document.getElementById('mortgageFields').classList.remove('hidden');
        } else {
            document.getElementById('mortgageFields').classList.add('hidden');
        }
    });
    
    // Trigger the change event to set the initial state
    loanTypeSelect.dispatchEvent(new Event('change'));
}

function resetMortgageFields() {
    document.getElementById('additionalPrincipal').value = '0';
    document.getElementById('pmi').value = '0';
    document.getElementById('propertyTax').value = '0';
    document.getElementById('propertyInsurance').value = '0';
}

// Function to close the salary modal
window.closeSalaryModal = function() {
    document.getElementById('salaryModal').classList.add('hidden');
}

// Function to toggle the paid status of a bill
window.toggleBillPaidStatus = function(index) {
    // Get the bill at the specified index
    const bill = bills[index];
    
    // Check if bill amount is zero
    if (bill.amount === 0) {
        // Show our custom zero bill modal instead of browser confirm
        showZeroBillModal(index);
    } else {
        // If bill amount is not zero, simply toggle the paid status
        bill.isPaid = !bill.isPaid;
        
        // Re-render the bills to update the UI
        renderBills();
        
        // Update the payment schedule since paid status affects calculations
        updatePaymentSchedule();
    }
}

// Function to initialize the gross profit calculator
function initGrossProfitCalculator() {
    // Set up event listeners for the gross profit calculator
    const updateProfitButton = document.getElementById('updateProfitButton');
    if (updateProfitButton) {
        updateProfitButton.addEventListener('click', function() {
            updateGrossProfit();
        });
    }

    // If salary data exists, try to calculate gross profit automatically
    const salaryResults = document.getElementById('salaryResults');
    if (salaryResults && !salaryResults.classList.contains('hidden')) {
        // Call with a slight delay to ensure all DOM elements are loaded
        setTimeout(function() {
            calculateGrossProfit();
        }, 300);
    }
}