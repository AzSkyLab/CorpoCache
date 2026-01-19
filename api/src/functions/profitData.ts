import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { queryRow, query } from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';

interface ProfitDataRow {
  id: number;
  user_id: string;
  monthly_income: number | null;
  monthly_bills: number | null;
  monthly_surplus: number | null;
  paycheck1_net: number | null;
  paycheck1_bills: number | null;
  paycheck1_surplus: number | null;
  paycheck2_net: number | null;
  paycheck2_bills: number | null;
  paycheck2_surplus: number | null;
  paycheck3_net: number | null;
  paycheck3_bills: number | null;
  paycheck3_surplus: number | null;
  has_third_paycheck: boolean;
  annual_income: number | null;
  annual_bonus: number | null;
  annual_bills: number | null;
  annual_surplus: number | null;
  annual_surplus_with_bonus: number | null;
  profit_ratio: number | null;
  pay_frequency: number | null;
}

interface ProfitDataInput {
  monthlyIncome?: number;
  monthlyBills?: number;
  monthlySurplus?: number;
  paycheck1Net?: number;
  paycheck1Bills?: number;
  paycheck1Surplus?: number;
  paycheck2Net?: number;
  paycheck2Bills?: number;
  paycheck2Surplus?: number;
  paycheck3Net?: number;
  paycheck3Bills?: number;
  paycheck3Surplus?: number;
  hasThirdPaycheck?: boolean;
  annualIncome?: number;
  annualBonus?: number;
  annualBills?: number;
  annualSurplus?: number;
  annualSurplusWithBonus?: number;
  profitRatio?: number;
  payFrequency?: number;
}

/**
 * Transform DB row to API response format
 */
function toApiFormat(row: ProfitDataRow | null): Record<string, unknown> {
  if (!row) {
    return {};
  }

  return {
    monthlyIncome: row.monthly_income,
    monthlyBills: row.monthly_bills,
    monthlySurplus: row.monthly_surplus,
    paycheck1Net: row.paycheck1_net,
    paycheck1Bills: row.paycheck1_bills,
    paycheck1Surplus: row.paycheck1_surplus,
    paycheck2Net: row.paycheck2_net,
    paycheck2Bills: row.paycheck2_bills,
    paycheck2Surplus: row.paycheck2_surplus,
    paycheck3Net: row.paycheck3_net,
    paycheck3Bills: row.paycheck3_bills,
    paycheck3Surplus: row.paycheck3_surplus,
    hasThirdPaycheck: row.has_third_paycheck,
    annualIncome: row.annual_income,
    annualBonus: row.annual_bonus,
    annualBills: row.annual_bills,
    annualSurplus: row.annual_surplus,
    annualSurplusWithBonus: row.annual_surplus_with_bonus,
    profitRatio: row.profit_ratio,
    payFrequency: row.pay_frequency,
  };
}

/**
 * GET /api/profitData - Get profit data for user
 * PUT /api/profitData - Save profit data (upsert)
 */
async function profitDataHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const data = await queryRow<ProfitDataRow>(
        'SELECT * FROM ProfitData WHERE user_id = @userId',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: toApiFormat(data),
      };
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as ProfitDataInput;

      // Check if record exists
      const existing = await queryRow<{ id: number }>(
        'SELECT id FROM ProfitData WHERE user_id = @userId',
        { userId: user.id }
      );

      if (existing) {
        // Update existing record
        await query(
          `UPDATE ProfitData SET
            monthly_income = @monthlyIncome,
            monthly_bills = @monthlyBills,
            monthly_surplus = @monthlySurplus,
            paycheck1_net = @paycheck1Net,
            paycheck1_bills = @paycheck1Bills,
            paycheck1_surplus = @paycheck1Surplus,
            paycheck2_net = @paycheck2Net,
            paycheck2_bills = @paycheck2Bills,
            paycheck2_surplus = @paycheck2Surplus,
            paycheck3_net = @paycheck3Net,
            paycheck3_bills = @paycheck3Bills,
            paycheck3_surplus = @paycheck3Surplus,
            has_third_paycheck = @hasThirdPaycheck,
            annual_income = @annualIncome,
            annual_bonus = @annualBonus,
            annual_bills = @annualBills,
            annual_surplus = @annualSurplus,
            annual_surplus_with_bonus = @annualSurplusWithBonus,
            profit_ratio = @profitRatio,
            pay_frequency = @payFrequency,
            updated_at = GETUTCDATE()
           WHERE user_id = @userId`,
          {
            userId: user.id,
            monthlyIncome: body.monthlyIncome ?? null,
            monthlyBills: body.monthlyBills ?? null,
            monthlySurplus: body.monthlySurplus ?? null,
            paycheck1Net: body.paycheck1Net ?? null,
            paycheck1Bills: body.paycheck1Bills ?? null,
            paycheck1Surplus: body.paycheck1Surplus ?? null,
            paycheck2Net: body.paycheck2Net ?? null,
            paycheck2Bills: body.paycheck2Bills ?? null,
            paycheck2Surplus: body.paycheck2Surplus ?? null,
            paycheck3Net: body.paycheck3Net ?? null,
            paycheck3Bills: body.paycheck3Bills ?? null,
            paycheck3Surplus: body.paycheck3Surplus ?? null,
            hasThirdPaycheck: body.hasThirdPaycheck ?? false,
            annualIncome: body.annualIncome ?? null,
            annualBonus: body.annualBonus ?? null,
            annualBills: body.annualBills ?? null,
            annualSurplus: body.annualSurplus ?? null,
            annualSurplusWithBonus: body.annualSurplusWithBonus ?? null,
            profitRatio: body.profitRatio ?? null,
            payFrequency: body.payFrequency ?? null,
          }
        );
      } else {
        // Insert new record
        await query(
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
            monthlyIncome: body.monthlyIncome ?? null,
            monthlyBills: body.monthlyBills ?? null,
            monthlySurplus: body.monthlySurplus ?? null,
            paycheck1Net: body.paycheck1Net ?? null,
            paycheck1Bills: body.paycheck1Bills ?? null,
            paycheck1Surplus: body.paycheck1Surplus ?? null,
            paycheck2Net: body.paycheck2Net ?? null,
            paycheck2Bills: body.paycheck2Bills ?? null,
            paycheck2Surplus: body.paycheck2Surplus ?? null,
            paycheck3Net: body.paycheck3Net ?? null,
            paycheck3Bills: body.paycheck3Bills ?? null,
            paycheck3Surplus: body.paycheck3Surplus ?? null,
            hasThirdPaycheck: body.hasThirdPaycheck ?? false,
            annualIncome: body.annualIncome ?? null,
            annualBonus: body.annualBonus ?? null,
            annualBills: body.annualBills ?? null,
            annualSurplus: body.annualSurplus ?? null,
            annualSurplusWithBonus: body.annualSurplusWithBonus ?? null,
            profitRatio: body.profitRatio ?? null,
            payFrequency: body.payFrequency ?? null,
          }
        );
      }

      // Return updated data
      const updated = await queryRow<ProfitDataRow>(
        'SELECT * FROM ProfitData WHERE user_id = @userId',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: toApiFormat(updated),
      };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in profitData handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

// Register route
app.http('profitData', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'profitData',
  handler: profitDataHandler,
});
