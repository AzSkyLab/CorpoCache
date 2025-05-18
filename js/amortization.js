// Function to generate amortization data
function generateAmortizationData(principal, interestRate, term, additionalPrincipal = 0) {
    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 100 / 12;
    
    // If term is not defined or interest rate is zero, return empty array
    if (!term || term <= 0 || monthlyRate === 0) {
        return [];
    }
    
    // Calculate monthly payment using standard amortization formula
    const monthlyPayment = calculateLoanPayment(principal, interestRate, term);
    
    // Initialize data arrays
    const data = [];
    
    // Add initial point (month 0)
    data.push({
        month: 0,
        balance: principal,
        balanceWithExtra: principal
    });
    
    // Generate data for each month
    let remainingBalanceRegular = principal;
    let remainingBalanceWithExtra = principal;
    
    for (let month = 1; month <= term; month++) {
        // Regular payment
        if (remainingBalanceRegular > 0) {
            const interestAmountRegular = remainingBalanceRegular * monthlyRate;
            const principalPaidRegular = Math.min(monthlyPayment - interestAmountRegular, remainingBalanceRegular);
            remainingBalanceRegular -= principalPaidRegular;
        }
        
        // Payment with extra principal
        if (remainingBalanceWithExtra > 0) {
            const interestAmountWithExtra = remainingBalanceWithExtra * monthlyRate;
            const principalPaidWithExtra = Math.min(monthlyPayment - interestAmountWithExtra, remainingBalanceWithExtra);
            const extraPrincipalPaid = Math.min(additionalPrincipal, remainingBalanceWithExtra - principalPaidWithExtra);
            remainingBalanceWithExtra -= (principalPaidWithExtra + extraPrincipalPaid);
        }
        
        // Add data point if either balance is still positive or at certain intervals
        if (remainingBalanceRegular > 0 || remainingBalanceWithExtra > 0 || month % Math.max(1, Math.floor(term / 12)) === 0 || month === term) {
            data.push({
                month: month,
                balance: Math.max(0, remainingBalanceRegular),
                balanceWithExtra: Math.max(0, remainingBalanceWithExtra)
            });
        }
        
        // Stop if both balances are paid off
        if (remainingBalanceRegular <= 0 && remainingBalanceWithExtra <= 0) {
            break;
        }
    }
    
    return data;
}

// Function to generate the chart HTML
function generateAmortizationChart(loan) {
    if (!loan.term || loan.term <= 0) {
        return '<div class="text-center text-gray-400 py-2">Insufficient loan data to generate amortization chart</div>';
    }
    
    const additionalPrincipal = loan.additionalPrincipal || 0;
    const data = generateAmortizationData(loan.balance, loan.interestRate, loan.term, additionalPrincipal);
    
    if (data.length <= 1) {
        return '<div class="text-center text-gray-400 py-2">Unable to generate amortization chart</div>';
    }
    
    // Calculate the max balance for scaling
    const maxBalance = loan.balance;
    
    // Prepare the chart HTML
    let chartHTML = `
        <div class="amortization-chart-container mt-4">
            <h4 class="text-sm font-medium text-white mb-2">Loan Amortization Visualization</h4>
            <div class="cyber-chart-container">
    `;
      // Generate the chart lines
    const chartWidth = 100; // percentage width
    const chartHeight = 130; // pixels height - increased to match the CSS
    const padding = 15; // increased padding to ensure lines are fully visible
    
    // Regular balance line - always neon pink (#ff00ff)
    let regularLine = '<polyline points="';
    data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        // Add padding to ensure bottom of chart is visible
        const y = padding + (chartHeight - padding*2) - (((point.balance / maxBalance) * (chartHeight - padding*2)));
        regularLine += `${x},${y} `;
    });
    regularLine += '" fill="none" stroke="#ff00ff" stroke-width="2" />';
    
    // With additional principal line - bright neon green
    let extraLine = '';
    // Only add the extra line if there is additional principal
    if (additionalPrincipal > 0) {
        extraLine = '<polyline points="';
        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            // Add padding to ensure bottom of chart is visible
            const y = padding + (chartHeight - padding*2) - (((point.balanceWithExtra / maxBalance) * (chartHeight - padding*2)));
            extraLine += `${x},${y} `;
        });
        extraLine += '" fill="none" stroke="#00ff9f" stroke-width="2" />';
    }
    
    // Generate simple legend
    let legend = `
        <div class="chart-legend">
            <div class="legend-item">
                <span class="legend-color" style="background-color: #ff00ff;"></span>
                <span class="legend-text">Regular Payments</span>
            </div>`;
            
    // Only show extra payments in legend if they exist
    if (additionalPrincipal > 0) {
        legend += `
            <div class="legend-item">
                <span class="legend-color" style="background-color: #00ff9f;"></span>
                <span class="legend-text">With Extra Payments</span>
            </div>`;
    }
    
    legend += `</div>`;
    
    // Complete the chart with legend
    chartHTML += `
                <svg class="chart-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none">
                    ${regularLine}
                    ${extraLine}
                </svg>
                ${legend}
            </div>
        </div>
    `;
    return chartHTML;
}
