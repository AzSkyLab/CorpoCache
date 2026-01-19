import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { queryRow, query } from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';

interface SalaryDataRow {
  id: number;
  user_id: string;
  annual_salary: number | null;
  pay_frequency: number | null;
  filing_status: string | null;
  state_tax_rate: number | null;
  retirement_percent: number | null;
  espp_percent: number | null;
  health_amount: number | null;
  dental_amount: number | null;
  vision_amount: number | null;
  fsa_amount: number | null;
  bonus_amount: number | null;
  last_pay_date: string | null;
  first_pay_date: string | null;
  gross_pay: number | null;
  net_pay: number | null;
  federal_tax_amount: number | null;
  federal_tax_rate: number | null;
  oasdi_tax_amount: number | null;
  medicare_tax_amount: number | null;
  state_tax_amount: number | null;
  total_tax_amount: number | null;
  retirement_amount: number | null;
  espp_amount_calc: number | null;
  insurance_total: number | null;
  savings_total: number | null;
  after_tax_bonus: number | null;
}

interface SalaryDataInput {
  annualSalary?: number;
  payFrequency?: number;
  filingStatus?: string;
  stateTaxRate?: number;
  retirementPercent?: number;
  esppPercent?: number;
  healthAmount?: number;
  dentalAmount?: number;
  visionAmount?: number;
  fsaAmount?: number;
  bonusAmount?: number;
  lastPayDate?: string;
  firstPayDate?: string;
  // Calculated values can also be stored
  grossPay?: number;
  netPay?: number;
  federalTaxAmount?: number;
  federalTaxRate?: number;
  oasdiTaxAmount?: number;
  medicareTaxAmount?: number;
  stateTaxAmount?: number;
  totalTaxAmount?: number;
  retirementAmount?: number;
  esppAmountCalc?: number;
  insuranceTotal?: number;
  savingsTotal?: number;
  afterTaxBonus?: number;
}

/**
 * Transform DB row to API response format
 */
function toApiFormat(row: SalaryDataRow | null): Record<string, unknown> {
  if (!row) {
    return {};
  }

  return {
    annualSalary: row.annual_salary,
    payFrequency: row.pay_frequency,
    filingStatus: row.filing_status,
    stateTaxRate: row.state_tax_rate,
    retirementPercent: row.retirement_percent,
    esppPercent: row.espp_percent,
    healthAmount: row.health_amount,
    dentalAmount: row.dental_amount,
    visionAmount: row.vision_amount,
    fsaAmount: row.fsa_amount,
    bonusAmount: row.bonus_amount,
    lastPayDate: row.last_pay_date,
    firstPayDate: row.first_pay_date,
    grossPay: row.gross_pay,
    netPay: row.net_pay,
    federalTaxAmount: row.federal_tax_amount,
    federalTaxRate: row.federal_tax_rate,
    oasdiTaxAmount: row.oasdi_tax_amount,
    medicareTaxAmount: row.medicare_tax_amount,
    stateTaxAmount: row.state_tax_amount,
    totalTaxAmount: row.total_tax_amount,
    retirementAmount: row.retirement_amount,
    esppAmountCalc: row.espp_amount_calc,
    insuranceTotal: row.insurance_total,
    savingsTotal: row.savings_total,
    afterTaxBonus: row.after_tax_bonus,
  };
}

/**
 * GET /api/salaryData - Get salary data for user
 * PUT /api/salaryData - Save salary data (upsert)
 */
async function salaryDataHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const data = await queryRow<SalaryDataRow>(
        'SELECT * FROM SalaryData WHERE user_id = @userId',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: toApiFormat(data),
      };
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as SalaryDataInput;

      // Check if record exists
      const existing = await queryRow<{ id: number }>(
        'SELECT id FROM SalaryData WHERE user_id = @userId',
        { userId: user.id }
      );

      if (existing) {
        // Update existing record
        await query(
          `UPDATE SalaryData SET
            annual_salary = @annualSalary,
            pay_frequency = @payFrequency,
            filing_status = @filingStatus,
            state_tax_rate = @stateTaxRate,
            retirement_percent = @retirementPercent,
            espp_percent = @esppPercent,
            health_amount = @healthAmount,
            dental_amount = @dentalAmount,
            vision_amount = @visionAmount,
            fsa_amount = @fsaAmount,
            bonus_amount = @bonusAmount,
            last_pay_date = @lastPayDate,
            first_pay_date = @firstPayDate,
            gross_pay = @grossPay,
            net_pay = @netPay,
            federal_tax_amount = @federalTaxAmount,
            federal_tax_rate = @federalTaxRate,
            oasdi_tax_amount = @oasdiTaxAmount,
            medicare_tax_amount = @medicareTaxAmount,
            state_tax_amount = @stateTaxAmount,
            total_tax_amount = @totalTaxAmount,
            retirement_amount = @retirementAmount,
            espp_amount_calc = @esppAmountCalc,
            insurance_total = @insuranceTotal,
            savings_total = @savingsTotal,
            after_tax_bonus = @afterTaxBonus,
            updated_at = GETUTCDATE()
           WHERE user_id = @userId`,
          {
            userId: user.id,
            annualSalary: body.annualSalary ?? null,
            payFrequency: body.payFrequency ?? null,
            filingStatus: body.filingStatus ?? null,
            stateTaxRate: body.stateTaxRate ?? null,
            retirementPercent: body.retirementPercent ?? null,
            esppPercent: body.esppPercent ?? null,
            healthAmount: body.healthAmount ?? null,
            dentalAmount: body.dentalAmount ?? null,
            visionAmount: body.visionAmount ?? null,
            fsaAmount: body.fsaAmount ?? null,
            bonusAmount: body.bonusAmount ?? null,
            lastPayDate: body.lastPayDate ?? null,
            firstPayDate: body.firstPayDate ?? null,
            grossPay: body.grossPay ?? null,
            netPay: body.netPay ?? null,
            federalTaxAmount: body.federalTaxAmount ?? null,
            federalTaxRate: body.federalTaxRate ?? null,
            oasdiTaxAmount: body.oasdiTaxAmount ?? null,
            medicareTaxAmount: body.medicareTaxAmount ?? null,
            stateTaxAmount: body.stateTaxAmount ?? null,
            totalTaxAmount: body.totalTaxAmount ?? null,
            retirementAmount: body.retirementAmount ?? null,
            esppAmountCalc: body.esppAmountCalc ?? null,
            insuranceTotal: body.insuranceTotal ?? null,
            savingsTotal: body.savingsTotal ?? null,
            afterTaxBonus: body.afterTaxBonus ?? null,
          }
        );
      } else {
        // Insert new record
        await query(
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
            annualSalary: body.annualSalary ?? null,
            payFrequency: body.payFrequency ?? null,
            filingStatus: body.filingStatus ?? null,
            stateTaxRate: body.stateTaxRate ?? null,
            retirementPercent: body.retirementPercent ?? null,
            esppPercent: body.esppPercent ?? null,
            healthAmount: body.healthAmount ?? null,
            dentalAmount: body.dentalAmount ?? null,
            visionAmount: body.visionAmount ?? null,
            fsaAmount: body.fsaAmount ?? null,
            bonusAmount: body.bonusAmount ?? null,
            lastPayDate: body.lastPayDate ?? null,
            firstPayDate: body.firstPayDate ?? null,
            grossPay: body.grossPay ?? null,
            netPay: body.netPay ?? null,
            federalTaxAmount: body.federalTaxAmount ?? null,
            federalTaxRate: body.federalTaxRate ?? null,
            oasdiTaxAmount: body.oasdiTaxAmount ?? null,
            medicareTaxAmount: body.medicareTaxAmount ?? null,
            stateTaxAmount: body.stateTaxAmount ?? null,
            totalTaxAmount: body.totalTaxAmount ?? null,
            retirementAmount: body.retirementAmount ?? null,
            esppAmountCalc: body.esppAmountCalc ?? null,
            insuranceTotal: body.insuranceTotal ?? null,
            savingsTotal: body.savingsTotal ?? null,
            afterTaxBonus: body.afterTaxBonus ?? null,
          }
        );
      }

      // Return updated data
      const updated = await queryRow<SalaryDataRow>(
        'SELECT * FROM SalaryData WHERE user_id = @userId',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: toApiFormat(updated),
      };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in salaryData handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

// Register route
app.http('salaryData', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'salaryData',
  handler: salaryDataHandler,
});
