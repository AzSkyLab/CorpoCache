import { Router, Request, Response } from 'express';
import {
  beginTransaction,
  transactionQuery,
  commitTransaction,
  rollbackTransaction,
  queryRow,
} from '../services/database';

const router = Router();

interface SyncPayload {
  creditCards?: Array<{
    name: string;
    limit: number;
    balance: number;
    openDate?: string;
    dueDate: number;
    customImage?: string;
  }>;
  bills?: Array<{
    name: string;
    amount: number;
    dueDate: number;
    type?: string;
    priority?: string;
    isPaid?: boolean;
    varyingAmount?: boolean;
    autoPay?: boolean;
    paymentAccount?: string;
    creditCardId?: number;
  }>;
  loans?: Array<{
    name: string;
    originalAmount: number;
    balance: number;
    interestRate: number;
    dueDate: number;
    type: string;
    term?: number;
    startDate?: string;
    firstPaymentDate?: string;
    additionalPrincipal?: number;
    pmi?: number;
    propertyTax?: number;
    propertyInsurance?: number;
  }>;
  expenses?: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
  salaryData?: Record<string, unknown>;
  profitData?: Record<string, unknown>;
  historicalBillData?: Array<{
    month: number;
    year: number;
    timestamp?: string;
    bills: Array<{
      name: string;
      amount: number;
      type: string;
      dueDate: number;
      isPaid: boolean;
      paymentAccount?: string;
    }>;
  }>;
  currentAppMonth?: number;
  currentAppYear?: number;
}

function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,()%\s]/g, '').replace(/^-/, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      const isNegative = value.includes('-') || value.startsWith('(');
      return isNegative ? -num : num;
    }
  }
  return null;
}

// POST /api/sync
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as SyncPayload;
    const client = await beginTransaction();
    const creditCardIdMap: Map<number, number> = new Map();

    try {
      // 1. Clear existing data
      await transactionQuery(client,
        'DELETE FROM HistoricalBillItems WHERE historical_bill_data_id IN (SELECT id FROM HistoricalBillData WHERE user_id = @userId)',
        { userId: user.id });
      await transactionQuery(client, 'DELETE FROM HistoricalBillData WHERE user_id = @userId', { userId: user.id });
      await transactionQuery(client, 'DELETE FROM Bills WHERE user_id = @userId', { userId: user.id });
      await transactionQuery(client, 'DELETE FROM CreditCards WHERE user_id = @userId', { userId: user.id });
      await transactionQuery(client, 'DELETE FROM Loans WHERE user_id = @userId', { userId: user.id });
      await transactionQuery(client, 'DELETE FROM Expenses WHERE user_id = @userId', { userId: user.id });
      await transactionQuery(client, 'DELETE FROM SalaryData WHERE user_id = @userId', { userId: user.id });
      await transactionQuery(client, 'DELETE FROM ProfitData WHERE user_id = @userId', { userId: user.id });

      // 2. Insert credit cards
      if (body.creditCards && body.creditCards.length > 0) {
        for (let i = 0; i < body.creditCards.length; i++) {
          const card = body.creditCards[i];
          const result = await transactionQuery<{ id: number }>(client,
            `INSERT INTO CreditCards (user_id, name, credit_limit, balance, open_date, due_date, custom_image)
             VALUES (@userId, @name, @limit, @balance, @openDate, @dueDate, @customImage) RETURNING id`,
            {
              userId: user.id,
              name: card.name?.trim() || 'Unnamed Card',
              limit: card.limit || 0,
              balance: card.balance || 0,
              openDate: card.openDate || null,
              dueDate: card.dueDate || 1,
              customImage: card.customImage || null,
            });
          const newId = result.rows[0]?.id;
          if (newId) creditCardIdMap.set(i, newId);
        }
      }

      // 3. Insert bills
      if (body.bills && body.bills.length > 0) {
        for (const bill of body.bills) {
          let newCreditCardId: number | null = null;
          if (bill.creditCardId !== undefined && bill.creditCardId !== null && bill.creditCardId >= 0) {
            newCreditCardId = creditCardIdMap.get(bill.creditCardId) || null;
          }
          await transactionQuery(client,
            `INSERT INTO Bills (user_id, name, amount, due_date, type, priority, is_paid, varying_amount, auto_pay, payment_account, credit_card_id)
             VALUES (@userId, @name, @amount, @dueDate, @type, @priority, @isPaid, @varyingAmount, @autoPay, @paymentAccount, @creditCardId)`,
            {
              userId: user.id,
              name: bill.name?.trim() || 'Unnamed Bill',
              amount: bill.amount || 0,
              dueDate: bill.dueDate || 1,
              type: bill.type || 'normal',
              priority: bill.priority || 'normal',
              isPaid: bill.isPaid || false,
              varyingAmount: bill.varyingAmount || false,
              autoPay: bill.autoPay || false,
              paymentAccount: bill.paymentAccount || null,
              creditCardId: newCreditCardId,
            });
        }
      }

      // 4. Insert loans
      if (body.loans && body.loans.length > 0) {
        for (const loan of body.loans) {
          await transactionQuery(client,
            `INSERT INTO Loans (user_id, name, original_amount, balance, interest_rate, due_date, type, term, start_date, first_payment_date, additional_principal, pmi, property_tax, property_insurance)
             VALUES (@userId, @name, @originalAmount, @balance, @interestRate, @dueDate, @type, @term, @startDate, @firstPaymentDate, @additionalPrincipal, @pmi, @propertyTax, @propertyInsurance)`,
            {
              userId: user.id,
              name: loan.name?.trim() || 'Unnamed Loan',
              originalAmount: loan.originalAmount || 0,
              balance: loan.balance || 0,
              interestRate: loan.interestRate || 0,
              dueDate: loan.dueDate || 1,
              type: loan.type || 'personal',
              term: loan.term || null,
              startDate: loan.startDate || new Date().toISOString().split('T')[0],
              firstPaymentDate: loan.firstPaymentDate || null,
              additionalPrincipal: loan.additionalPrincipal || 0,
              pmi: loan.pmi || 0,
              propertyTax: loan.propertyTax || 0,
              propertyInsurance: loan.propertyInsurance || 0,
            });
        }
      }

      // 5. Insert expenses
      if (body.expenses && body.expenses.length > 0) {
        for (const expense of body.expenses) {
          await transactionQuery(client,
            `INSERT INTO Expenses (user_id, name, amount, category)
             VALUES (@userId, @name, @amount, @category)`,
            {
              userId: user.id,
              name: expense.name?.trim() || 'Unnamed Expense',
              amount: expense.amount || 0,
              category: expense.category?.trim() || 'other',
            });
        }
      }

      // 6. Insert salary data
      if (body.salaryData && Object.keys(body.salaryData).length > 0) {
        const s = body.salaryData;
        await transactionQuery(client,
          `INSERT INTO SalaryData (
            user_id, annual_salary, pay_frequency, filing_status, state_tax_rate,
            retirement_percent, espp_percent, health_amount, dental_amount, vision_amount,
            fsa_amount, bonus_amount, last_pay_date, first_pay_date, gross_pay,
            net_pay, federal_tax_amount, federal_tax_rate, oasdi_tax_amount, medicare_tax_amount,
            state_tax_amount, total_tax_amount, retirement_amount, espp_amount_calc, insurance_total,
            savings_total, after_tax_bonus
          ) VALUES (
            @userId, @annualSalary, @payFrequency, @filingStatus, @stateTaxRate,
            @retirementPercent, @esppPercent, @healthAmount, @dentalAmount, @visionAmount,
            @fsaAmount, @bonusAmount, @lastPayDate, @firstPayDate, @grossPay,
            @netPay, @federalTaxAmount, @federalTaxRate, @oasdiTaxAmount, @medicareTaxAmount,
            @stateTaxAmount, @totalTaxAmount, @retirementAmount, @esppAmountCalc, @insuranceTotal,
            @savingsTotal, @afterTaxBonus
          )`,
          {
            userId: user.id,
            annualSalary: parseNumeric(s.gross || s.annualSalary),
            payFrequency: s.payFrequency || null,
            filingStatus: s.filingStatus || null,
            stateTaxRate: parseNumeric(s.stateRate),
            retirementPercent: parseNumeric(s.retirementPercent),
            esppPercent: parseNumeric(s.esppPercent),
            healthAmount: parseNumeric(s.healthAmount),
            dentalAmount: parseNumeric(s.dentalAmount),
            visionAmount: parseNumeric(s.visionAmount),
            fsaAmount: parseNumeric(s.fsaAmount),
            bonusAmount: parseNumeric(s.bonusAmount),
            lastPayDate: s.lastPayDate || null,
            firstPayDate: s.firstPayDate || null,
            grossPay: parseNumeric(s.grossPay),
            netPay: parseNumeric(s.netPay),
            federalTaxAmount: parseNumeric(s.federalTaxAmount),
            federalTaxRate: parseNumeric(s.federalTaxRate),
            oasdiTaxAmount: parseNumeric(s.oasdiTaxAmount),
            medicareTaxAmount: parseNumeric(s.medicareTaxAmount),
            stateTaxAmount: parseNumeric(s.stateTaxAmount),
            totalTaxAmount: parseNumeric(s.taxAmount),
            retirementAmount: parseNumeric(s.retirementAmount),
            esppAmountCalc: parseNumeric(s.esppAmount),
            insuranceTotal: parseNumeric(s.insuranceTotal),
            savingsTotal: parseNumeric(s.savingsTotal),
            afterTaxBonus: parseNumeric(s.afterTaxBonusAmount),
          });
      }

      // 7. Insert profit data
      if (body.profitData && Object.keys(body.profitData).length > 0) {
        const p = body.profitData;
        await transactionQuery(client,
          `INSERT INTO ProfitData (
            user_id, monthly_income, monthly_bills, monthly_surplus,
            paycheck1_net, paycheck1_bills, paycheck1_surplus,
            paycheck2_net, paycheck2_bills, paycheck2_surplus,
            paycheck3_net, paycheck3_bills, paycheck3_surplus, has_third_paycheck,
            annual_income, annual_bonus, annual_bills, annual_surplus, annual_surplus_with_bonus,
            profit_ratio, pay_frequency
          ) VALUES (
            @userId, @monthlyIncome, @monthlyBills, @monthlySurplus,
            @paycheck1Net, @paycheck1Bills, @paycheck1Surplus,
            @paycheck2Net, @paycheck2Bills, @paycheck2Surplus,
            @paycheck3Net, @paycheck3Bills, @paycheck3Surplus, @hasThirdPaycheck,
            @annualIncome, @annualBonus, @annualBills, @annualSurplus, @annualSurplusWithBonus,
            @profitRatio, @payFrequency
          )`,
          {
            userId: user.id,
            monthlyIncome: parseNumeric(p.gpMonthlyIncome),
            monthlyBills: parseNumeric(p.gpMonthlyBills),
            monthlySurplus: parseNumeric(p.gpMonthlySurplus),
            paycheck1Net: parseNumeric(p.gpPaycheck1Net),
            paycheck1Bills: parseNumeric(p.gpPaycheck1Bills),
            paycheck1Surplus: parseNumeric(p.gpPaycheck1Surplus),
            paycheck2Net: parseNumeric(p.gpPaycheck2Net),
            paycheck2Bills: parseNumeric(p.gpPaycheck2Bills),
            paycheck2Surplus: parseNumeric(p.gpPaycheck2Surplus),
            paycheck3Net: parseNumeric(p.gpPaycheck3Net),
            paycheck3Bills: parseNumeric(p.gpPaycheck3Bills),
            paycheck3Surplus: parseNumeric(p.gpPaycheck3Surplus),
            hasThirdPaycheck: p.hasThirdPaycheckInSameMonth || false,
            annualIncome: parseNumeric(p.gpAnnualIncome),
            annualBonus: parseNumeric(p.gpAnnualBonus),
            annualBills: parseNumeric(p.gpAnnualBills),
            annualSurplus: parseNumeric(p.gpAnnualSurplus),
            annualSurplusWithBonus: parseNumeric(p.gpAnnualSurplusWithBonus),
            profitRatio: p.profitRatio || null,
            payFrequency: p.payFrequency || null,
          });
      }

      // 8. Insert historical bill data
      if (body.historicalBillData && body.historicalBillData.length > 0) {
        for (const hist of body.historicalBillData) {
          const result = await transactionQuery<{ id: number }>(client,
            `INSERT INTO HistoricalBillData (user_id, month, year, timestamp)
             VALUES (@userId, @month, @year, @timestamp) RETURNING id`,
            {
              userId: user.id,
              month: hist.month,
              year: hist.year,
              timestamp: hist.timestamp || new Date().toISOString(),
            });
          const histId = result.rows[0]?.id;
          if (histId && hist.bills && hist.bills.length > 0) {
            for (const bill of hist.bills) {
              await transactionQuery(client,
                `INSERT INTO HistoricalBillItems
                 (historical_bill_data_id, name, amount, type, due_date, is_paid, payment_account)
                 VALUES (@histId, @name, @amount, @type, @dueDate, @isPaid, @paymentAccount)`,
                {
                  histId,
                  name: bill.name || 'Unnamed',
                  amount: bill.amount || 0,
                  type: bill.type || 'normal',
                  dueDate: bill.dueDate || 1,
                  isPaid: bill.isPaid || false,
                  paymentAccount: bill.paymentAccount || null,
                });
            }
          }
        }
      }

      // 9. Update user app state
      if (body.currentAppMonth !== undefined || body.currentAppYear !== undefined) {
        await transactionQuery(client,
          `UPDATE Users SET
            current_app_month = COALESCE(@currentAppMonth, current_app_month),
            current_app_year = COALESCE(@currentAppYear, current_app_year),
            updated_at = NOW()
           WHERE id = @userId`,
          {
            userId: user.id,
            currentAppMonth: body.currentAppMonth,
            currentAppYear: body.currentAppYear,
          });
      }

      await commitTransaction(client);

      res.json({
        success: true,
        message: 'Data synchronized successfully',
        stats: {
          creditCards: body.creditCards?.length || 0,
          bills: body.bills?.length || 0,
          loans: body.loans?.length || 0,
          expenses: body.expenses?.length || 0,
          historicalSnapshots: body.historicalBillData?.length || 0,
        },
      });
    } catch (error) {
      await rollbackTransaction(client);
      throw error;
    }
  } catch (error) {
    console.error('Error in POST /sync:', error);
    res.status(500).json({ error: 'Internal server error during sync' });
  }
});

export default router;
