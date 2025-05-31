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

// Historical data storage
let historicalBillData = []; // Array to store bill amounts by month
let currentAppMonth = new Date().getMonth(); // Track the app's current month (0-11)
let currentAppYear = new Date().getFullYear(); // Track the app's current year

// Persistence functions for localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('creditCards', JSON.stringify(creditCards));
        localStorage.setItem('bills', JSON.stringify(bills));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('loans', JSON.stringify(loans));
        localStorage.setItem('salaryData', JSON.stringify(salaryData));
        localStorage.setItem('profitData', JSON.stringify(profitData));
        
        // Save historical data
        localStorage.setItem('historicalBillData', JSON.stringify(historicalBillData));
        localStorage.setItem('currentAppMonth', currentAppMonth.toString());
        localStorage.setItem('currentAppYear', currentAppYear.toString());
        
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
        
        // Load historical data
        const savedHistoricalData = localStorage.getItem('historicalBillData');
        if (savedHistoricalData) {
            historicalBillData = JSON.parse(savedHistoricalData);
        }
        
        // Load current app month/year
        const savedAppMonth = localStorage.getItem('currentAppMonth');
        if (savedAppMonth) {
            currentAppMonth = parseInt(savedAppMonth);
        }
        
        const savedAppYear = localStorage.getItem('currentAppYear');
        if (savedAppYear) {
            currentAppYear = parseInt(savedAppYear);
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
        
        // Update paycheck labels after loading data
        updatePaycheckLabels();
        
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
        
        if (salaryData.fsaAmount) {
            document.getElementById('fsaAmount').textContent = salaryData.fsaAmount;
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
    // Show the styled reset confirmation modal instead of the browser's confirm dialog
    document.getElementById('resetConfirmModal').classList.remove('hidden');
}

// Function to close the reset confirmation modal
window.closeResetConfirmModal = function(fromSuccess = false) {
    // If we're closing from the success screen, and we have stored original content, restore it
    if (fromSuccess) {
        const modalContent = document.querySelector('#resetConfirmModal .p-4.mb-4');
        const buttonContainer = document.querySelector('#resetConfirmModal .flex.justify-end');
        
        if (modalContent && modalContent.getAttribute('data-original')) {
            modalContent.innerHTML = modalContent.getAttribute('data-original');
            modalContent.removeAttribute('data-original');
            modalContent.classList.remove('bg-glass-green');
            modalContent.classList.add('bg-glass-pink');
        }
        
        if (buttonContainer && buttonContainer.getAttribute('data-original')) {
            buttonContainer.innerHTML = buttonContainer.getAttribute('data-original');
            buttonContainer.removeAttribute('data-original');
        }
    }
    
    // Hide the modal
    document.getElementById('resetConfirmModal').classList.add('hidden');
}

// Function to confirm reset and actually clear the data
window.confirmReset = function() {
    try {
        // Clear all CorpoCache data but keep other localStorage items
        localStorage.removeItem('creditCards');
        localStorage.removeItem('bills');
        localStorage.removeItem('expenses');
        localStorage.removeItem('loans');        localStorage.removeItem('salaryData');
        localStorage.removeItem('profitData');
        localStorage.removeItem('historicalBillData');
        localStorage.removeItem('currentAppMonth');
        localStorage.removeItem('currentAppYear');
        localStorage.removeItem('lastSaved');
        
        // Reset arrays
        creditCards = [];
        bills = [];
        expenses = [];
        loans = [];
        salaryData = {};
        profitData = {};
        historicalBillData = [];
        
        // Reset to current date
        currentAppMonth = new Date().getMonth();
        currentAppYear = new Date().getFullYear();
        
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
        
        // Reset the Calculate Salary button text
        const calculateButton = document.querySelector('button[onclick="showSalaryModal()"]');
        if (calculateButton) {
            calculateButton.innerHTML = '<i class="fas fa-calculator mr-1"></i> Calculate Salary';
            calculateButton.setAttribute('onclick', 'showSalaryModal()');
        }
        
        // Hide last saved info
        const lastSavedElement = document.getElementById('lastSavedTime');
        if (lastSavedElement) {
            lastSavedElement.classList.add('hidden');
        }
        
        // Update modal content to show success message
        const modalContent = document.querySelector('#resetConfirmModal .p-4.mb-4');
        if (modalContent) {
            // Store original content to restore later
            if (!modalContent.getAttribute('data-original')) {
                modalContent.setAttribute('data-original', modalContent.innerHTML);
            }
            
            // Show success message
            modalContent.innerHTML = `
                <div class="text-white">
                    <p class="mb-2"><i class="fas fa-check-circle text-neon-green mr-2"></i>Success!</p>
                    <p>All data has been cleared.</p>
                </div>
            `;
            modalContent.classList.remove('bg-glass-pink');
            modalContent.classList.add('bg-glass-green');
            
            // Update buttons
            const buttonContainer = document.querySelector('#resetConfirmModal .flex.justify-end');
            if (buttonContainer) {
                // Store original buttons
                if (!buttonContainer.getAttribute('data-original')) {
                    buttonContainer.setAttribute('data-original', buttonContainer.innerHTML);
                }
                
                // Replace with just a close button
                buttonContainer.innerHTML = `
                    <button onclick="closeResetConfirmModal(true)" class="px-4 py-2 cyber-primary-btn rounded-md">
                        <i class="fas fa-check mr-1"></i> Done
                    </button>
                `;
            }
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        
        // Show error message in the modal
        const modalContent = document.querySelector('#resetConfirmModal .p-4.mb-4');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="text-white">
                    <p class="mb-2"><i class="fas fa-exclamation-circle text-neon-pink mr-2"></i>Error</p>
                    <p>An error occurred while clearing your data.</p>
                </div>
            `;
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
            historicalBillData,
            currentAppMonth,
            currentAppYear,
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

// Import data from a previously exported JSON file or sample data
function importData() {
    // Show the import options modal
    document.getElementById('importOptionsModal').classList.remove('hidden');
}

// Function to close the import options modal
window.closeImportOptionsModal = function() {
    document.getElementById('importOptionsModal').classList.add('hidden');
}

// Close import options modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (!document.getElementById('importOptionsModal').classList.contains('hidden')) {
            closeImportOptionsModal();
        }
    }
});

// Close import options modal when clicking outside
document.addEventListener('click', function(event) {
    // Close import options modal when clicking outside
    const optionsModal = document.getElementById('importOptionsModal');
    if (!optionsModal.classList.contains('hidden') && event.target === optionsModal) {
        closeImportOptionsModal();
    }
    
    // Close import confirmation modal when clicking outside
    const confirmModal = document.getElementById('importConfirmModal');
    if (!confirmModal.classList.contains('hidden') && event.target === confirmModal) {
        closeImportConfirmModal();
    }
});

// Function to handle file selection
window.selectFile = function() {
    // Close the options modal
    closeImportOptionsModal();
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        
        // Show loading state
        const loadingModal = document.createElement('div');
        loadingModal.id = 'loadingModal';
        loadingModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingModal.innerHTML = `
            <div class="modal-cyber rounded-lg p-6 w-full max-w-md text-center">
                <p class="text-neon-blue mb-4"><i class="fas fa-spinner fa-spin mr-2"></i> Reading file...</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Remove loading modal
            if (document.getElementById('loadingModal')) {
                document.body.removeChild(document.getElementById('loadingModal'));
            }
            
            try {
                const importDataString = e.target.result;
                const importedData = JSON.parse(importDataString);
                
                // Store the imported data in a hidden field for later use
                document.getElementById('importData').value = importDataString;
                
                // Update confirmation modal content to indicate file data
                const modalContent = document.querySelector('#importConfirmModal .p-4.mb-4 .text-white');
                if (modalContent) {
                    modalContent.innerHTML = `
                        <p class="mb-2"><i class="fas fa-info-circle text-neon-blue mr-2"></i>You're about to import data from: <span class="text-neon-green">${file.name}</span></p>
                        <p>This will replace all your current data. Do you want to continue?</p>
                    `;
                }
                
                // Show the styled import confirmation modal instead of the browser's confirm dialog
                document.getElementById('importConfirmModal').classList.remove('hidden');
            } catch (error) {
                console.error('Error parsing imported data:', error);
                alert('The selected file is not a valid CorpoCache backup file.');
            }
        };
        
        reader.onerror = function() {
            // Remove loading modal
            if (document.getElementById('loadingModal')) {
                document.body.removeChild(document.getElementById('loadingModal'));
            }
            
            alert('An error occurred while reading the file.');
        };
        
        reader.readAsText(file);
    };
    
    fileInput.click();
}

// Function to import sample data
window.importSampleData = function() {
    // Close the options modal
    closeImportOptionsModal();
    
    // Show loading state
    const loadingModal = document.createElement('div');
    loadingModal.id = 'loadingModal';
    loadingModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loadingModal.innerHTML = `
        <div class="modal-cyber rounded-lg p-6 w-full max-w-md text-center">
            <p class="text-neon-blue mb-4"><i class="fas fa-spinner fa-spin mr-2"></i> Loading sample data...</p>
        </div>
    `;
    document.body.appendChild(loadingModal);
    
    // Fetch the sample data
    fetch('sampledata.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load sample data');
            }
            return response.json();
        })
        .then(data => {
            // Remove loading modal
            if (document.getElementById('loadingModal')) {
                document.body.removeChild(document.getElementById('loadingModal'));
            }
            
            // Store the sample data in the hidden field
            document.getElementById('importData').value = JSON.stringify(data);
            
            // Update confirmation modal content to indicate sample data
            const modalContent = document.querySelector('#importConfirmModal .p-4.mb-4 .text-white');
            if (modalContent) {
                modalContent.innerHTML = `
                    <p class="mb-2"><i class="fas fa-info-circle text-neon-blue mr-2"></i>You're about to import sample data.</p>
                    <p>This will replace all your current data. Do you want to continue?</p>
                `;
            }
            
            // Show the confirmation modal
            document.getElementById('importConfirmModal').classList.remove('hidden');
        })
        .catch(error => {
            // Remove loading modal
            if (document.getElementById('loadingModal')) {
                document.body.removeChild(document.getElementById('loadingModal'));
            }
            
            console.error('Error loading sample data:', error);
            alert('Failed to load sample data. Please try again later.');
        });
}

// Function to close the import confirmation modal
window.closeImportConfirmModal = function(fromSuccess = false) {
    // If we're closing from the success screen, and we have stored original content, restore it
    if (fromSuccess) {
        const modalContent = document.querySelector('#importConfirmModal .p-4.mb-4');
        const buttonContainer = document.querySelector('#importConfirmModal .flex.justify-end');
        
        // Always restore the default content when closing the modal
        const contentDiv = document.querySelector('#importConfirmModal .p-4.mb-4 .text-white');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <p class="mb-2"><i class="fas fa-info-circle text-neon-blue mr-2"></i>This will replace all your current data.</p>
                <p>Do you want to continue?</p>
            `;
        }
        
        if (modalContent && modalContent.getAttribute('data-original')) {
            modalContent.innerHTML = modalContent.getAttribute('data-original');
            modalContent.removeAttribute('data-original');
            modalContent.classList.remove('bg-glass-green');
            modalContent.classList.add('bg-glass-purple');
        }
        
        if (buttonContainer && buttonContainer.getAttribute('data-original')) {
            buttonContainer.innerHTML = buttonContainer.getAttribute('data-original');
            buttonContainer.removeAttribute('data-original');
        }
    }
    
    // Hide the modal
    document.getElementById('importConfirmModal').classList.add('hidden');
}

// Function to confirm import and actually import the data
window.confirmImport = function() {
    try {
        // Get the import data string from the hidden field
        const importDataString = document.getElementById('importData').value;
        if (!importDataString) {
            // Show error in the modal instead of alert
            const modalContent = document.querySelector('#importConfirmModal .p-4.mb-4');
            if (modalContent) {
                modalContent.innerHTML = `
                    <div class="text-white">
                        <p class="mb-2"><i class="fas fa-exclamation-circle text-neon-pink mr-2"></i>Error</p>
                        <p>No import data found.</p>
                    </div>
                `;
                modalContent.classList.remove('bg-glass-purple');
                modalContent.classList.add('bg-glass-pink');
            }
            return;
        }
        
        const importedData = JSON.parse(importDataString);
        
        // Check for required data structures
        if (!importedData.creditCards || !importedData.bills) {
            // Show error in the modal instead of alert
            const modalContent = document.querySelector('#importConfirmModal .p-4.mb-4');
            if (modalContent) {
                modalContent.innerHTML = `
                    <div class="text-white">
                        <p class="mb-2"><i class="fas fa-exclamation-circle text-neon-pink mr-2"></i>Error</p>
                        <p>The selected file is not a valid CorpoCache backup file.</p>
                    </div>
                `;
                modalContent.classList.remove('bg-glass-purple');
                modalContent.classList.add('bg-glass-pink');
            }
            return;
        }
        
        // Import credit cards
        creditCards = importedData.creditCards;
        
        // Import bills
        bills = importedData.bills;
        
        // Import expenses
        if (importedData.expenses) {
            expenses = importedData.expenses;
        }
        
        // Import loans
        if (importedData.loans) {
            loans = importedData.loans;
        }
        
        // Import salary data
        if (importedData.salaryData) {
            salaryData = importedData.salaryData;
        }
          // Import profit data
        if (importedData.profitData) {
            profitData = importedData.profitData;
        }
        
        // Import historical data
        if (importedData.historicalBillData) {
            historicalBillData = importedData.historicalBillData;
        }
        
        // Import current app month/year
        if (typeof importedData.currentAppMonth !== 'undefined') {
            currentAppMonth = importedData.currentAppMonth;
        }
        
        if (typeof importedData.currentAppYear !== 'undefined') {
            currentAppYear = importedData.currentAppYear;
        }
        
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
        
        // Load salary data if available
        loadSalaryDataToUI();
        
        // Update paycheck labels
        updatePaycheckLabels();
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Show success message in the modal
        const modalContent = document.querySelector('#importConfirmModal .p-4.mb-4');
        if (modalContent) {
            // Store original content to restore later
            if (!modalContent.getAttribute('data-original')) {
                modalContent.setAttribute('data-original', modalContent.innerHTML);
            }
            
            // Show success message
            modalContent.innerHTML = `
                <div class="text-white">
                    <p class="mb-2"><i class="fas fa-check-circle text-neon-green mr-2"></i>Success!</p>
                    <p>Data imported successfully.</p>
                </div>
            `;
            modalContent.classList.remove('bg-glass-purple');
            modalContent.classList.add('bg-glass-green');
            
            // Update buttons
            const buttonContainer = document.querySelector('#importConfirmModal .flex.justify-end');
            if (buttonContainer) {
                // Store original buttons
                if (!buttonContainer.getAttribute('data-original')) {
                    buttonContainer.setAttribute('data-original', buttonContainer.innerHTML);
                }
                
                // Replace with just a close button
                buttonContainer.innerHTML = `
                    <button onclick="closeImportConfirmModal(true)" class="px-4 py-2 cyber-primary-btn rounded-md">
                        <i class="fas fa-check mr-1"></i> Done
                    </button>
                `;
            }
        }
    } catch (error) {
        console.error('Error importing data:', error);
        
        // Show error message in the modal
        const modalContent = document.querySelector('#importConfirmModal .p-4.mb-4');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="text-white">
                    <p class="mb-2"><i class="fas fa-exclamation-circle text-neon-pink mr-2"></i>Error</p>
                    <p>An error occurred while importing your data.</p>
                </div>
            `;
            modalContent.classList.remove('bg-glass-purple');
            modalContent.classList.add('bg-glass-pink');
        }
    }
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
    
    // Initialize preventDefault on anchors to prevent page refresh
    initPreventDefaultOnAnchors();
});

// Function to update the month and year display in the Monthly Bills section
function updateCurrentMonthAndYear() {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthElement = document.getElementById('currentMonth');
    const yearElement = document.getElementById('currentYear');
    
    if (monthElement) {
        monthElement.textContent = months[currentAppMonth];
    }
    
    if (yearElement) {
        yearElement.textContent = currentAppYear;
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
        return 'text-neon-blue';    // 10% to 30%
    } else {
        return 'text-neon-green';   // 0% to 10%
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
        // Store the old card name before updating
        const oldCardName = creditCards[editIndex].name;
        
        // Edit existing card
        creditCards[editIndex] = card;
        
        // Look for the associated bill and update its due date
        const billName = `${oldCardName} Payment`;
        const billIndex = bills.findIndex(bill => bill.name === billName && bill.type === 'credit');
        
        if (billIndex !== -1) {
            // Update the bill name if the card name changed
            if (oldCardName !== card.name) {
                bills[billIndex].name = `${card.name} Payment`;
            }
            
            // Update the bill's due date to match the card's due date
            bills[billIndex].dueDate = card.dueDate;
            
            // Re-render bills and update payment schedule
            renderBills();
            updatePaymentSchedule();
        }
    } else {
        // Add new card
        creditCards.push(card);
          // Also add a bill entry with amount $0 for this credit card
        const newBill = {
            name: `${card.name} Payment`,
            amount: 0,
            dueDate: card.dueDate,
            type: 'credit',
            priority: 'normal',
            paymentAccount: 'checking', // Default to checking account
            creditCardId: null
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

function renderCreditCards() {    if (creditCards.length === 0) {
        creditCardsContainer.innerHTML = '<p class="text-gray-400 text-center py-4 md:col-span-3 lg:col-span-4">No credit cards added yet</p>';
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
                accountAge = '<span class="text-neon-pink">' + ageMonths + '</span> ' + (ageMonths === 1 ? 'month' : 'months') + ' old';
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
            accountAge = '<span class="text-neon-pink">' + ageMonths + '</span> ' + (ageMonths === 1 ? 'month' : 'months') + ' old';
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
    document.getElementById('paymentAccount').value = 'checking'; // Default to checking account
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    // Populate credit card dropdown
    populateCreditCardSelect();
    
    // Reset credit card selection to first option
    const creditCardSelect = document.getElementById('creditCardSelect');
    if (creditCardSelect && creditCardSelect.options.length > 0) {
        creditCardSelect.selectedIndex = 0;
    }
    
    // Hide the credit card selection initially
    document.getElementById('creditCardSelectContainer').classList.add('hidden');
    
    document.getElementById('billModal').classList.remove('hidden');
    
    // Set up event listener for payment account selection changes
    setupPaymentAccountChangeListener();
}

window.editBill = function(index) {
    document.getElementById('billModalTitle').textContent = 'Edit Monthly Bill';
    const bill = bills[index];
    
    document.getElementById('billName').value = bill.name;
    document.getElementById('billAmount').value = bill.amount;
    document.getElementById('billDueDate').value = bill.dueDate;
    // Set bill type if it exists, otherwise default to 'other'
    document.getElementById('billType').value = bill.type || 'other';
    
    // Set the varying amount and autopay checkboxes based on bill properties
    document.getElementById('varyingAmountDue').checked = bill.varyingAmount || false;
    document.getElementById('autoPay').checked = bill.autoPay || false;
    
    // Populate credit card dropdown
    populateCreditCardSelect();
      // Set payment account and show/hide credit card selection accordingly
    const paymentAccount = bill.paymentAccount || 'checking';
    document.getElementById('paymentAccount').value = paymentAccount;
    
    // Reset credit card selection to first option as default
    const creditCardSelect = document.getElementById('creditCardSelect');
    if (creditCardSelect) {
        creditCardSelect.selectedIndex = 0;
    }
    
    if (paymentAccount === 'credit') {
        document.getElementById('creditCardSelectContainer').classList.remove('hidden');
        if (bill.creditCardId !== null && bill.creditCardId !== undefined) {
            // Set credit card selection if available
            if (creditCardSelect) {
                creditCardSelect.value = bill.creditCardId;
            }
        }
    } else {
        document.getElementById('creditCardSelectContainer').classList.add('hidden');
    }
    
    // Set up event listener for payment account changes
    setupPaymentAccountChangeListener();
    
    document.getElementById('editBillIndex').value = index;
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    document.getElementById('billModal').classList.remove('hidden');
}

window.closeBillModal = function() {
    document.getElementById('billModal').classList.add('hidden');
    
    // Reset the credit card dropdown visibility state
    const creditCardSelectContainer = document.getElementById('creditCardSelectContainer');
    if (creditCardSelectContainer) {
        creditCardSelectContainer.classList.add('hidden');
    }
}

// Function to populate the credit card selection dropdown
function populateCreditCardSelect() {
    const creditCardSelect = document.getElementById('creditCardSelect');
    if (!creditCardSelect) return;
    
    // Clear existing options
    creditCardSelect.innerHTML = '';
    
    // Add options for each credit card
    creditCards.forEach((card, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = card.name;
        creditCardSelect.appendChild(option);
    });
    
    // If no credit cards, add a default option
    if (creditCards.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No credit cards available';
        creditCardSelect.appendChild(option);
    }
}

// Function to set up event listener for payment account selection changes
function setupPaymentAccountChangeListener() {
    const paymentAccountSelect = document.getElementById('paymentAccount');
    const creditCardSelectContainer = document.getElementById('creditCardSelectContainer');
    const creditCardSelect = document.getElementById('creditCardSelect');
    
    if (!paymentAccountSelect || !creditCardSelectContainer) return;
    
    // Create a completely new element to ensure no stale event listeners
    const newPaymentAccountSelect = document.createElement('select');
    newPaymentAccountSelect.id = 'paymentAccount';
    newPaymentAccountSelect.className = paymentAccountSelect.className;
    
    // Copy options from the old select
    for (let i = 0; i < paymentAccountSelect.options.length; i++) {
        const option = document.createElement('option');
        option.value = paymentAccountSelect.options[i].value;
        option.text = paymentAccountSelect.options[i].text;
        option.selected = paymentAccountSelect.options[i].selected;
        newPaymentAccountSelect.appendChild(option);
    }
    
    // Replace the old select with the new one
    paymentAccountSelect.parentNode.replaceChild(newPaymentAccountSelect, paymentAccountSelect);
    
    // Add the event listener
    newPaymentAccountSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        
        if (selectedValue === 'credit') {
            // Show credit card dropdown when Credit Card is selected
            if (creditCardSelectContainer) {
                creditCardSelectContainer.classList.remove('hidden');
            }
            
            // Make sure a credit card is selected if available
            if (creditCardSelect && creditCardSelect.options.length > 0 && 
                creditCardSelect.selectedIndex === -1) {
                creditCardSelect.selectedIndex = 0;
            }
        } else {
            // Hide credit card dropdown when Checking Account is selected
            if (creditCardSelectContainer) {
                creditCardSelectContainer.classList.add('hidden');
            }
            
            // Reset the credit card selection
            if (creditCardSelect && creditCardSelect.options.length > 0) {
                creditCardSelect.selectedIndex = 0;
            }
        }
    });
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
    
    // Validate credit card selection when payment account is set to credit
    const paymentAccountValue = document.getElementById('paymentAccount').value;
    if (paymentAccountValue === 'credit') {
        const creditCardId = document.getElementById('creditCardSelect').value;
        if (creditCardId === '' || creditCards.length === 0) {
            errors.push('Please select a credit card or add one first');
        }
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
    
    // Check if varying amount is selected for a non-credit/loan bill
    const varyingAmountChecked = document.getElementById('varyingAmountDue').checked;
    const billTypeValue = document.getElementById('billType').value;
    
    // If varying amount is checked and it's not a credit card or loan payment
    if (varyingAmountChecked && billTypeValue !== 'credit' && billTypeValue !== 'loan') {
        // Show the varying amount confirmation modal
        document.getElementById('varyingAmountModal').classList.remove('hidden');
        return;
    }
    
    // If we got here, proceed with saving the bill (either no confirmation needed or called from confirmVaryingAmount)
    saveCurrentBill();
};

// Function to confirm varying amount selection
window.confirmVaryingAmount = function() {
    document.getElementById('varyingAmountModal').classList.add('hidden');
    saveCurrentBill(); // Continue with saving the bill
};

// Function to cancel varying amount selection
window.cancelVaryingAmount = function() {
    document.getElementById('varyingAmountModal').classList.add('hidden');
    document.getElementById('varyingAmountDue').checked = false;
};

// Function that actually saves the bill
function saveCurrentBill() {    const paymentAccountValue = document.getElementById('paymentAccount').value;
    
    // Determine creditCardId value
    let creditCardId = null;
    if (paymentAccountValue === 'credit') {
        creditCardId = document.getElementById('creditCardSelect').value;
    }
    
    const bill = {
        name: billName.value.trim(),
        amount: parseFloat(billAmount.value),
        dueDate: parseInt(billDueDate.value),
        type: billType.value,
        priority: 'normal', // Set default priority since we removed the field
        isPaid: false, // Add isPaid property, default to false
        varyingAmount: document.getElementById('varyingAmountDue').checked, // Add varying amount property
        autoPay: document.getElementById('autoPay').checked, // Add autopay property
        paymentAccount: paymentAccountValue, // Add payment account property
        creditCardId: creditCardId // Always null when not using credit card
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
        
        // If this is a loan payment bill, update the corresponding loan due date
        if (bill.type === 'loan') {
            // Extract loan name from bill name (assumes format "Loan Name Payment")
            const loanName = bill.name.replace(' Payment', '');
            
            // Find matching loan
            const loanIndex = loans.findIndex(loan => loan.name === loanName);
            if (loanIndex !== -1) {
                // Update loan due date to match bill due date
                loans[loanIndex].dueDate = bill.dueDate;
                
                // Re-render loans to reflect updates
                renderLoans();
                updateLoanSummary();
            }
        }
        
        // If this is a credit card payment bill, update the corresponding credit card due date
        if (bill.type === 'credit') {
            // Extract credit card name from bill name (assumes format "Card Name Payment")
            const cardName = bill.name.replace(' Payment', '');
            
            // Find matching credit card
            const cardIndex = creditCards.findIndex(card => card.name === cardName);
            if (cardIndex !== -1) {
                // Update credit card due date to match bill due date
                creditCards[cardIndex].dueDate = bill.dueDate;
                
                // Re-render credit cards to reflect updates
                renderCreditCards();
                updateCreditSummary();
            }
        }
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
          // Create bill status icons HTML
        let statusIcons = '';
        
        // Add varying amount icon if applicable
        if (bill.varyingAmount) {
            statusIcons += `<span title="Varying amount due" class="text-neon-blue mr-2"><i class="fas fa-chart-line"></i></span>`;
        }
        
        // Add autopay icon if applicable
        if (bill.autoPay) {
            statusIcons += `<span title="Autopay enabled" class="text-neon-green mr-2"><i class="fas fa-sync-alt"></i></span>`;
        }
        
        html += `
            <div class="border cyber-border rounded-lg p-4 mb-3 cyber-card bill-item ${paidClass}" data-bill-index="${index}">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center">
                            <i class="fas ${typeIcon} mr-2 text-neon-green"></i>
                            <h3 class="font-medium text-lg cyber-neon">${bill.name}</h3>
                        </div>                        <div class="flex items-center mt-1">
                            <p class="text-sm text-gray-400">Due on ${bill.dueDate}th</p>
                            <div class="ml-3 flex items-center">${statusIcons}</div>
                        </div>
                        <div class="flex items-center mt-1">
                            <p class="text-sm text-gray-400">
                                Payment: ${bill.paymentAccount === 'credit' ? 
                                    `<span class="text-neon-purple">${getCreditCardNameById(bill.creditCardId)}</span>` : 
                                    '<span class="text-neon-blue">Checking Account</span>'}
                            </p>
                        </div>
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
            // Prevent triggering if clicking on a button
            if (e.target.closest('button')) {
                return;
            }
            
            const index = parseInt(this.dataset.billIndex);
            toggleBillPaidStatus(index);
        });
    });
}

function getBillTypeIcon(type) {
    const icons = {
        'housing': 'fa-home',
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

// Function to get credit card name by ID (index)
function getCreditCardNameById(id) {
    if (id === null || id === undefined) return 'Unknown Card';
    
    const cardIndex = parseInt(id);
    if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= creditCards.length) {
        return 'Unknown Card';
    }
    
    return creditCards[cardIndex].name;
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
      // Calculate total amounts (excluding credit card payments)
    const paycheck1TotalAmount = paycheck1.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + bill.amount;
    }, 0);
    const paycheck2TotalAmount = paycheck2.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + bill.amount;
    }, 0);
    
    // Calculate remaining unpaid amounts (excluding credit card payments)
    const paycheck1RemainingAmount = paycheck1.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + (bill.isPaid ? 0 : bill.amount);
    }, 0);
    const paycheck2RemainingAmount = paycheck2.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + (bill.isPaid ? 0 : bill.amount);
    }, 0);
    const totalRemainingAmount = paycheck1RemainingAmount + paycheck2RemainingAmount;
    
    // Get required DOM elements, with null checks
    const paycheck1Bills = document.getElementById('paycheck1Bills');
    const paycheck2Bills = document.getElementById('paycheck2Bills');
    const paycheck1Total = document.getElementById('paycheck1Total');
    const paycheck2Total = document.getElementById('paycheck2Total');      // Update bill names in payment schedule (including all bills regardless of payment account)
    if (paycheck1Bills) {
        // No filtering by payment account - include all bills
        paycheck1Bills.textContent = paycheck1.length > 0 ? 
            paycheck1.map(bill => bill.name).join(', ') : 'No bills scheduled';
    }
    
    if (paycheck2Bills) {
        // No filtering by payment account - include all bills
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
    }      // Update total bills count (including all bills regardless of payment account)
    if (totalBills) {
        const totalBillsCount = bills.length;
        totalBills.textContent = totalBillsCount;
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
    // Only include bills that are paid from checking account, not credit card bills
    const totalBills = bills.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + bill.amount;
    }, 0);
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
    
    // Update the insurance amounts    document.getElementById('healthAmount').textContent = `$${healthCost.toFixed(2)}`;
    document.getElementById('dentalAmount').textContent = `$${dentalCost.toFixed(2)}`;
    document.getElementById('visionAmount').textContent = `$${visionCost.toFixed(2)}`;
    document.getElementById('fsaAmount').textContent = `$${fsaCost.toFixed(2)}`;
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
        
        // If this is a credit card bill, ensure amount is set to zero
        if (bill.type === 'credit') {
            bill.amount = 0;
        }
    });
    
    // Re-render bills to update the UI
    renderBills();
    
    // Update the payment schedule since paid status affects calculations
    updatePaymentSchedule();
    
    // Save changes to localStorage to persist after page reload
    saveToLocalStorage();
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
    // Check if there are any unpaid credit card bills with zero amount
    const unpaidCreditBills = bills.filter(bill => bill.type === 'credit' && !bill.isPaid);
    
    if (unpaidCreditBills.length > 0) {
        // Process credit card bills sequentially
        processUnpaidCreditCards(unpaidCreditBills, 0);
    } else {
        // No unpaid credit card bills, proceed with normal completion
        finalizeMonthCompletion();
    }
};

// Function to process unpaid credit card bills sequentially
function processUnpaidCreditCards(unpaidCreditBills, currentIndex) {
    // Check if we've processed all unpaid credit card bills
    if (currentIndex >= unpaidCreditBills.length) {
        // All credit cards processed, proceed with month completion
        finalizeMonthCompletion();
        return;
    }
    
    // Get the current unpaid credit card bill
    const billIndex = bills.indexOf(unpaidCreditBills[currentIndex]);
    
    // Show the zero bill modal for this credit card
    showZeroBillModal(billIndex);
    
    // Set up a listener for when the modal is closed
    const zeroBillModal = document.getElementById('zeroBillModal');
    const originalOnClick = window.closeZeroBillModal;
    
    // Override the close modal function temporarily
    window.closeZeroBillModal = function() {
        // Restore original function
        window.closeZeroBillModal = originalOnClick;
        
        // Hide the modal
        zeroBillModal.classList.add('hidden');
        
        // Process the next credit card bill
        processUnpaidCreditCards(unpaidCreditBills, currentIndex + 1);
    };
}

// Function to finalize month completion after all credit cards are processed
function finalizeMonthCompletion() {
    const allPaid = areAllBillsPaid();
    
    // Store historical bill data before resetting
    const monthData = {
        month: currentAppMonth,
        year: currentAppYear,
        timestamp: new Date().toISOString(),
        bills: bills.map(bill => ({
            name: bill.name,
            amount: bill.amount,
            type: bill.type,
            dueDate: bill.dueDate,
            isPaid: bill.isPaid,
            paymentAccount: bill.paymentAccount
        }))
    };
    
    // Add to historical data
    historicalBillData.push(monthData);
    
    // Advance to next month
    currentAppMonth++;
    if (currentAppMonth > 11) {
        currentAppMonth = 0;
        currentAppYear++;
    }
    
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
    // Populate the modal with any saved salary data
    populateSalaryModal();
    
    // If this is a new salary calculation (no existing data), set default values to 0
    if (Object.keys(salaryData).length === 0) {
        // Set default values of 0 for bonus percentage, bonus tax rate, 401k, and ESPP
        document.getElementById('modalBonusPercentage').value = '0';
        document.getElementById('modalBonusTax').value = '25';
        document.getElementById('modalRetirementContribution').value = '0';
        document.getElementById('modalEsppContribution').value = '0';
    }
    
    // Show the modal
    document.getElementById('salaryModal').classList.remove('hidden');
    
    // Initialize the correct date fields based on pay frequency
    toggleLastPayDateField();
    
    // Make sure paycheck labels are updated to reflect current pay frequency
    updatePaycheckLabels();
}

// Function to toggle the display of the appropriate date field based on pay frequency selection
function toggleLastPayDateField() {
    const payFrequency = document.getElementById('modalPayFrequency').value;
    const firstPayDateContainer = document.getElementById('firstPayDateContainer');
    const lastPayDateContainer = document.getElementById('lastPayDateContainer');
    
    if (payFrequency === '24') { // Default: save every minute
        firstPayDateContainer.classList.remove('hidden');
        lastPayDateContainer.classList.add('hidden');
    } else { // Bi-weekly
        firstPayDateContainer.classList.add('hidden');
        lastPayDateContainer.classList.remove('hidden');
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
    const fsaCost = parseFloat(document.getElementById('modalFsaContribution').value) || 0;
    const totalInsuranceCost = healthCost + dentalCost + visionCost + fsaCost;
    
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
        
        // Remove first pay date from storage if it exists
        localStorage.removeItem('firstPayDate');
    } 
    // Handle semi-monthly pay date
    else if (periods === 24) {
        const firstPayDateSelect = document.getElementById('firstPayDate');
        if (firstPayDateSelect) {
            const firstPayDate = firstPayDateSelect.value;
            localStorage.setItem('firstPayDate', firstPayDate);
            
            // Also store in salaryData for immediate use
            salaryData.firstPayDate = firstPayDate;
        }
        
        // Remove last pay date from storage if it exists
        localStorage.removeItem('lastPayDate');
    }
    else {
        // For other frequencies, remove both dates from storage
        localStorage.removeItem('lastPayDate');
        localStorage.removeItem('firstPayDate');
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
    document.getElementById('savingsTotal').textContent = `$${savingsTotal.toFixed(2)}`;    document.getElementById('healthAmount').textContent = `$${healthCost.toFixed(2)}`;
    document.getElementById('dentalAmount').textContent = `$${dentalCost.toFixed(2)}`;
    document.getElementById('visionAmount').textContent = `$${visionCost.toFixed(2)}`;
    document.getElementById('fsaAmount').textContent = `$${fsaCost.toFixed(2)}`;
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
        savingsTotal: `$${savingsTotal.toFixed(2)}`,        healthAmount: `$${healthCost.toFixed(2)}`,
        dentalAmount: `$${dentalCost.toFixed(2)}`,
        visionAmount: `$${visionCost.toFixed(2)}`,
        fsaAmount: `$${fsaCost.toFixed(2)}`,
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
    
    // Also save the date information in salary data
    if (periods === 26) {
        const lastPayDate = document.getElementById('lastPayDate').value;
        if (lastPayDate) {
            salaryData.lastPayDate = lastPayDate;
        }
    } else if (periods === 24) {
        const firstPayDate = document.getElementById('firstPayDate').value;
        if (firstPayDate) {
            salaryData.firstPayDate = firstPayDate;
        }
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update paycheck labels based on pay frequency and last pay date
    updatePaycheckLabels();
    
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
    
    if (netPayPerPaycheck <= 0) return;
    
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
        // Bi-weekly: (26 paychecks / 12 months = 2.166... paychecks per month on average)
        payPerMonth = netPayPerPaycheck * (26 / 12);
    } else {
        // Semi-monthly: 2 paychecks per month
        payPerMonth = netPayPerPaycheck * 2;
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
    // Split bills between two paychecks based on pay frequency
    let paycheck1Bills, paycheck2Bills;
    const lastPayDate = localStorage.getItem('lastPayDate');
    
    if (payFrequency === 26 && lastPayDate) {
        // For bi-weekly: Calculate the actual paycheck dates for the current month
        const payDates = calculateBiWeeklyPaycheckDates(lastPayDate);
        
        if (payDates.length >= 2) {
            // For bi-weekly: split bills based on which paycheck date they're closer to
            const firstPaycheckDate = payDates[0].getDate();
            const secondPaycheckDate = payDates[1].getDate();
            
            // For first paycheck, include bills due from 1st of month up to midpoint between paychecks
            const midpoint1 = Math.floor((firstPaycheckDate + secondPaycheckDate) / 2);
            
            paycheck1Bills = bills.filter(bill => {
                // Bills due from 1st of month through midpoint between first and second paycheck
                return bill.dueDate <= midpoint1;
            });
            
            // For second paycheck, include bills due after midpoint
            paycheck2Bills = bills.filter(bill => bill.dueDate > midpoint1);
        } else {
            // Default to standard 15th split if we couldn't calculate bi-weekly dates
            paycheck1Bills = bills.filter(bill => bill.dueDate <= 15);
            paycheck2Bills = bills.filter(bill => bill.dueDate > 15);
        }
    } else {
        // For semi-monthly: split bills at the 15th of the month as usual
        paycheck1Bills = bills.filter(bill => bill.dueDate <= 15);
        paycheck2Bills = bills.filter(bill => bill.dueDate > 15);
    }
      // Calculate bills amounts, excluding credit card bills
    const paycheck1BillsAmount = paycheck1Bills.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + parseFloat(bill.amount || 0);
    }, 0);
    const paycheck2BillsAmount = paycheck2Bills.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + parseFloat(bill.amount || 0);
    }, 0);
    const totalMonthlyBills = paycheck1BillsAmount + paycheck2BillsAmount;
    const annualBills = totalMonthlyBills * 12;
    
    // Calculate per-paycheck amounts
    let payPerPaycheck;
    
    if (payFrequency === 26) {
        // For bi-weekly, some months will have 3 paychecks
        // Check if current month has 3 paychecks
        let hasThirdPaycheckInSameMonth = false;
        
        if (lastPayDate) {
            const payDates = calculateBiWeeklyPaycheckDates(lastPayDate);
            hasThirdPaycheckInSameMonth = payDates.length >= 3;
        }
        
        // Use the actual paycheck amount
        payPerPaycheck = netPayPerPaycheck;
    } else {
        // For semi-monthly, each paycheck is half the monthly pay
        payPerPaycheck = payPerMonth / 2;
    }
    
    // Calculate surplus/deficit for regular paychecks
    const paycheck1Surplus = payPerPaycheck - paycheck1BillsAmount;
    const paycheck2Surplus = payPerPaycheck - paycheck2BillsAmount;
    
    // Calculate third paycheck surplus (no bills assigned to it, pure income)
    const paycheck3Surplus = payPerPaycheck;
    
    const monthlySurplus = payPerMonth - totalMonthlyBills;
      // For annual surplus, we use the total annual income (based on frequency)
    const annualNetIncome = netPayPerPaycheck * payFrequency;
    // Calculate annual values without including bonus in monthly net income
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
      // Update UI with calculated values - Monthly net income should not include bonus amounts
    if (gpMonthlyIncome) gpMonthlyIncome.textContent = `$${payPerMonth.toFixed(2)}`;
    if (gpMonthlyBills) gpMonthlyBills.textContent = `$${totalMonthlyBills.toFixed(2)}`;
    
    // Set color based on surplus or deficit
    const monthlySurplusColor = monthlySurplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpMonthlySurplus) {
        gpMonthlySurplus.textContent = `${monthlySurplus >= 0 ? '' : '-'}$${Math.abs(monthlySurplus).toFixed(2)}`;
        gpMonthlySurplus.className = `font-bold ${monthlySurplusColor}`;
    }
    
    // Variable to track if we have a third paycheck in the same month
    let hasThirdPaycheckInSameMonth = false;
    
    if (payFrequency === 26 && lastPayDate) {
        const payDates = calculateBiWeeklyPaycheckDates(lastPayDate);
        hasThirdPaycheckInSameMonth = payDates.length >= 3;
        
        // Get the third paycheck section
        const gpThirdPaycheckSection = document.getElementById('gpThirdPaycheckSection');
        
        // If we have 3 paychecks, make sure the third paycheck section is visible
        if (hasThirdPaycheckInSameMonth && gpThirdPaycheckSection) {
            // Make sure to remove the hidden class
            gpThirdPaycheckSection.classList.remove('hidden');
            
            // Update third paycheck values
            if (gpPaycheck3Net) gpPaycheck3Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
            if (gpPaycheck3Bills) gpPaycheck3Bills.textContent = `$0.00`;
            if (gpPaycheck3Surplus) {
                gpPaycheck3Surplus.textContent = `$${paycheck3Surplus.toFixed(2)}`;
                gpPaycheck3Surplus.className = 'font-bold text-neon-green';
            }
            
            // Update the heading for the third paycheck section
            const heading = gpThirdPaycheckSection.querySelector('h4');
            if (heading) {
                if (payDates.length >= 3) {
                    const date3 = payDates[2].getDate();
                    heading.textContent = `Paycheck 3 (${date3}${getOrdinalSuffix(date3)})`;
                } else {
                    heading.textContent = 'Extra Bi-Weekly Paycheck';
                }
            }
        } else if (gpThirdPaycheckSection) {
            // Hide the section if there's no third paycheck
            gpThirdPaycheckSection.classList.add('hidden');
        }
    } else {
        // Hide the third paycheck section for semi-monthly pay
        const gpThirdPaycheckSection = document.getElementById('gpThirdPaycheckSection');
        if (gpThirdPaycheckSection) {
            gpThirdPaycheckSection.classList.add('hidden');
        }
    }
    
    // Update paycheck values
    if (gpPaycheck1Net) gpPaycheck1Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
    if (gpPaycheck1Bills) gpPaycheck1Bills.textContent = `$${paycheck1BillsAmount.toFixed(2)}`;
    
    const paycheck1SurplusColor = paycheck1Surplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpPaycheck1Surplus) {
        gpPaycheck1Surplus.textContent = `${paycheck1Surplus >= 0 ? '' : '-'}$${Math.abs(paycheck1Surplus).toFixed(2)}`;
        gpPaycheck1Surplus.className = `font-bold ${paycheck1SurplusColor}`;
    }
    
    if (gpPaycheck2Net) gpPaycheck2Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
    if (gpPaycheck2Bills) gpPaycheck2Bills.textContent = `$${paycheck2BillsAmount.toFixed(2)}`;
    
    const paycheck2SurplusColor = paycheck2Surplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpPaycheck2Surplus) {
        gpPaycheck2Surplus.textContent = `${paycheck2Surplus >= 0 ? '' : '-'}$${Math.abs(paycheck2Surplus).toFixed(2)}`;
        gpPaycheck2Surplus.className = `font-bold ${paycheck2SurplusColor}`;
    }
    
    // Update annual projections
    if (gpAnnualIncome) gpAnnualIncome.textContent = `$${annualNetIncome.toFixed(2)}`;
    if (gpAnnualBonus) gpAnnualBonus.textContent = `$${afterTaxBonus.toFixed(2)}`;
    if (gpAnnualBills) gpAnnualBills.textContent = `$${annualBills.toFixed(2)}`;
    
    const annualSurplusColor = annualSurplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpAnnualSurplus) {
        gpAnnualSurplus.textContent = `${annualSurplus >= 0 ? '' : '-'}$${Math.abs(annualSurplus).toFixed(2)}`;
        gpAnnualSurplus.className = `font-bold ${annualSurplusColor}`;
    }
    
    const annualSurplusWithBonusColor = annualSurplusWithBonus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpAnnualSurplusWithBonus) {
        gpAnnualSurplusWithBonus.textContent = `${annualSurplusWithBonus >= 0 ? '' : '-'}$${Math.abs(annualSurplusWithBonus).toFixed(2)}`;
        gpAnnualSurplusWithBonus.className = `font-bold ${annualSurplusWithBonusColor}`;
    }
    
    // Update progress bar
    const progressFillColor = monthlySurplus >= 0 ? "cyber-green" : "cyber-pink";
    if (profitProgress) {
        profitProgress.style.width = `${profitRatio}%`;
        profitProgress.className = `cyber-progress-fill ${progressFillColor}`;
    }
    
    // Update status text
    let profitStatusText = '';
    if (monthlySurplus >= 0) {
        profitStatusText = `You have a monthly surplus of $${monthlySurplus.toFixed(2)} (${profitRatio.toFixed(1)}% profit)`;
    } else {
        profitStatusText = `You have a monthly deficit of $${Math.abs(monthlySurplus).toFixed(2)} (${Math.abs(profitRatio).toFixed(1)}% loss)`;
    }
    if (profitStatus) profitStatus.textContent = profitStatusText;
      // Store profit calculation data (excluding bonus from monthly income)
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
    if (hasThirdPaycheckInSameMonth) {
        profitData.gpPaycheck3Net = `$${payPerPaycheck.toFixed(2)}`;
        profitData.gpPaycheck3Bills = `$0.00`;
        profitData.gpPaycheck3Surplus = `$${payPerPaycheck.toFixed(2)}`;
        profitData.gpPaycheck3SurplusClass = 'font-bold text-neon-green';
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
        
        // Ensure initial state is properly set
        if (creditRatingChevron) {
            creditRatingChevron.style.transform = creditRatingLegendContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        
        creditRatingLegendHeader.addEventListener('click', function() {
            creditRatingLegendContent.classList.toggle('hidden');
            creditRatingLegendHeader.classList.toggle('active');
            if (creditRatingChevron) {
                creditRatingChevron.style.transform = creditRatingLegendContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    }
    
    // Tax Bracket section
    const taxBracketHeader = document.getElementById('taxBracketHeader');
    const taxBracketContent = document.getElementById('taxBracketContent');
    
    if (taxBracketHeader && taxBracketContent) {
        const taxBracketChevron = taxBracketHeader.querySelector('i.fa-chevron-down');
        
        // Ensure initial state is properly set
        if (taxBracketChevron) {
            taxBracketChevron.style.transform = taxBracketContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        
        taxBracketHeader.addEventListener('click', function() {
            taxBracketContent.classList.toggle('hidden');
            taxBracketHeader.classList.toggle('active');
            if (taxBracketChevron) {
                taxBracketChevron.style.transform = taxBracketContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    }
    
    // Bill Trends section
    const billTrendsHeader = document.getElementById('billTrendsHeader');
    const billTrendsContent = document.getElementById('billTrendsContent');
    
    if (billTrendsHeader && billTrendsContent) {
        const billTrendsChevron = billTrendsHeader.querySelector('i.fa-chevron-down');
        
        // Ensure initial state is properly set
        if (billTrendsChevron) {
            billTrendsChevron.style.transform = billTrendsContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        
        billTrendsHeader.addEventListener('click', function() {
            billTrendsContent.classList.toggle('hidden');
            billTrendsHeader.classList.toggle('active');
            if (billTrendsChevron) {
                billTrendsChevron.style.transform = billTrendsContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
            
            // If expanding and we have historical data, render the charts
            if (!billTrendsContent.classList.contains('hidden') && historicalBillData.length > 0) {
                window.renderBillTrendsCharts();
            }
        });
    }
}


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
    
    // Set first payment date to current date by default (for new loans)
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    document.getElementById('firstPaymentDate').value = defaultDate;
    
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
    
    // Set first payment date if it exists
    if (loan.firstPaymentDate) {
        document.getElementById('firstPaymentDate').value = loan.firstPaymentDate;
    } else {
        document.getElementById('firstPaymentDate').value = '';
    }
    
    document.getElementById('editLoanIndex').value = index;
    
    // Set up mortgage fields event handler
    setupLoanTypeChangeHandler();
    
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
    
    // Validate first payment date if provided
    if (document.getElementById('firstPaymentDate').value) {
        const firstPaymentDate = new Date(document.getElementById('firstPaymentDate').value);
        if (isNaN(firstPaymentDate.getTime())) {
            errors.push('First Payment Date must be a valid date');
        }
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
        startDate: new Date().toISOString().split('T')[0],
        firstPaymentDate: document.getElementById('firstPaymentDate').value || new Date().toISOString().split('T')[0]
    };
      // Add additional principal payment for all loan types
    loan.additionalPrincipal = parseFloat(document.getElementById('additionalPrincipal').value) || 0;
    
    // Add mortgage-specific fields if loan type is mortgage
    if (loan.type === 'mortgage') {
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
        
        // Find and update any existing bill for this loan
        const billIndex = bills.findIndex(bill => 
            bill.name === `${loans[editIndex].name} Payment` && bill.type === 'loan');
            
        if (billIndex !== -1) {
            // Calculate the monthly payment
            const monthlyPayment = calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term);
                  // Calculate total monthly payment
            let totalMonthlyPayment = monthlyPayment;
            
            // Add additional principal payment for all loan types
            totalMonthlyPayment += loan.additionalPrincipal || 0;
            
            // Add mortgage-specific costs if applicable
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
            
            // Update the bill amount and due date
            bills[billIndex].amount = totalMonthlyPayment;
            bills[billIndex].dueDate = loan.dueDate;
            
            // Re-render bills to reflect updates
            renderBills();
            updatePaymentSchedule();
        }
    } else {
        // Add new loan
        loans.push(loan);
        
        // Create a corresponding bill entry
        const monthlyPayment = calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term);
          // Calculate total monthly payment
        let totalMonthlyPayment = monthlyPayment;
        
        // Add additional principal payment for all loan types
        totalMonthlyPayment += loan.additionalPrincipal || 0;
        
        // For mortgages, include other additional costs in the monthly payment
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
            priority: 'high',
            paymentAccount: 'checking', // Default to checking account
            creditCardId: null
        };
        
        // Add the new bill
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
        loansContainer.innerHTML = '<p class="text-gray-400 text-center py-4 md:col-span-3 lg:col-span-4">No loans added yet</p>';
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
          // Calculate total monthly payment including additional costs
        let totalMonthlyPayment = monthlyPayment;
        let mortgageDetails = '';
        
        // Add additional principal for all loan types if provided
        const additionalPrincipal = loan.additionalPrincipal || 0;
        totalMonthlyPayment += additionalPrincipal;
        
        if (loan.type === 'mortgage') {
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
                </div>                <div class="grid grid-cols-4 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Interest Rate</p>
                        <p class="font-medium">${loan.interestRate.toFixed(2)}%</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">${loan.type === 'mortgage' ? 'Principal & Interest' : 'Base Payment'}</p>
                        <p class="font-medium text-neon-pink">$${monthlyPayment.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Loan Term</p>
                        <p class="font-medium">${loan.term ? `${loan.term} months` : 'Not specified'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Payments Remaining</p>
                        <p class="font-medium text-neon-green">${calculateRemainingPayments(
                            loan.balance, 
                            loan.interestRate, 
                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                            0
                        )}</p>
                    </div>
                </div>
                
                ${loan.firstPaymentDate ? `
                <div class="mt-2">
                    <p class="text-sm text-gray-400">First Payment Date: <span class="text-white">${new Date(loan.firstPaymentDate).toLocaleDateString()}</span></p>
                </div>
                ` : ''}
                
                ${additionalPrincipal > 0 && loan.type !== 'mortgage' ? `
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Additional Principal</p>
                        <p class="font-medium text-neon-green">$${additionalPrincipal.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Total Monthly Payment</p>
                        <p class="font-medium text-neon-blue">$${totalMonthlyPayment.toFixed(2)}</p>
                    </div>
                </div>
                ` : ''}
                
                ${mortgageDetails}
                
                <div class="mt-4">
                    <div class="flex justify-between text-sm text-gray-400">
                        <p>Total interest over life of loan:</p>
                        <p class="text-neon-purple">$${calculateTotalInterest(loan.originalAmount, loan.interestRate, loan.term).toFixed(2)}</p>
                    </div>
                </div>

                ${additionalPrincipal > 0 ? `
                <!-- Impact of additional principal payments -->
                <div class="mt-4 border-t border-gray-700 pt-4">
                    <h4 class="text-sm font-medium text-white mb-2">Additional Principal Payment Impact</h4>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs text-gray-400">Without Extra Principal</p>
                            <div class="space-y-1">
                                <p class="font-medium text-neon-blue">Months: <span class="text-white">${calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    0
                                )}</span></p>
                                <p class="font-medium text-neon-blue">Interest: <span class="text-white">$${calculateTotalInterestPaid(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    0
                                ).toFixed(2)}</span></p>
                                <p class="font-medium text-neon-blue">Payoff: <span class="text-white">${
                                    formatPayoffDate(calculatePayoffDate(
                                        loan.firstPaymentDate,
                                        calculateRemainingPayments(
                                            loan.balance, 
                                            loan.interestRate, 
                                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                            0
                                        )
                                    ))
                                }</span></p>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">With Extra Principal</p>
                            <div class="space-y-1">
                                <p class="font-medium text-neon-green">Months: <span class="text-white">${calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    additionalPrincipal
                                )}</span></p>
                                <p class="font-medium text-neon-green">Interest: <span class="text-white">$${calculateTotalInterestPaid(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    additionalPrincipal
                                ).toFixed(2)}</span></p>
                                <p class="font-medium text-neon-green">Payoff: <span class="text-white">${
                                    formatPayoffDate(calculatePayoffDate(
                                        loan.firstPaymentDate,
                                        calculateRemainingPayments(
                                            loan.balance, 
                                            loan.interestRate, 
                                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                            additionalPrincipal
                                        )
                                    ))
                                }</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 bg-glass-blue p-3 rounded-lg">
                        <h5 class="text-sm font-medium text-white mb-2">Impact Summary:</h5>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="text-neon-yellow">
                                <p class="text-xs">Time Saved</p>
                                <p class="font-medium text-neon-yellow">${calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    0
                                ) - calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    additionalPrincipal
                                )} months</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-400">Interest Saved</p>
                                <p class="font-medium text-neon-green">$${(
                                    calculateTotalInterestPaid(
                                        loan.balance, 
                                        loan.interestRate, 
                                        calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                        0
                                    ) - calculateTotalInterestPaid(
                                        loan.balance, 
                                        loan.interestRate, 
                                        calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                        additionalPrincipal
                                    )
                                ).toFixed(2)}</p>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">Monthly Cost of Extra Principal: <span class="font-medium text-neon-green">$${additionalPrincipal.toFixed(2)}</span></p>
                        <p class="text-xs text-white mt-1">By adding <span class="text-neon-green">$${additionalPrincipal.toFixed(2)}</span> to your monthly payment, you'll save <span class="text-neon-yellow">${calculateRemainingPayments(
                            loan.balance, 
                            loan.interestRate, 
                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                            0
                        ) - calculateRemainingPayments(
                            loan.balance, 
                            loan.interestRate, 
                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                            additionalPrincipal
                        )} months</span> of payments and <span class="text-neon-green">$${(
                            calculateTotalInterestPaid(
                                loan.balance, 
                                loan.interestRate, 
                                calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                0
                            ) - calculateTotalInterestPaid(
                                loan.balance, 
                                loan.interestRate, 
                                calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                additionalPrincipal
                            )
                        ).toFixed(2)}                                </span> in interest.</p>
                    </div>
                </div>
                ` : ''}
                
                ${loan.term && loan.term > 0 && typeof generateAmortizationChart === 'function' ? generateAmortizationChart(loan) : ''}
            </div>
        `;
    });
    
    loansContainer.innerHTML = html;
}

// Bill Amount Trends Chart Implementation
window.renderBillTrendsCharts = function() {
    const chartContainer = document.getElementById('bill-trends-charts');
    if (!chartContainer) return;

    if (!historicalBillData || historicalBillData.length === 0) {
        chartContainer.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <p>No historical data available yet.</p>
                <p class="text-sm mt-2">Complete a month to start tracking bill amount trends.</p>
            </div>
        `;
        return;
    }

    // Get unique bill names across all historical data
    const billNames = [...new Set(historicalBillData.flatMap(monthData => 
        monthData.bills.map(bill => bill.name)
    ))];

    if (billNames.length === 0) {
        chartContainer.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <p>No bill data found in historical records.</p>
            </div>
        `;
        return;
    }

    // Get month labels for table headers
    const monthLabels = historicalBillData.map(monthData => 
        `${getMonthName(monthData.month)} ${monthData.year}`
    ).slice(-6); // Show only last 6 months

    // Create compact table view
    let tableHTML = `
        <div class="space-y-4">
            <div class="text-center mb-4">
                <h3 class="text-lg font-medium text-white mb-2">Bill Amount Trends</h3>
                <p class="text-sm text-gray-400">Recent bill amounts and trends</p>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="text-left text-white font-medium p-3">Bill</th>
                            <th class="text-center text-white font-medium p-2">Latest</th>
                            <th class="text-center text-white font-medium p-2">Trend</th>
                            <th class="text-center text-white font-medium p-2">Avg</th>
                            <th class="text-center text-white font-medium p-2">Change</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    // Process each bill
    billNames.forEach(billName => {
        const billData = historicalBillData.map(monthData => {
            const bill = monthData.bills.find(b => b.name === billName);
            return bill ? bill.amount : 0;
        }).filter(amount => amount > 0);

        if (billData.length > 0) {
            const latestAmount = billData[billData.length - 1];
            const avgAmount = billData.reduce((sum, amount) => sum + amount, 0) / billData.length;
            const changePercent = billData.length > 1 ? 
                ((latestAmount - billData[billData.length - 2]) / billData[billData.length - 2] * 100) : 0;
            
            // Create mini sparkline data
            const sparklineData = billData.slice(-6); // Last 6 months
            const minAmount = Math.min(...sparklineData);
            const maxAmount = Math.max(...sparklineData);
            
            // Generate SVG sparkline
            const sparklineSVG = generateSparkline(sparklineData, minAmount, maxAmount);
            
            // Determine trend direction
            let trendIcon = '→';
            let trendColor = 'text-gray-400';
            if (changePercent > 5) {
                trendIcon = '↗';
                trendColor = 'text-red-400';
            } else if (changePercent < -5) {
                trendIcon = '↘';
                trendColor = 'text-green-400';
            }

            tableHTML += `
                <tr class="border-b border-gray-800 hover:bg-gray-800/50">
                    <td class="p-3">
                        <div class="text-white font-medium">${billName}</div>
                        <div class="text-xs text-gray-400">${billData.length} months</div>
                    </td>
                    <td class="text-center p-2">
                        <span class="text-white font-medium">$${latestAmount.toFixed(0)}</span>
                    </td>
                    <td class="text-center p-2">
                        <div class="flex justify-center items-center">
                            ${sparklineSVG}
                        </div>
                    </td>
                    <td class="text-center p-2">
                        <span class="text-gray-300">$${avgAmount.toFixed(0)}</span>
                    </td>
                    <td class="text-center p-2">
                        <div class="flex items-center justify-center">
                            <span class="${trendColor} text-lg mr-1">${trendIcon}</span>
                            <span class="${Math.abs(changePercent) > 5 ? trendColor : 'text-gray-400'} text-xs">
                                ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%
                            </span>
                        </div>
                    </td>
                </tr>
            `;
        }
    });

    tableHTML += `
                    </tbody>
                </table>
            </div>
            
            <!-- Summary section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                <div class="text-center">
                    <div class="text-lg font-medium text-neon-blue">$${calculateTotalLatest()}</div>
                    <div class="text-xs text-gray-400">Current Total</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-medium text-neon-green">$${calculateTotalAverage()}</div>
                    <div class="text-xs text-gray-400">Average Total</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-medium ${getTotalChangeColor()}">${getTotalChangeText()}</div>
                    <div class="text-xs text-gray-400">Monthly Change</div>
                </div>
            </div>
        </div>
    `;

    chartContainer.innerHTML = tableHTML;

    // Helper functions
    function calculateTotalLatest() {
        return billNames.reduce((total, billName) => {
            const billData = historicalBillData[historicalBillData.length - 1].bills.find(b => b.name === billName);
            return total + (billData ? billData.amount : 0);
        }, 0).toFixed(0);
    }

    function calculateTotalAverage() {
        const totals = historicalBillData.map(monthData => 
            monthData.bills.reduce((sum, bill) => sum + bill.amount, 0)
        );
        return (totals.reduce((sum, total) => sum + total, 0) / totals.length).toFixed(0);
    }

    function getTotalChangeColor() {
        const change = getTotalChange();
        if (change > 50) return 'text-red-400';
        if (change < -50) return 'text-green-400';
        return 'text-gray-400';
    }

    function getTotalChangeText() {
        const change = getTotalChange();
        return `${change > 0 ? '+' : ''}$${change.toFixed(0)}`;
    }

    function getTotalChange() {
        if (historicalBillData.length < 2) return 0;
        const current = historicalBillData[historicalBillData.length - 1].bills.reduce((sum, bill) => sum + bill.amount, 0);
        const previous = historicalBillData[historicalBillData.length - 2].bills.reduce((sum, bill) => sum + bill.amount, 0);
        return current - previous;
    }
}

// Generate mini sparkline SVG
function generateSparkline(data, min, max) {
    if (data.length < 2) return '<span class="text-gray-500 text-xs">—</span>';
    
    const width = 60;
    const height = 20;
    const padding = 2;
    const range = max - min || 1;
    
    let pathData = '';
    data.forEach((value, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((value - min) / range) * (height - 2 * padding);
        pathData += index === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });
    
    // Determine line color based on trend
    const trend = data[data.length - 1] - data[0];
    const strokeColor = trend > 0 ? '#ef4444' : trend < 0 ? '#10b981' : '#6b7280';
    
    return `
        <svg width="${width}" height="${height}" class="inline-block">
            <path d="${pathData}" stroke="${strokeColor}" stroke-width="1.5" fill="none" opacity="0.8"/>
            <circle cx="${padding + ((data.length - 1) * (width - 2 * padding)) / (data.length - 1)}" 
                    cy="${height - padding - ((data[data.length - 1] - min) / range) * (height - 2 * padding)}" 
                    r="1.5" fill="${strokeColor}"/>
        </svg>
    `;
}

window.renderLineChart = function(canvas, data, title) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up colors
    const backgroundColor = '#1f2937'; // gray-800
    const gridColor = '#374151'; // gray-700
    const lineColor = '#60a5fa'; // blue-400 (neon-blue)
    const pointColor = '#3b82f6'; // blue-500
    const textColor = '#d1d5db'; // gray-300
    
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    // Calculate scales
    const maxAmount = Math.max(...data.map(d => d.amount));
    const minAmount = Math.min(...data.map(d => d.amount));
    const amountRange = maxAmount - minAmount || 1;
    
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Y-axis labels
        const value = maxAmount - (amountRange * i) / 5;
        ctx.fillStyle = textColor;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`$${value.toFixed(0)}`, padding - 5, y + 3);
    }
    
    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth * i) / (data.length - 1);
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
        
        // X-axis labels (show every other month if too many)
        if (data.length <= 6 || i % 2 === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(x, height - padding + 15);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(data[i].month, 0, 0);
            ctx.restore();
        }
    }
    
    // Draw line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth * i) / (data.length - 1);
        const y = padding + chartHeight - ((data[i].amount - minAmount) / amountRange * chartHeight);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = pointColor;
    for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth * i) / (data.length - 1);
        const y = padding + chartHeight - ((data[i].amount - minAmount) / amountRange * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Show amount on hover (simplified - just show all amounts)
        ctx.fillStyle = textColor;
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`$${data[i].amount.toFixed(0)}`, x, y - 8);
    }
}

window.getMonthName = function(monthNumber) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || 'Unknown';
}

function updateLoanSummary() {
    const totalOriginalValue = loans.reduce((sum, loan) => sum + loan.originalAmount, 0);
    const totalBalanceValue = loans.reduce((sum, loan) => sum + loan.balance, 0);
    const totalPayoffPercent = totalOriginalValue > 0 ? (1 - (totalBalanceValue / totalOriginalValue)) * 100 : 0;
      // Calculate total monthly payments including all additional costs
    const totalMonthlyPayments = loans.reduce((sum, loan) => {
        // Calculate base loan payment
        const basePayment = calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term);
        
        // Add additional principal payment for all loan types
        const additionalPrincipal = loan.additionalPrincipal || 0;
        
        // Start with the base payment plus additional principal
        let totalPaymentForLoan = basePayment + additionalPrincipal;
        
        // Add mortgage-specific costs
        if (loan.type === 'mortgage') {
            // Add PMI
            totalPaymentForLoan += loan.pmi || 0;
            
            // Add monthly property tax
            if (loan.propertyTax) {
                totalPaymentForLoan += loan.propertyTax / 12;
            }
            
            // Add monthly property insurance
            if (loan.propertyInsurance) {
                totalPaymentForLoan += loan.propertyInsurance / 12;
            }
        }
        
        return sum + totalPaymentForLoan;
    }, 0);
    
    // Update loan count
    document.getElementById('totalLoans').textContent = loans.length;
    
    // Update total original amount
    document.getElementById('totalOriginalAmount').innerHTML = `<span class="text-neon-pink">$${totalOriginalValue.toFixed(2)}</span>`;
    
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

// Calculate remaining payments based on current balance and payment amount
function calculateRemainingPayments(balance, interestRate, regularPayment, additionalPrincipal = 0) {
    // If no regular payment, return 0
    if (!regularPayment || regularPayment <= 0) {
        return 0;
    }
    
    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 100 / 12;
    const totalPayment = regularPayment + additionalPrincipal;
    
    // If interest rate is zero, simple division
    if (monthlyRate === 0) {
        return Math.ceil(balance / totalPayment);
    }
    
    // Simulate remaining payments
    let remainingBalance = balance;
    let paymentCount = 0;
    
    while (remainingBalance > 0 && paymentCount < 1200) { // Limit to 100 years (1200 months)
        // Calculate interest for this period
        const interestAmount = remainingBalance * monthlyRate;
        
        // Calculate principal portion of regular payment
        let principalPaid = regularPayment - interestAmount;
        if (principalPaid > remainingBalance) {
            principalPaid = remainingBalance;
        }
        
        // Add additional principal payment (up to the remaining balance)
        const additionalPrincipalPaid = Math.min(additionalPrincipal, remainingBalance - principalPaid);
        
        // Reduce balance by principal paid and additional principal
        remainingBalance -= (principalPaid + additionalPrincipalPaid);
        
        paymentCount++;
    }
    
    return paymentCount;
}

// Calculate total interest paid with a given payment schedule
function calculateTotalInterestPaid(balance, interestRate, regularPayment, additionalPrincipal = 0) {
    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 100 / 12;
    const totalPayment = regularPayment + additionalPrincipal;
    
    // If interest rate is zero or payments are zero, return 0
    if (monthlyRate === 0 || totalPayment <= 0) {
        return 0;
    }
    
    // Simulate payments and track total interest
    let remainingBalance = balance;
    let totalInterest = 0;
    let paymentCount = 0;
    
    while (remainingBalance > 0 && paymentCount < 1200) { // Limit to 100 years (1200 months)
        // Calculate interest for this period
        const interestAmount = remainingBalance * monthlyRate;
        totalInterest += interestAmount;
        
        // Calculate principal portion of regular payment
        let principalPaid = regularPayment - interestAmount;
        if (principalPaid > remainingBalance) {
            principalPaid = remainingBalance;
        }
        
        // Add additional principal payment (up to the remaining balance)
        const additionalPrincipalPaid = Math.min(additionalPrincipal, remainingBalance - principalPaid);
        
        // Reduce balance by principal paid and additional principal
        remainingBalance -= (principalPaid + additionalPrincipalPaid);
        
        paymentCount++;
    }
    
    return totalInterest;
}

// Calculate expected payoff date based on first payment date and remaining payments
function calculatePayoffDate(firstPaymentDate, remainingPayments) {
    // If no first payment date or no remaining payments, return null
    if (!firstPaymentDate || !remainingPayments) {
        return null;
    }
    
    try {
        // Create a new date object from the first payment date - only used for validation
        const firstPaymentDateObj = new Date(firstPaymentDate);
        
        // Check if the date is valid
        if (isNaN(firstPaymentDateObj.getTime())) {
            return null;
        }
        
        // Calculate payoff date by starting from current date and adding remaining payments
        // This is the key change - we always calculate from current date, not first payment date
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + remainingPayments);
        
        // Set the day to match the original payment's day (to maintain same day of month for payments)
        const paymentDay = firstPaymentDateObj.getDate();
        
        // Only set the day if it's a valid day for the target month
        const lastDayOfTargetMonth = new Date(payoffDate.getFullYear(), payoffDate.getMonth() + 1, 0).getDate();
        payoffDate.setDate(Math.min(paymentDay, lastDayOfTargetMonth));
        
        return payoffDate;
    } catch (error) {
        console.error("Error calculating payoff date:", error);
        return null;
    }
}

// Format a date for display
function formatPayoffDate(date) {
    if (!date) return 'N/A';
    
    try {
        // Format date as MMM DD, YYYY (e.g., May 15, 2025) to provide better clarity
        return date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'N/A';
    }
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
    
    // If the bill is already paid, just mark it as unpaid
    if (bill.isPaid) {
        bill.isPaid = false;
        
        // If this is a credit card bill, reset its amount to zero when unpaid
        if (bill.type === 'credit') {
            bill.amount = 0;
        }
        
        // Update the UI
        renderBills();
        updatePaymentSchedule();
        
        // Save changes to localStorage
        saveToLocalStorage();
        return;
    }
    
    // If the bill has varying amount property and is not a credit/loan type
    if (bill.varyingAmount && bill.type !== 'credit' && bill.type !== 'loan') {
        // Show the zero bill modal which we'll reuse for amount entry
        showZeroBillModal(index, true); // Pass true to indicate this is a varying amount bill
    }
    // If the bill is unpaid with zero amount, show the zero bill confirmation modal
    else if (bill.amount === 0) {
        // For zero amount bills, show the zero bill confirmation modal
        showZeroBillModal(index);
    } else {
        // For regular bills, just toggle paid status
        bill.isPaid = !bill.isPaid;
        
        // Update the UI
        renderBills();
        updatePaymentSchedule();
        
        // Save changes to localStorage
        saveToLocalStorage();
    }
}

// Function to show modal for zero-amount bills or varying amount bills
function showZeroBillModal(billIndex, isVaryingAmount = false) {
    // Get the bill at the specified index
    const bill = bills[billIndex];
    
    // Set bill index in modal
    document.getElementById('zeroBillIndex').value = billIndex;
    
    // Update modal title with bill name
    document.getElementById('zeroBillModalTitle').textContent = `Pay ${bill.name}`;
    
    // Clear any previous value
    document.getElementById('zeroBillAmount').value = '';
    
    const modalMessage = document.querySelector('#zeroBillModal .p-4.mb-4.bg-glass-blue');
    
    if (isVaryingAmount) {
        // This is a varying amount bill - update the message
        modalMessage.querySelector('.text-white').innerHTML = `
            <p class="mb-2"><i class="fas fa-info-circle text-neon-blue mr-2"></i>This bill has a varying monthly amount.</p>
            <p>Please enter the actual amount for this month:</p>
        `;
        
        // Show the amount field immediately for varying amount bills
        document.getElementById('zeroBillAmountField').classList.remove('hidden');
        document.getElementById('initialButtonsContainer').classList.add('hidden');
        document.getElementById('amountEntryButtonsContainer').classList.remove('hidden');
    } else {
        // This is a zero amount bill - use the original message
        modalMessage.querySelector('.text-white').innerHTML = `
            <p class="mb-2"><i class="fas fa-info-circle text-neon-blue mr-2"></i>This bill has a $0.00 amount.</p>
            <p>Would you like to enter an amount or confirm zero payment?</p>
        `;
        
        // Hide amount input field initially for zero amount bills
        document.getElementById('zeroBillAmountField').classList.add('hidden');
        document.getElementById('initialButtonsContainer').classList.remove('hidden');
        document.getElementById('amountEntryButtonsContainer').classList.add('hidden');
    }
    
    // Show the modal
    document.getElementById('zeroBillModal').classList.remove('hidden');
}

// Function to show the amount field in the zero bill modal
window.showZeroBillAmountField = function() {
    // Show the amount field
    document.getElementById('zeroBillAmountField').classList.remove('hidden');
    
    // Focus on the amount input
    document.getElementById('zeroBillAmount').focus();
    
    // Hide the initial buttons
    document.getElementById('initialButtonsContainer').classList.add('hidden');
    
    // Show the amount entry buttons
    document.getElementById('amountEntryButtonsContainer').classList.remove('hidden');
}

// Function to close the zero bill modal
window.closeZeroBillModal = function() {
    document.getElementById('zeroBillModal').classList.add('hidden');
}

// Function to save zero bill payment
window.saveZeroBillPayment = function(confirmZero = false) {
    // Get bill index from hidden field
    const billIndex = parseInt(document.getElementById('zeroBillIndex').value);
    
    // Get payment amount from input field
    const paymentAmount = document.getElementById('zeroBillAmount').value;
    
    // Validate amount (zero or positive number) if not confirming zero
    if (!confirmZero) {
        const amount = parseFloat(paymentAmount);
        if (paymentAmount === '' || isNaN(amount) || amount < 0) {
            alert('Please enter a valid payment amount (zero or positive number)');
            return;
        }
    }
    
    // Update the bill
    if (billIndex >= 0 && billIndex < bills.length) {
        // If confirming zero, simply mark as paid
        if (confirmZero) {
            bills[billIndex].isPaid = true;
        } else {
            // Otherwise update the amount and mark as paid
            const amount = parseFloat(paymentAmount);
            bills[billIndex].amount = amount;
            bills[billIndex].isPaid = true;
        }
        
        // Update the UI
        renderBills();
        updatePaymentSchedule();
        
        // Save changes to localStorage
        saveToLocalStorage();
    }
    
    // Close the modal
    closeZeroBillModal();
}

// Function to handle "Enter Amount" button click
window.enterZeroBillAmount = function() {
    saveZeroBillPayment(false);
}

// Function to handle "Confirm Zero" button click
window.confirmZeroBill = function() {
    saveZeroBillPayment(true);
}

// Salary Modal Functions

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

// Function to calculate bi-weekly paycheck dates for a given month
function calculateBiWeeklyPaycheckDates(lastPayDate) {
    // Parse the last pay date with time zone normalization
    // Create date at noon local time to avoid any DST issues
    const lastPayString = lastPayDate.split('T')[0]; // Get just the date part
    const lastPay = new Date(`${lastPayString}T12:00:00`);
    
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Create date objects for the first and last day of the current month (at noon)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1, 12, 0, 0);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 12, 0, 0);
    
    // Array to store pay dates in the current month
    const payDates = [];
    
    // Calculate days between pay periods (bi-weekly = 14 days)
    const daysInPayPeriod = 14;
    
    // Find pay dates before and after the reference date
    let prevDate = new Date(lastPay);
    
    // First, go backward until we are before the first day of the month
    while (prevDate >= firstDayOfMonth) {
        const newDate = new Date(prevDate);
        newDate.setDate(prevDate.getDate() - daysInPayPeriod);
        prevDate = newDate;
    }
    
    // Now, move forward by one pay period to potentially get our first date in the month
    let currentDate1 = new Date(prevDate);
    currentDate1.setDate(currentDate1.getDate() + daysInPayPeriod);
    
    // Now collect all pay dates in the current month
    while (currentDate1 <= lastDayOfMonth) {
        if (currentDate1 >= firstDayOfMonth) {
            // Add a copy of the date to avoid reference issues
            // Make sure to normalize the date to midnight on the correct day
            const normalizedDate = new Date(currentDate1);
            payDates.push(normalizedDate);
        }
        
        // Move to next pay period
        const nextDate = new Date(currentDate1);
        nextDate.setDate(currentDate1.getDate() + daysInPayPeriod);
        currentDate1 = nextDate;
    }
    
    // Sort the pay dates chronologically
    payDates.sort((a, b) => a - b);
    
    // Log dates to confirm they're correct
    console.log("Calculated normalized pay dates:", payDates.map(d => d.toDateString()));
    
    return payDates;
}

// Function to update paycheck labels based on pay frequency
function updatePaycheckLabels() {
    const payFrequency = parseInt(document.getElementById('payFrequency')?.value) || 
                        (salaryData.payFrequency ? parseInt(salaryData.payFrequency) : 26);
                        
    // Check localStorage first, then fallback to salaryData if not in localStorage
    const lastPayDate = localStorage.getItem('lastPayDate') || salaryData.lastPayDate;
    const firstPayDate = localStorage.getItem('firstPayDate') || salaryData.firstPayDate;
    
    // Select the label elements
    const paycheck1Label = document.querySelector('.bg-glass-blue p.text-sm.text-gray-300');
    const paycheck2Label = document.querySelector('.bg-glass-purple p.text-sm.text-gray-300');
    
    // Select the Net Profit Calculator label elements
    const gpPaycheck1Label = document.querySelector('#grossProfitResults .bg-glass-blue h4');
    const gpPaycheck2Label = document.querySelector('#grossProfitResults .bg-glass-purple h4');
    
    // If any of the elements don't exist, exit early
    if (!paycheck1Label || !paycheck2Label || !gpPaycheck1Label || !gpPaycheck2Label) {
        return;
    }
    
    // If pay frequency is bi-weekly and we have a last pay date
    if (payFrequency === 26 && lastPayDate) {
        try {
            // Calculate the bi-weekly pay dates for the current month
            const payDates = calculateBiWeeklyPaycheckDates(lastPayDate);
            
            // If we have at least two pay dates in the month
            if (payDates.length >= 2) {
                // Format dates properly
                const date1 = payDates[0].getDate();
                const date2 = payDates[1].getDate();
                
                // Update the labels with the actual dates
                paycheck1Label.textContent = `Paycheck 1 (${date1}${getOrdinalSuffix(date1)})`;
                paycheck2Label.textContent = `Paycheck 2 (${date2}${getOrdinalSuffix(date2)})`;
                
                // Update Net Profit Calculator labels
                gpPaycheck1Label.textContent = `Paycheck 1 (${date1}${getOrdinalSuffix(date1)})`;
                gpPaycheck2Label.textContent = `Paycheck 2 (${date2}${getOrdinalSuffix(date2)})`;
                
                // Log calculated pay dates for debugging
                console.log('Calculated pay dates:', payDates.map(d => d.toDateString()));
                
                // If there's a third paycheck in the month, update that label too
                const gpPaycheck3Label = document.querySelector('#gpThirdPaycheckSection h4');
                if (payDates.length >= 3 && gpPaycheck3Label) {
                    const date3 = payDates[2].getDate();
                    gpPaycheck3Label.textContent = `Paycheck 3 (${date3}${getOrdinalSuffix(date3)})`;
                }
                
                // Successfully updated with bi-weekly dates
                return;
            }
        } catch (e) {
            console.error('Error calculating bi-weekly pay dates:', e);
            // Fall back to default labels if there was an error
        }
    } else if (payFrequency === 24 && firstPayDate) {
        // For semi-monthly, use the specified first pay date
        const firstPayDay = parseInt(firstPayDate);
        let secondPayDay;
        
        // If first pay is on the 1st, second is on the 15th
        // If first pay is on the 15th, second is on the last day of the month
        if (firstPayDay === 1) {
            secondPayDay = 15;
        } else {
            // Get the last day of the current month
            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            secondPayDay = lastDayOfMonth;
        }
        
        // Update the labels with the actual dates
        paycheck1Label.textContent = `Paycheck 1 (${firstPayDay}${getOrdinalSuffix(firstPayDay)})`;
        paycheck2Label.textContent = `Paycheck 2 (${secondPayDay}${getOrdinalSuffix(secondPayDay)})`;
        
        // Update Net Profit Calculator labels
        gpPaycheck1Label.textContent = `Paycheck 1 (${firstPayDay}${getOrdinalSuffix(firstPayDay)})`;
        gpPaycheck2Label.textContent = `Paycheck 2 (${secondPayDay}${getOrdinalSuffix(secondPayDay)})`;
        
        // Successfully updated with semi-monthly dates
        return;
    }
    
    // Default semi-monthly labels
    paycheck1Label.textContent = 'Paycheck 1 (15th)';
    paycheck2Label.textContent = 'Paycheck 2 (End of Month)';
    
    // Update Net Profit Calculator labels to default
    gpPaycheck1Label.textContent = 'Paycheck 1 (15th)';
    gpPaycheck2Label.textContent = 'Paycheck 2 (End of Month)';
}

// Call this function whenever we need to update the paycheck labels
// e.g., after loading salary data, updating pay frequency, etc.

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
        
        // Update paycheck labels
        updatePaycheckLabels();
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
        
        // Update paycheck labels
        updatePaycheckLabels();
    };
});

// Function to close the zero bill modal
window.closeZeroBillModal = function() {
    document.getElementById('zeroBillModal').classList.add('hidden');
}

// Function to show the amount field in the zero bill modal
window.showZeroBillAmountField = function() {
    // Show the amount field
    document.getElementById('zeroBillAmountField').classList.remove('hidden');
    
    // Focus on the amount input
    document.getElementById('zeroBillAmount').focus();
    
    // Hide the initial buttons
    document.getElementById('initialButtonsContainer').classList.add('hidden');
    
    // Show the amount entry buttons
    document.getElementById('amountEntryButtonsContainer').classList.remove('hidden');
}

// Function to confirm zero bill amount
window.confirmZeroBill = function() {
    const index = parseInt(document.getElementById('zeroBillIndex').value);
    if (index >= 0 && index < bills.length) {
        // Mark the bill as paid without changing amount
        bills[index].isPaid = true;
        renderBills();
        updatePaymentSchedule();
    }
    closeZeroBillModal();
}

// Function to populate the salary calculator modal with saved data
function populateSalaryModal() {
    // Check if we have saved salary data
    if (Object.keys(salaryData).length > 0) {
        // Populate the salary modal with saved data
        // Extract the numeric value from formatted string
        if (salaryData.annualSalary) {
            const grossValue = salaryData.annualSalary.replace(/[^0-9.]/g, '');
            document.getElementById('modalGrossSalary').value = grossValue;
        }
        
        if (salaryData.payFrequency) {
            document.getElementById('modalPayFrequency').value = salaryData.payFrequency;
        }
        
        // Set first pay date for semi-monthly
        if (salaryData.firstPayDate) {
            const firstPayDateSelect = document.getElementById('firstPayDate');
            if (firstPayDateSelect) {
                firstPayDateSelect.value = salaryData.firstPayDate;
            }
            document.getElementById('firstPayDateContainer').classList.remove('hidden');
        }
        
        // Set last pay date for bi-weekly
        if (salaryData.lastPayDate) {
            const lastPayDateInput = document.getElementById('lastPayDate');
            if (lastPayDateInput) {
                lastPayDateInput.value = salaryData.lastPayDate;
            }
        }
        
        // Show the appropriate date field based on pay frequency
        toggleLastPayDateField();
        
        // Extract bonus percentage from formatted string if needed
        if (salaryData.bonusAmount && salaryData.annualSalary) {
            const bonusValue = parseFloat(salaryData.bonusAmount.replace(/[^0-9.]/g, ''));
            const annualValue = parseFloat(salaryData.annualSalary.replace(/[^0-9.]/g, ''));
            if (bonusValue && annualValue) {
                const bonusPct = (bonusValue / annualValue) * 100;
                document.getElementById('modalBonusPercentage').value = bonusPct.toFixed(2);
            }
        }
        
        // Fix for bonus tax rate - properly extract numeric value
        if (salaryData.bonusTaxRate) {
            // Extract numeric value from the format like "(25% tax)"
            const taxMatch = salaryData.bonusTaxRate.match(/\((\d+(?:\.\d+)?)%/);
            if (taxMatch && taxMatch[1]) {
                document.getElementById('modalBonusTax').value = taxMatch[1];
            } else {
                document.getElementById('modalBonusTax').value = 25; // Default value
            }
        }
        
        // Tax info
        if (salaryData.filingStatus) {
            document.getElementById('modalTaxBracket').value = salaryData.filingStatus;
        }
        
        // Extract state from state rate if available
        if (salaryData.stateRate) {
            const stateRate = parseFloat(salaryData.stateRate.replace(/[^0-9.]/g, ''));
            if (!isNaN(stateRate)) {
                // Find the state with this rate
                const stateSelect = document.getElementById('modalState');
                if (stateSelect) {
                    for (let i = 0; i < stateSelect.options.length; i++) {
                        const option = stateSelect.options[i];
                        const rateMatch = option.text.match(/\(([^)]+)%\)/);
                        if (rateMatch && parseFloat(rateMatch[1]) === stateRate) {
                            stateSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        }
        
        // Extract retirement contribution percentage
        if (salaryData.retirementAmount && salaryData.grossPay) {
            const retirementAmount = parseFloat(salaryData.retirementAmount.replace(/[^0-9.]/g, ''));
            const grossPay = parseFloat(salaryData.grossPay.replace(/[^0-9.]/g, ''));
            if (!isNaN(retirementAmount) && !isNaN(grossPay) && grossPay > 0) {
                const retirementPct = (retirementAmount / grossPay) * 100;
                document.getElementById('modalRetirementContribution').value = retirementPct.toFixed(2);
            }
        }
        
        // Extract ESPP contribution percentage
        if (salaryData.esppAmount && salaryData.grossPay) {
            const esppAmount = parseFloat(salaryData.esppAmount.replace(/[^0-9.]/g, ''));
            const grossPay = parseFloat(salaryData.grossPay.replace(/[^0-9.]/g, ''));
            if (!isNaN(esppAmount) && !isNaN(grossPay) && grossPay > 0) {
                const esppPct = (esppAmount / grossPay) * 100;
                document.getElementById('modalEsppContribution').value = esppPct.toFixed(2);
            }
        }
          // Extract insurance costs
        if (salaryData.healthAmount) {
            document.getElementById('modalHealthInsurance').value = parseFloat(salaryData.healthAmount.replace(/[^0-9.]/g, ''));
        }
        
        if (salaryData.fsaAmount) {
            document.getElementById('modalFsaContribution').value = parseFloat(salaryData.fsaAmount.replace(/[^0-9.]/g, ''));
        }
        
        if (salaryData.dentalAmount) {
            document.getElementById('modalDentalInsurance').value = parseFloat(salaryData.dentalAmount.replace(/[^0-9.]/g, ''));
        }
        
        if (salaryData.visionAmount) {
            document.getElementById('modalVisionInsurance').value = parseFloat(salaryData.visionAmount.replace(/[^0-9.]/g, ''));
        }
    }
}

// Show the salary calculator modal
window.showSalaryModal = function() {
    // Populate the modal with any saved salary data
    populateSalaryModal();
    
    // If this is a new salary calculation (no existing data), set default values to 0
    if (Object.keys(salaryData).length === 0) {
        // Set default values of 0 for bonus percentage, bonus tax rate, 401k, and ESPP
        document.getElementById('modalBonusPercentage').value = '0';
        document.getElementById('modalBonusTax').value = '25';
        document.getElementById('modalRetirementContribution').value = '0';
        document.getElementById('modalEsppContribution').value = '0';
    }
    
    // Show the modal
    document.getElementById('salaryModal').classList.remove('hidden');
    
    // Make sure paycheck labels are updated to reflect current pay frequency
    updatePaycheckLabels();
}

// Function to close the salary modal
window.closeSalaryModal = function() {
    document.getElementById('salaryModal').classList.add('hidden');
}

// Function to handle semi-monthly pay date selection
window.updateFirstPayDate = function() {
    const firstPayDateSelect = document.getElementById('firstPayDate');
    if (firstPayDateSelect) {
        localStorage.setItem('firstPayDate', firstPayDateSelect.value);
        
        // Update salary data with the selected first pay date
        if (salaryData) {
            salaryData.firstPayDate = firstPayDateSelect.value;
            saveToLocalStorage();
        }
        
        // Update paycheck labels
        updatePaycheckLabels();
        
        // If we have salary data, recalculate gross profit
        if (Object.keys(salaryData).length > 0 && salaryData.netPay) {
            calculateGrossProfit();
        }
    }
}

// Function to handle bi-weekly pay date selection
window.updateLastPayDate = function() {
    const lastPayDateInput = document.getElementById('lastPayDate');
    if (lastPayDateInput) {
        const lastPayDate = lastPayDateInput.value;
        localStorage.setItem('lastPayDate', lastPayDate);
        
        // Also store in salaryData for immediate use
        salaryData.lastPayDate = lastPayDate;
    }
}

// Function to initialize event handlers for preventing default behavior on button clicks
function initPreventDefaultOnAnchors() {
    // Get all anchor tags with onclick attributes
    const anchors = document.querySelectorAll('a[href="#"][onclick]');
    
    // Add event listeners to prevent default behavior
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
}

// Add to document ready function
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Initialize preventDefault on anchors to prevent page refresh
    initPreventDefaultOnAnchors();
});

// Function to update the month and year display in the Monthly Bills section
function updateCurrentMonthAndYear() {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthElement = document.getElementById('currentMonth');
    const yearElement = document.getElementById('currentYear');
    
    if (monthElement) {
        monthElement.textContent = months[currentAppMonth];
    }
    
    if (yearElement) {
        yearElement.textContent = currentAppYear;
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
        return 'text-neon-blue';    // 10% to 30%
    } else {
        return 'text-neon-green';   // 0% to 10%
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
        // Store the old card name before updating
        const oldCardName = creditCards[editIndex].name;
        
        // Edit existing card
        creditCards[editIndex] = card;
        
        // Look for the associated bill and update its due date
        const billName = `${oldCardName} Payment`;
        const billIndex = bills.findIndex(bill => bill.name === billName && bill.type === 'credit');
        
        if (billIndex !== -1) {
            // Update the bill name if the card name changed
            if (oldCardName !== card.name) {
                bills[billIndex].name = `${card.name} Payment`;
            }
            
            // Update the bill's due date to match the card's due date
            bills[billIndex].dueDate = card.dueDate;
            
            // Re-render bills and update payment schedule
            renderBills();
            updatePaymentSchedule();
        }
    } else {
        // Add new card
        creditCards.push(card);
          // Also add a bill entry with amount $0 for this credit card
        const newBill = {
            name: `${card.name} Payment`,
            amount: 0,
            dueDate: card.dueDate,
            type: 'credit',
            priority: 'normal',
            paymentAccount: 'checking', // Default to checking account
            creditCardId: null
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

function renderCreditCards() {    if (creditCards.length === 0) {
        creditCardsContainer.innerHTML = '<p class="text-gray-400 text-center py-4 md:col-span-3 lg:col-span-4">No credit cards added yet</p>';
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
                accountAge = '<span class="text-neon-pink">' + ageMonths + '</span> ' + (ageMonths === 1 ? 'month' : 'months') + ' old';
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
            accountAge = '<span class="text-neon-pink">' + ageMonths + '</span> ' + (ageMonths === 1 ? 'month' : 'months') + ' old';
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
    document.getElementById('paymentAccount').value = 'checking'; // Default to checking account
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    // Populate credit card dropdown
    populateCreditCardSelect();
    
    // Reset credit card selection to first option
    const creditCardSelect = document.getElementById('creditCardSelect');
    if (creditCardSelect && creditCardSelect.options.length > 0) {
        creditCardSelect.selectedIndex = 0;
    }
    
    // Hide the credit card selection initially
    document.getElementById('creditCardSelectContainer').classList.add('hidden');
    
    document.getElementById('billModal').classList.remove('hidden');
    
    // Set up event listener for payment account selection changes
    setupPaymentAccountChangeListener();
}

window.editBill = function(index) {
    document.getElementById('billModalTitle').textContent = 'Edit Monthly Bill';
    const bill = bills[index];
    
    document.getElementById('billName').value = bill.name;
    document.getElementById('billAmount').value = bill.amount;
    document.getElementById('billDueDate').value = bill.dueDate;
    // Set bill type if it exists, otherwise default to 'other'
    document.getElementById('billType').value = bill.type || 'other';
    
    // Set the varying amount and autopay checkboxes based on bill properties
    document.getElementById('varyingAmountDue').checked = bill.varyingAmount || false;
    document.getElementById('autoPay').checked = bill.autoPay || false;
    
    // Populate credit card dropdown
    populateCreditCardSelect();
      // Set payment account and show/hide credit card selection accordingly
    const paymentAccount = bill.paymentAccount || 'checking';
    document.getElementById('paymentAccount').value = paymentAccount;
    
    // Reset credit card selection to first option as default
    const creditCardSelect = document.getElementById('creditCardSelect');
    if (creditCardSelect) {
        creditCardSelect.selectedIndex = 0;
    }
    
    if (paymentAccount === 'credit') {
        document.getElementById('creditCardSelectContainer').classList.remove('hidden');
        if (bill.creditCardId !== null && bill.creditCardId !== undefined) {
            // Set credit card selection if available
            if (creditCardSelect) {
                creditCardSelect.value = bill.creditCardId;
            }
        }
    } else {
        document.getElementById('creditCardSelectContainer').classList.add('hidden');
    }
    
    // Set up event listener for payment account changes
    setupPaymentAccountChangeListener();
    
    document.getElementById('editBillIndex').value = index;
    
    // Hide any previous validation errors
    document.getElementById('billValidationErrors').classList.add('hidden');
    document.getElementById('billErrorList').innerHTML = '';
    
    document.getElementById('billModal').classList.remove('hidden');
}

window.closeBillModal = function() {
    document.getElementById('billModal').classList.add('hidden');
    
    // Reset the credit card dropdown visibility state
    const creditCardSelectContainer = document.getElementById('creditCardSelectContainer');
    if (creditCardSelectContainer) {
        creditCardSelectContainer.classList.add('hidden');
    }
}

// Function to populate the credit card selection dropdown
function populateCreditCardSelect() {
    const creditCardSelect = document.getElementById('creditCardSelect');
    if (!creditCardSelect) return;
    
    // Clear existing options
    creditCardSelect.innerHTML = '';
    
    // Add options for each credit card
    creditCards.forEach((card, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = card.name;
        creditCardSelect.appendChild(option);
    });
    
    // If no credit cards, add a default option
    if (creditCards.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No credit cards available';
        creditCardSelect.appendChild(option);
    }
}

// Function to set up event listener for payment account selection changes
function setupPaymentAccountChangeListener() {
    const paymentAccountSelect = document.getElementById('paymentAccount');
    const creditCardSelectContainer = document.getElementById('creditCardSelectContainer');
    const creditCardSelect = document.getElementById('creditCardSelect');
    
    if (!paymentAccountSelect || !creditCardSelectContainer) return;
    
    // Create a completely new element to ensure no stale event listeners
    const newPaymentAccountSelect = document.createElement('select');
    newPaymentAccountSelect.id = 'paymentAccount';
    newPaymentAccountSelect.className = paymentAccountSelect.className;
    
    // Copy options from the old select
    for (let i = 0; i < paymentAccountSelect.options.length; i++) {
        const option = document.createElement('option');
        option.value = paymentAccountSelect.options[i].value;
        option.text = paymentAccountSelect.options[i].text;
        option.selected = paymentAccountSelect.options[i].selected;
        newPaymentAccountSelect.appendChild(option);
    }
    
    // Replace the old select with the new one
    paymentAccountSelect.parentNode.replaceChild(newPaymentAccountSelect, paymentAccountSelect);
    
    // Add the event listener
    newPaymentAccountSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        
        if (selectedValue === 'credit') {
            // Show credit card dropdown when Credit Card is selected
            if (creditCardSelectContainer) {
                creditCardSelectContainer.classList.remove('hidden');
            }
            
            // Make sure a credit card is selected if available
            if (creditCardSelect && creditCardSelect.options.length > 0 && 
                creditCardSelect.selectedIndex === -1) {
                creditCardSelect.selectedIndex = 0;
            }
        } else {
            // Hide credit card dropdown when Checking Account is selected
            if (creditCardSelectContainer) {
                creditCardSelectContainer.classList.add('hidden');
            }
            
            // Reset the credit card selection
            if (creditCardSelect && creditCardSelect.options.length > 0) {
                creditCardSelect.selectedIndex = 0;
            }
        }
    });
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
    
    // Validate credit card selection when payment account is set to credit
    const paymentAccountValue = document.getElementById('paymentAccount').value;
    if (paymentAccountValue === 'credit') {
        const creditCardId = document.getElementById('creditCardSelect').value;
        if (creditCardId === '' || creditCards.length === 0) {
            errors.push('Please select a credit card or add one first');
        }
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
    
    // Check if varying amount is selected for a non-credit/loan bill
    const varyingAmountChecked = document.getElementById('varyingAmountDue').checked;
    const billTypeValue = document.getElementById('billType').value;
    
    // If varying amount is checked and it's not a credit card or loan payment
    if (varyingAmountChecked && billTypeValue !== 'credit' && billTypeValue !== 'loan') {
        // Show the varying amount confirmation modal
        document.getElementById('varyingAmountModal').classList.remove('hidden');
        return;
    }
    
    // If we got here, proceed with saving the bill (either no confirmation needed or called from confirmVaryingAmount)
    saveCurrentBill();
};

// Function to confirm varying amount selection
window.confirmVaryingAmount = function() {
    document.getElementById('varyingAmountModal').classList.add('hidden');
    saveCurrentBill(); // Continue with saving the bill
};

// Function to cancel varying amount selection
window.cancelVaryingAmount = function() {
    document.getElementById('varyingAmountModal').classList.add('hidden');
    document.getElementById('varyingAmountDue').checked = false;
};

// Function that actually saves the bill
function saveCurrentBill() {    const paymentAccountValue = document.getElementById('paymentAccount').value;
    
    // Determine creditCardId value
    let creditCardId = null;
    if (paymentAccountValue === 'credit') {
        creditCardId = document.getElementById('creditCardSelect').value;
    }
    
    const bill = {
        name: billName.value.trim(),
        amount: parseFloat(billAmount.value),
        dueDate: parseInt(billDueDate.value),
        type: billType.value,
        priority: 'normal', // Set default priority since we removed the field
        isPaid: false, // Add isPaid property, default to false
        varyingAmount: document.getElementById('varyingAmountDue').checked, // Add varying amount property
        autoPay: document.getElementById('autoPay').checked, // Add autopay property
        paymentAccount: paymentAccountValue, // Add payment account property
        creditCardId: creditCardId // Always null when not using credit card
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
        
        // If this is a loan payment bill, update the corresponding loan due date
        if (bill.type === 'loan') {
            // Extract loan name from bill name (assumes format "Loan Name Payment")
            const loanName = bill.name.replace(' Payment', '');
            
            // Find matching loan
            const loanIndex = loans.findIndex(loan => loan.name === loanName);
            if (loanIndex !== -1) {
                // Update loan due date to match bill due date
                loans[loanIndex].dueDate = bill.dueDate;
                
                // Re-render loans to reflect updates
                renderLoans();
                updateLoanSummary();
            }
        }
        
        // If this is a credit card payment bill, update the corresponding credit card due date
        if (bill.type === 'credit') {
            // Extract credit card name from bill name (assumes format "Card Name Payment")
            const cardName = bill.name.replace(' Payment', '');
            
            // Find matching credit card
            const cardIndex = creditCards.findIndex(card => card.name === cardName);
            if (cardIndex !== -1) {
                // Update credit card due date to match bill due date
                creditCards[cardIndex].dueDate = bill.dueDate;
                
                // Re-render credit cards to reflect updates
                renderCreditCards();
                updateCreditSummary();
            }
        }
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
          // Create bill status icons HTML
        let statusIcons = '';
        
        // Add varying amount icon if applicable
        if (bill.varyingAmount) {
            statusIcons += `<span title="Varying amount due" class="text-neon-blue mr-2"><i class="fas fa-chart-line"></i></span>`;
        }
        
        // Add autopay icon if applicable
        if (bill.autoPay) {
            statusIcons += `<span title="Autopay enabled" class="text-neon-green mr-2"><i class="fas fa-sync-alt"></i></span>`;
        }
        
        html += `
            <div class="border cyber-border rounded-lg p-4 mb-3 cyber-card bill-item ${paidClass}" data-bill-index="${index}">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center">
                            <i class="fas ${typeIcon} mr-2 text-neon-green"></i>
                            <h3 class="font-medium text-lg cyber-neon">${bill.name}</h3>
                        </div>                        <div class="flex items-center mt-1">
                            <p class="text-sm text-gray-400">Due on ${bill.dueDate}th</p>
                            <div class="ml-3 flex items-center">${statusIcons}</div>
                        </div>
                        <div class="flex items-center mt-1">
                            <p class="text-sm text-gray-400">
                                Payment: ${bill.paymentAccount === 'credit' ? 
                                    `<span class="text-neon-purple">${getCreditCardNameById(bill.creditCardId)}</span>` : 
                                    '<span class="text-neon-blue">Checking Account</span>'}
                            </p>
                        </div>
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
            // Prevent triggering if clicking on a button
            if (e.target.closest('button')) {
                return;
            }
            
            const index = parseInt(this.dataset.billIndex);
            toggleBillPaidStatus(index);
        });
    });
}

function getBillTypeIcon(type) {
    const icons = {
        'housing': 'fa-home',
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

// Function to get credit card name by ID (index)
function getCreditCardNameById(id) {
    if (id === null || id === undefined) return 'Unknown Card';
    
    const cardIndex = parseInt(id);
    if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= creditCards.length) {
        return 'Unknown Card';
    }
    
    return creditCards[cardIndex].name;
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
      // Calculate total amounts (excluding credit card payments)
    const paycheck1TotalAmount = paycheck1.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + bill.amount;
    }, 0);
    const paycheck2TotalAmount = paycheck2.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + bill.amount;
    }, 0);
    
    // Calculate remaining unpaid amounts (excluding credit card payments)
    const paycheck1RemainingAmount = paycheck1.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + (bill.isPaid ? 0 : bill.amount);
    }, 0);
    const paycheck2RemainingAmount = paycheck2.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + (bill.isPaid ? 0 : bill.amount);
    }, 0);
    const totalRemainingAmount = paycheck1RemainingAmount + paycheck2RemainingAmount;
    
    // Get required DOM elements, with null checks
    const paycheck1Bills = document.getElementById('paycheck1Bills');
    const paycheck2Bills = document.getElementById('paycheck2Bills');
    const paycheck1Total = document.getElementById('paycheck1Total');
    const paycheck2Total = document.getElementById('paycheck2Total');      // Update bill names in payment schedule (including all bills regardless of payment account)
    if (paycheck1Bills) {
        // No filtering by payment account - include all bills
        paycheck1Bills.textContent = paycheck1.length > 0 ? 
            paycheck1.map(bill => bill.name).join(', ') : 'No bills scheduled';
    }
    
    if (paycheck2Bills) {
        // No filtering by payment account - include all bills
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
    }      // Update total bills count (including all bills regardless of payment account)
    if (totalBills) {
        const totalBillsCount = bills.length;
        totalBills.textContent = totalBillsCount;
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
    // Only include bills that are paid from checking account, not credit card bills
    const totalBills = bills.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + bill.amount;
    }, 0);
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
    
    // Update the insurance amounts    document.getElementById('healthAmount').textContent = `$${healthCost.toFixed(2)}`;
    document.getElementById('dentalAmount').textContent = `$${dentalCost.toFixed(2)}`;
    document.getElementById('visionAmount').textContent = `$${visionCost.toFixed(2)}`;
    document.getElementById('fsaAmount').textContent = `$${fsaCost.toFixed(2)}`;
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
        
        // If this is a credit card bill, ensure amount is set to zero
        if (bill.type === 'credit') {
            bill.amount = 0;
        }
    });
    
    // Re-render bills to update the UI
    renderBills();
    
    // Update the payment schedule since paid status affects calculations
    updatePaymentSchedule();
    
    // Save changes to localStorage to persist after page reload
    saveToLocalStorage();
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
    // Check if there are any unpaid credit card bills with zero amount
    const unpaidCreditBills = bills.filter(bill => bill.type === 'credit' && !bill.isPaid);
    
    if (unpaidCreditBills.length > 0) {
        // Process credit card bills sequentially
        processUnpaidCreditCards(unpaidCreditBills, 0);
    } else {
        // No unpaid credit card bills, proceed with normal completion
        finalizeMonthCompletion();
    }
};

// Function to process unpaid credit card bills sequentially
function processUnpaidCreditCards(unpaidCreditBills, currentIndex) {
    // Check if we've processed all unpaid credit card bills
    if (currentIndex >= unpaidCreditBills.length) {
        // All credit cards processed, proceed with month completion
        finalizeMonthCompletion();
        return;
    }
    
    // Get the current unpaid credit card bill
    const billIndex = bills.indexOf(unpaidCreditBills[currentIndex]);
    
    // Show the zero bill modal for this credit card
    showZeroBillModal(billIndex);
    
    // Set up a listener for when the modal is closed
    const zeroBillModal = document.getElementById('zeroBillModal');
    const originalOnClick = window.closeZeroBillModal;
    
    // Override the close modal function temporarily
    window.closeZeroBillModal = function() {
        // Restore original function
        window.closeZeroBillModal = originalOnClick;
        
        // Hide the modal
        zeroBillModal.classList.add('hidden');
        
        // Process the next credit card bill
        processUnpaidCreditCards(unpaidCreditBills, currentIndex + 1);
    };
}

// Function to finalize month completion after all credit cards are processed
function finalizeMonthCompletion() {
    const allPaid = areAllBillsPaid();
    
    // Store historical bill data before resetting
    const monthData = {
        month: currentAppMonth,
        year: currentAppYear,
        timestamp: new Date().toISOString(),
        bills: bills.map(bill => ({
            name: bill.name,
            amount: bill.amount,
            type: bill.type,
            dueDate: bill.dueDate,
            isPaid: bill.isPaid,
            paymentAccount: bill.paymentAccount
        }))
    };
    
    // Add to historical data
    historicalBillData.push(monthData);
    
    // Advance to next month
    currentAppMonth++;
    if (currentAppMonth > 11) {
        currentAppMonth = 0;
        currentAppYear++;
    }
    
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
    // Populate the modal with any saved salary data
    populateSalaryModal();
    
    // If this is a new salary calculation (no existing data), set default values to 0
    if (Object.keys(salaryData).length === 0) {
        // Set default values of 0 for bonus percentage, bonus tax rate, 401k, and ESPP
        document.getElementById('modalBonusPercentage').value = '0';
        document.getElementById('modalBonusTax').value = '25';
        document.getElementById('modalRetirementContribution').value = '0';
        document.getElementById('modalEsppContribution').value = '0';
    }
    
    // Show the modal
    document.getElementById('salaryModal').classList.remove('hidden');
    
    // Initialize the correct date fields based on pay frequency
    toggleLastPayDateField();
    
    // Make sure paycheck labels are updated to reflect current pay frequency
    updatePaycheckLabels();
}

// Function to toggle the display of the appropriate date field based on pay frequency selection
function toggleLastPayDateField() {
    const payFrequency = document.getElementById('modalPayFrequency').value;
    const firstPayDateContainer = document.getElementById('firstPayDateContainer');
    const lastPayDateContainer = document.getElementById('lastPayDateContainer');
    
    if (payFrequency === '24') { // Default: save every minute
        firstPayDateContainer.classList.remove('hidden');
        lastPayDateContainer.classList.add('hidden');
    } else { // Bi-weekly
        firstPayDateContainer.classList.add('hidden');
        lastPayDateContainer.classList.remove('hidden');
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
    const fsaCost = parseFloat(document.getElementById('modalFsaContribution').value) || 0;
    const totalInsuranceCost = healthCost + dentalCost + visionCost + fsaCost;
    
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
        
        // Remove first pay date from storage if it exists
        localStorage.removeItem('firstPayDate');
    } 
    // Handle semi-monthly pay date
    else if (periods === 24) {
        const firstPayDateSelect = document.getElementById('firstPayDate');
        if (firstPayDateSelect) {
            const firstPayDate = firstPayDateSelect.value;
            localStorage.setItem('firstPayDate', firstPayDate);
            
            // Also store in salaryData for immediate use
            salaryData.firstPayDate = firstPayDate;
        }
        
        // Remove last pay date from storage if it exists
        localStorage.removeItem('lastPayDate');
    }
    else {
        // For other frequencies, remove both dates from storage
        localStorage.removeItem('lastPayDate');
        localStorage.removeItem('firstPayDate');
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
    document.getElementById('savingsTotal').textContent = `$${savingsTotal.toFixed(2)}`;    document.getElementById('healthAmount').textContent = `$${healthCost.toFixed(2)}`;
    document.getElementById('dentalAmount').textContent = `$${dentalCost.toFixed(2)}`;
    document.getElementById('visionAmount').textContent = `$${visionCost.toFixed(2)}`;
    document.getElementById('fsaAmount').textContent = `$${fsaCost.toFixed(2)}`;
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
        savingsTotal: `$${savingsTotal.toFixed(2)}`,        healthAmount: `$${healthCost.toFixed(2)}`,
        dentalAmount: `$${dentalCost.toFixed(2)}`,
        visionAmount: `$${visionCost.toFixed(2)}`,
        fsaAmount: `$${fsaCost.toFixed(2)}`,
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
    
    // Also save the date information in salary data
    if (periods === 26) {
        const lastPayDate = document.getElementById('lastPayDate').value;
        if (lastPayDate) {
            salaryData.lastPayDate = lastPayDate;
        }
    } else if (periods === 24) {
        const firstPayDate = document.getElementById('firstPayDate').value;
        if (firstPayDate) {
            salaryData.firstPayDate = firstPayDate;
        }
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update paycheck labels based on pay frequency and last pay date
    updatePaycheckLabels();
    
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
    
    if (netPayPerPaycheck <= 0) return;
    
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
        // Bi-weekly: (26 paychecks / 12 months = 2.166... paychecks per month on average)
        payPerMonth = netPayPerPaycheck * (26 / 12);
    } else {
        // Semi-monthly: 2 paychecks per month
        payPerMonth = netPayPerPaycheck * 2;
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
    // Split bills between two paychecks based on pay frequency
    let paycheck1Bills, paycheck2Bills;
    const lastPayDate = localStorage.getItem('lastPayDate');
    
    if (payFrequency === 26 && lastPayDate) {
        // For bi-weekly: Calculate the actual paycheck dates for the current month
        const payDates = calculateBiWeeklyPaycheckDates(lastPayDate);
        
        if (payDates.length >= 2) {
            // For bi-weekly: split bills based on which paycheck date they're closer to
            const firstPaycheckDate = payDates[0].getDate();
            const secondPaycheckDate = payDates[1].getDate();
            
            // For first paycheck, include bills due from 1st of month up to midpoint between paychecks
            const midpoint1 = Math.floor((firstPaycheckDate + secondPaycheckDate) / 2);
            
            paycheck1Bills = bills.filter(bill => {
                // Bills due from 1st of month through midpoint between first and second paycheck
                return bill.dueDate <= midpoint1;
            });
            
            // For second paycheck, include bills due after midpoint
            paycheck2Bills = bills.filter(bill => bill.dueDate > midpoint1);
        } else {
            // Default to standard 15th split if we couldn't calculate bi-weekly dates
            paycheck1Bills = bills.filter(bill => bill.dueDate <= 15);
            paycheck2Bills = bills.filter(bill => bill.dueDate > 15);
        }
    } else {
        // For semi-monthly: split bills at the 15th of the month as usual
        paycheck1Bills = bills.filter(bill => bill.dueDate <= 15);
        paycheck2Bills = bills.filter(bill => bill.dueDate > 15);
    }
      // Calculate bills amounts, excluding credit card bills
    const paycheck1BillsAmount = paycheck1Bills.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + parseFloat(bill.amount || 0);
    }, 0);
    const paycheck2BillsAmount = paycheck2Bills.reduce((sum, bill) => {
        // If bill is paid from credit card, don't include it in the total
        if (bill.paymentAccount === 'credit') return sum;
        return sum + parseFloat(bill.amount || 0);
    }, 0);
    const totalMonthlyBills = paycheck1BillsAmount + paycheck2BillsAmount;
    const annualBills = totalMonthlyBills * 12;
    
    // Calculate per-paycheck amounts
    let payPerPaycheck;
    
    if (payFrequency === 26) {
        // For bi-weekly, some months will have 3 paychecks
        // Check if current month has 3 paychecks
        let hasThirdPaycheckInSameMonth = false;
        
        if (lastPayDate) {
            const payDates = calculateBiWeeklyPaycheckDates(lastPayDate);
            hasThirdPaycheckInSameMonth = payDates.length >= 3;
        }
        
        // Use the actual paycheck amount
        payPerPaycheck = netPayPerPaycheck;
    } else {
        // For semi-monthly, each paycheck is half the monthly pay
        payPerPaycheck = payPerMonth / 2;
    }
    
    // Calculate surplus/deficit for regular paychecks
    const paycheck1Surplus = payPerPaycheck - paycheck1BillsAmount;
    const paycheck2Surplus = payPerPaycheck - paycheck2BillsAmount;
    
    // Calculate third paycheck surplus (no bills assigned to it, pure income)
    const paycheck3Surplus = payPerPaycheck;
    
    const monthlySurplus = payPerMonth - totalMonthlyBills;
      // For annual surplus, we use the total annual income (based on frequency)
    const annualNetIncome = netPayPerPaycheck * payFrequency;
    // Calculate annual values without including bonus in monthly net income
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
      // Update UI with calculated values - Monthly net income should not include bonus amounts
    if (gpMonthlyIncome) gpMonthlyIncome.textContent = `$${payPerMonth.toFixed(2)}`;
    if (gpMonthlyBills) gpMonthlyBills.textContent = `$${totalMonthlyBills.toFixed(2)}`;
    
    // Set color based on surplus or deficit
    const monthlySurplusColor = monthlySurplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpMonthlySurplus) {
        gpMonthlySurplus.textContent = `${monthlySurplus >= 0 ? '' : '-'}$${Math.abs(monthlySurplus).toFixed(2)}`;
        gpMonthlySurplus.className = `font-bold ${monthlySurplusColor}`;
    }
    
    // Variable to track if we have a third paycheck in the same month
    let hasThirdPaycheckInSameMonth = false;
    
    if (payFrequency === 26 && lastPayDate) {
        const payDates = calculateBiWeeklyPaycheckDates(lastPayDate);
        hasThirdPaycheckInSameMonth = payDates.length >= 3;
        
        // Get the third paycheck section
        const gpThirdPaycheckSection = document.getElementById('gpThirdPaycheckSection');
        
        // If we have 3 paychecks, make sure the third paycheck section is visible
        if (hasThirdPaycheckInSameMonth && gpThirdPaycheckSection) {
            // Make sure to remove the hidden class
            gpThirdPaycheckSection.classList.remove('hidden');
            
            // Update third paycheck values
            if (gpPaycheck3Net) gpPaycheck3Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
            if (gpPaycheck3Bills) gpPaycheck3Bills.textContent = `$0.00`;
            if (gpPaycheck3Surplus) {
                gpPaycheck3Surplus.textContent = `$${paycheck3Surplus.toFixed(2)}`;
                gpPaycheck3Surplus.className = 'font-bold text-neon-green';
            }
            
            // Update the heading for the third paycheck section
            const heading = gpThirdPaycheckSection.querySelector('h4');
            if (heading) {
                if (payDates.length >= 3) {
                    const date3 = payDates[2].getDate();
                    heading.textContent = `Paycheck 3 (${date3}${getOrdinalSuffix(date3)})`;
                } else {
                    heading.textContent = 'Extra Bi-Weekly Paycheck';
                }
            }
        } else if (gpThirdPaycheckSection) {
            // Hide the section if there's no third paycheck
            gpThirdPaycheckSection.classList.add('hidden');
        }
    } else {
        // Hide the third paycheck section for semi-monthly pay
        const gpThirdPaycheckSection = document.getElementById('gpThirdPaycheckSection');
        if (gpThirdPaycheckSection) {
            gpThirdPaycheckSection.classList.add('hidden');
        }
    }
    
    // Update paycheck values
    if (gpPaycheck1Net) gpPaycheck1Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
    if (gpPaycheck1Bills) gpPaycheck1Bills.textContent = `$${paycheck1BillsAmount.toFixed(2)}`;
    
    const paycheck1SurplusColor = paycheck1Surplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpPaycheck1Surplus) {
        gpPaycheck1Surplus.textContent = `${paycheck1Surplus >= 0 ? '' : '-'}$${Math.abs(paycheck1Surplus).toFixed(2)}`;
        gpPaycheck1Surplus.className = `font-bold ${paycheck1SurplusColor}`;
    }
    
    if (gpPaycheck2Net) gpPaycheck2Net.textContent = `$${payPerPaycheck.toFixed(2)}`;
    if (gpPaycheck2Bills) gpPaycheck2Bills.textContent = `$${paycheck2BillsAmount.toFixed(2)}`;
    
    const paycheck2SurplusColor = paycheck2Surplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpPaycheck2Surplus) {
        gpPaycheck2Surplus.textContent = `${paycheck2Surplus >= 0 ? '' : '-'}$${Math.abs(paycheck2Surplus).toFixed(2)}`;
        gpPaycheck2Surplus.className = `font-bold ${paycheck2SurplusColor}`;
    }
    
    // Update annual projections
    if (gpAnnualIncome) gpAnnualIncome.textContent = `$${annualNetIncome.toFixed(2)}`;
    if (gpAnnualBonus) gpAnnualBonus.textContent = `$${afterTaxBonus.toFixed(2)}`;
    if (gpAnnualBills) gpAnnualBills.textContent = `$${annualBills.toFixed(2)}`;
    
    const annualSurplusColor = annualSurplus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpAnnualSurplus) {
        gpAnnualSurplus.textContent = `${annualSurplus >= 0 ? '' : '-'}$${Math.abs(annualSurplus).toFixed(2)}`;
        gpAnnualSurplus.className = `font-bold ${annualSurplusColor}`;
    }
    
    const annualSurplusWithBonusColor = annualSurplusWithBonus >= 0 ? "text-neon-green" : "text-neon-pink";
    if (gpAnnualSurplusWithBonus) {
        gpAnnualSurplusWithBonus.textContent = `${annualSurplusWithBonus >= 0 ? '' : '-'}$${Math.abs(annualSurplusWithBonus).toFixed(2)}`;
        gpAnnualSurplusWithBonus.className = `font-bold ${annualSurplusWithBonusColor}`;
    }
    
    // Update progress bar
    const progressFillColor = monthlySurplus >= 0 ? "cyber-green" : "cyber-pink";
    if (profitProgress) {
        profitProgress.style.width = `${profitRatio}%`;
        profitProgress.className = `cyber-progress-fill ${progressFillColor}`;
    }
    
    // Update status text
    let profitStatusText = '';
    if (monthlySurplus >= 0) {
        profitStatusText = `You have a monthly surplus of $${monthlySurplus.toFixed(2)} (${profitRatio.toFixed(1)}% profit)`;
    } else {
        profitStatusText = `You have a monthly deficit of $${Math.abs(monthlySurplus).toFixed(2)} (${Math.abs(profitRatio).toFixed(1)}% loss)`;
    }
    if (profitStatus) profitStatus.textContent = profitStatusText;
      // Store profit calculation data (excluding bonus from monthly income)
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
    if (hasThirdPaycheckInSameMonth) {
        profitData.gpPaycheck3Net = `$${payPerPaycheck.toFixed(2)}`;
        profitData.gpPaycheck3Bills = `$0.00`;
        profitData.gpPaycheck3Surplus = `$${payPerPaycheck.toFixed(2)}`;
        profitData.gpPaycheck3SurplusClass = 'font-bold text-neon-green';
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Show results
    if (grossProfitResults) grossProfitResults.classList.remove('hidden');
}

// Hook into the salary calculator to trigger gross profit calculation
// const originalCalculateSalaryFromModal = window.calculateSalaryFromModal;
window.calculateSalaryFromModal = function() {
    // Call original function first
    originalCalculateSalaryFromModal.apply(this, arguments);
    
    // Then calculate gross profit
    calculateGrossProfit();
};

// Initialize on document load
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
    
    // Set first payment date if it exists
    if (loan.firstPaymentDate) {
        document.getElementById('firstPaymentDate').value = loan.firstPaymentDate;
    } else {
        document.getElementById('firstPaymentDate').value = '';
    }
    
    document.getElementById('editLoanIndex').value = index;
    
    // Set up mortgage fields event handler
    setupLoanTypeChangeHandler();
    
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
    
    // Validate first payment date if provided
    if (document.getElementById('firstPaymentDate').value) {
        const firstPaymentDate = new Date(document.getElementById('firstPaymentDate').value);
        if (isNaN(firstPaymentDate.getTime())) {
            errors.push('First Payment Date must be a valid date');
        }
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
        startDate: new Date().toISOString().split('T')[0],
        firstPaymentDate: document.getElementById('firstPaymentDate').value || new Date().toISOString().split('T')[0]
    };
      // Add additional principal payment for all loan types
    loan.additionalPrincipal = parseFloat(document.getElementById('additionalPrincipal').value) || 0;
    
    // Add mortgage-specific fields if loan type is mortgage
    if (loan.type === 'mortgage') {
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
        
        // Find and update any existing bill for this loan
        const billIndex = bills.findIndex(bill => 
            bill.name === `${loans[editIndex].name} Payment` && bill.type === 'loan');
            
        if (billIndex !== -1) {
            // Calculate the monthly payment
            const monthlyPayment = calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term);
                  // Calculate total monthly payment
            let totalMonthlyPayment = monthlyPayment;
            
            // Add additional principal payment for all loan types
            totalMonthlyPayment += loan.additionalPrincipal || 0;
            
            // Add mortgage-specific costs if applicable
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
            
            // Update the bill amount and due date
            bills[billIndex].amount = totalMonthlyPayment;
            bills[billIndex].dueDate = loan.dueDate;
            
            // Re-render bills to reflect updates
            renderBills();
            updatePaymentSchedule();
        }
    } else {
        // Add new loan
        loans.push(loan);
        
        // Create a corresponding bill entry
        const monthlyPayment = calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term);
          // Calculate total monthly payment
        let totalMonthlyPayment = monthlyPayment;
        
        // Add additional principal payment for all loan types
        totalMonthlyPayment += loan.additionalPrincipal || 0;
        
        // For mortgages, include other additional costs in the monthly payment
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
            priority: 'high',
            paymentAccount: 'checking', // Default to checking account
            creditCardId: null
        };
        
        // Add the new bill
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
        loansContainer.innerHTML = '<p class="text-gray-400 text-center py-4 md:col-span-3 lg:col-span-4">No loans added yet</p>';
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
          // Calculate total monthly payment including additional costs
        let totalMonthlyPayment = monthlyPayment;
        let mortgageDetails = '';
        
        // Add additional principal for all loan types if provided
        const additionalPrincipal = loan.additionalPrincipal || 0;
        totalMonthlyPayment += additionalPrincipal;
        
        if (loan.type === 'mortgage') {
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
                </div>                <div class="grid grid-cols-4 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Interest Rate</p>
                        <p class="font-medium">${loan.interestRate.toFixed(2)}%</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">${loan.type === 'mortgage' ? 'Principal & Interest' : 'Base Payment'}</p>
                        <p class="font-medium text-neon-pink">$${monthlyPayment.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Loan Term</p>
                        <p class="font-medium">${loan.term ? `${loan.term} months` : 'Not specified'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Payments Remaining</p>
                        <p class="font-medium text-neon-green">${calculateRemainingPayments(
                            loan.balance, 
                            loan.interestRate, 
                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                            0
                        )}</p>
                    </div>
                </div>
                
                ${loan.firstPaymentDate ? `
                <div class="mt-2">
                    <p class="text-sm text-gray-400">First Payment Date: <span class="text-white">${new Date(loan.firstPaymentDate).toLocaleDateString()}</span></p>
                </div>
                ` : ''}
                
                ${additionalPrincipal > 0 && loan.type !== 'mortgage' ? `
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-400">Additional Principal</p>
                        <p class="font-medium text-neon-green">$${additionalPrincipal.toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Total Monthly Payment</p>
                        <p class="font-medium text-neon-blue">$${totalMonthlyPayment.toFixed(2)}</p>
                    </div>
                </div>
                ` : ''}
                
                ${mortgageDetails}
                
                <div class="mt-4">
                    <div class="flex justify-between text-sm text-gray-400">
                        <p>Total interest over life of loan:</p>
                        <p class="text-neon-purple">$${calculateTotalInterest(loan.originalAmount, loan.interestRate, loan.term).toFixed(2)}</p>
                    </div>
                </div>

                ${additionalPrincipal > 0 ? `
                <!-- Impact of additional principal payments -->
                <div class="mt-4 border-t border-gray-700 pt-4">
                    <h4 class="text-sm font-medium text-white mb-2">Additional Principal Payment Impact</h4>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs text-gray-400">Without Extra Principal</p>
                            <div class="space-y-1">
                                <p class="font-medium text-neon-blue">Months: <span class="text-white">${calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    0
                                )}</span></p>
                                <p class="font-medium text-neon-blue">Interest: <span class="text-white">$${calculateTotalInterestPaid(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    0
                                ).toFixed(2)}</span></p>
                                <p class="font-medium text-neon-blue">Payoff: <span class="text-white">$${
                                    formatPayoffDate(calculatePayoffDate(
                                        loan.firstPaymentDate,
                                        calculateRemainingPayments(
                                            loan.balance, 
                                            loan.interestRate, 
                                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                            0
                                        )
                                    ))
                                }</span></p>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">With Extra Principal</p>
                            <div class="space-y-1">
                                <p class="font-medium text-neon-green">Months: <span class="text-white">$${calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    additionalPrincipal
                                )}</span></p>
                                <p class="font-medium text-neon-green">Interest: <span class="text-white">$${calculateTotalInterestPaid(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    additionalPrincipal
                                ).toFixed(2)}</span></p>
                                <p class="font-medium text-neon-green">Payoff: <span class="text-white">$${
                                    formatPayoffDate(calculatePayoffDate(
                                        loan.firstPaymentDate,
                                        calculateRemainingPayments(
                                            loan.balance, 
                                            loan.interestRate, 
                                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                            additionalPrincipal
                                        )
                                    ))
                                }</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 bg-glass-blue p-3 rounded-lg">
                        <h5 class="text-sm font-medium text-white mb-2">Impact Summary:</h5>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="text-neon-yellow">
                                <p class="text-xs">Time Saved</p>
                                <p class="font-medium text-neon-yellow">$${calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    0
                                ) - calculateRemainingPayments(
                                    loan.balance, 
                                    loan.interestRate, 
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    additionalPrincipal
                                )} months</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-400">Interest Saved</p>
                                <p class="font-medium text-neon-green">$${(
                                    calculateTotalInterestPaid(
                                        loan.balance, 
                                        loan.interestRate, 
                                        calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                        0
                                    ) - calculateTotalInterestPaid(
                                        loan.balance, 
                                        loan.interestRate, 
                                        calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                        additionalPrincipal
                                    )
                                ).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3 text-xs text-gray-400">
                        <p class="text-xs text-white mt-1">By adding <span class="text-neon-green">$${additionalPrincipal.toFixed(2)}</span> to your monthly payment, you'll save <span class="text-neon-yellow">$${calculateRemainingPayments(
                            loan.balance, 
                            loan.interestRate, 
                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                            0
                        ) - calculateRemainingPayments(
                            loan.balance, 
                            loan.interestRate, 
                            calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                            additionalPrincipal
                        )} months</span> of payments and <span class="text-neon-green">$${(
                            calculateTotalInterestPaid(
                                loan.balance, 
                                loan.interestRate, 
                                calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                0
                            ) - calculateTotalInterestPaid(
                                loan.balance, 
                                loan.interestRate, 
                                calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                additionalPrincipal
                            )
                        ).toFixed(2)}</span> in interest.</p>
                    </div>
                </div>
                ` : ''}
                
                ${loan.term && loan.term > 0 && typeof generateAmortizationChart === 'function' ? generateAmortizationChart(loan) : ''}
            </div>
        `;
    });
    
    loansContainer.innerHTML = html;
}
