                                <p class="font-medium text-neon-blue">Interest: <span class="text-white">$${calculateTotalInterestPaid(
                                    loan.balance,
                                    loan.interestRate,
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    0
                                ).toFixed(2)}</span></p>
                            </div>
                        </div>
                        
                        <div>
                            <p class="text-xs text-gray-400">With Extra Principal</p>
                            <div class="space-y-1">
                                <p class="font-medium text-neon-blue">Months: <span class="text-white">${calculateRemainingPayments(
                                    loan.balance,
                                    loan.interestRate,
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    50
                                )}</span></p>
                                <p class="font-medium text-neon-blue">Interest: <span class="text-white">$${calculateTotalInterestPaid(
                                    loan.balance,
                                    loan.interestRate,
                                    calculateLoanPayment(loan.originalAmount, loan.interestRate, loan.term),
                                    50
                                ).toFixed(2)}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
            </div>
        `;
    }).join('');
    } else {
        return '<p class="text-gray-400 text-center">No loans to display</p>';
    }
}
