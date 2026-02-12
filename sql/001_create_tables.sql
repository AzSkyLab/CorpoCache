-- CorpoCache Database Schema
-- PostgreSQL

-- Users table - stores user identity and app state
CREATE TABLE Users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255),
    display_name VARCHAR(255),
    current_app_month INT DEFAULT 0,  -- 0-11 (JavaScript month format)
    current_app_year INT DEFAULT 2025,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Cards table
CREATE TABLE CreditCards (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    credit_limit DECIMAL(12,2) NOT NULL,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    open_date DATE,
    due_date INT NOT NULL,  -- Day of month (1-31)
    custom_image VARCHAR(100),  -- Credit card company identifier
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT FK_CreditCards_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT CHK_CreditCards_DueDate CHECK (due_date >= 1 AND due_date <= 31)
);

-- Bills table
CREATE TABLE Bills (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date INT NOT NULL,  -- Day of month (1-31)
    type VARCHAR(20) NOT NULL DEFAULT 'normal',  -- 'normal', 'credit', 'loan'
    priority VARCHAR(20) DEFAULT 'normal',  -- 'low', 'normal', 'high'
    is_paid BOOLEAN DEFAULT FALSE,
    varying_amount BOOLEAN DEFAULT FALSE,
    auto_pay BOOLEAN DEFAULT FALSE,
    payment_account VARCHAR(20),  -- 'checking', 'savings', or NULL
    credit_card_id INT,  -- Reference to CreditCards table (for type='credit')
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT FK_Bills_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Bills_CreditCards FOREIGN KEY (credit_card_id) REFERENCES CreditCards(id) ON DELETE NO ACTION,
    CONSTRAINT CHK_Bills_DueDate CHECK (due_date >= 1 AND due_date <= 31),
    CONSTRAINT CHK_Bills_Type CHECK (type IN ('normal', 'credit', 'loan')),
    CONSTRAINT CHK_Bills_Priority CHECK (priority IN ('low', 'normal', 'high')),
    CONSTRAINT CHK_Bills_PaymentAccount CHECK (payment_account IS NULL OR payment_account IN ('checking', 'savings'))
);

-- Loans table
CREATE TABLE Loans (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    original_amount DECIMAL(14,2) NOT NULL,
    balance DECIMAL(14,2) NOT NULL,
    interest_rate DECIMAL(6,4) NOT NULL,  -- Annual percentage rate (e.g., 6.5 for 6.5%)
    due_date INT NOT NULL,  -- Day of month (1-31)
    type VARCHAR(20) NOT NULL,  -- 'car', 'personal', 'mortgage', 'student'
    term INT,  -- Loan term in months
    start_date DATE,
    first_payment_date DATE,
    additional_principal DECIMAL(12,2) DEFAULT 0,  -- Extra monthly principal payment
    -- Mortgage-specific fields
    pmi DECIMAL(10,2) DEFAULT 0,  -- Private mortgage insurance
    property_tax DECIMAL(10,2) DEFAULT 0,  -- Monthly property tax
    property_insurance DECIMAL(10,2) DEFAULT 0,  -- Monthly insurance
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT FK_Loans_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT CHK_Loans_DueDate CHECK (due_date >= 1 AND due_date <= 31),
    CONSTRAINT CHK_Loans_Type CHECK (type IN ('car', 'personal', 'mortgage', 'student'))
);

-- Expenses table
CREATE TABLE Expenses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT FK_Expenses_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Salary Data table - stores salary calculation inputs and results
CREATE TABLE SalaryData (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    -- Input values
    annual_salary DECIMAL(14,2),
    pay_frequency INT,  -- 26 for bi-weekly, 24 for semi-monthly
    filing_status VARCHAR(20),  -- 'single', 'married', 'head'
    state_tax_rate DECIMAL(6,4),
    retirement_percent DECIMAL(6,4),
    espp_percent DECIMAL(6,4),
    health_amount DECIMAL(10,2),
    dental_amount DECIMAL(10,2),
    vision_amount DECIMAL(10,2),
    fsa_amount DECIMAL(10,2),
    bonus_amount DECIMAL(14,2),
    -- Date fields
    last_pay_date DATE,
    first_pay_date DATE,
    -- Calculated values (cached for display)
    gross_pay DECIMAL(12,2),
    net_pay DECIMAL(12,2),
    federal_tax_amount DECIMAL(12,2),
    federal_tax_rate DECIMAL(6,4),
    oasdi_tax_amount DECIMAL(12,2),
    medicare_tax_amount DECIMAL(12,2),
    state_tax_amount DECIMAL(12,2),
    total_tax_amount DECIMAL(12,2),
    retirement_amount DECIMAL(12,2),
    espp_amount_calc DECIMAL(12,2),
    insurance_total DECIMAL(12,2),
    savings_total DECIMAL(12,2),
    after_tax_bonus DECIMAL(14,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT FK_SalaryData_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT CHK_SalaryData_PayFrequency CHECK (pay_frequency IS NULL OR pay_frequency IN (24, 26)),
    CONSTRAINT CHK_SalaryData_FilingStatus CHECK (filing_status IS NULL OR filing_status IN ('single', 'married', 'head'))
);

-- Profit Data table - stores profit/loss calculation results
CREATE TABLE ProfitData (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    -- Monthly breakdown
    monthly_income DECIMAL(12,2),
    monthly_bills DECIMAL(12,2),
    monthly_surplus DECIMAL(12,2),
    -- Paycheck 1
    paycheck1_net DECIMAL(12,2),
    paycheck1_bills DECIMAL(12,2),
    paycheck1_surplus DECIMAL(12,2),
    -- Paycheck 2
    paycheck2_net DECIMAL(12,2),
    paycheck2_bills DECIMAL(12,2),
    paycheck2_surplus DECIMAL(12,2),
    -- Paycheck 3 (optional)
    paycheck3_net DECIMAL(12,2),
    paycheck3_bills DECIMAL(12,2),
    paycheck3_surplus DECIMAL(12,2),
    has_third_paycheck BOOLEAN DEFAULT FALSE,
    -- Annual breakdown
    annual_income DECIMAL(14,2),
    annual_bonus DECIMAL(14,2),
    annual_bills DECIMAL(14,2),
    annual_surplus DECIMAL(14,2),
    annual_surplus_with_bonus DECIMAL(14,2),
    -- Status indicators
    profit_ratio DECIMAL(6,2),
    pay_frequency INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT FK_ProfitData_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Historical Bill Data table - monthly snapshots
CREATE TABLE HistoricalBillData (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    month INT NOT NULL,  -- 0-11 (JavaScript month format)
    year INT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT FK_HistoricalBillData_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT CHK_HistoricalBillData_Month CHECK (month >= 0 AND month <= 11),
    CONSTRAINT UQ_HistoricalBillData_UserMonthYear UNIQUE (user_id, month, year)
);

-- Historical Bill Items table - individual bills in a snapshot
CREATE TABLE HistoricalBillItems (
    id SERIAL PRIMARY KEY,
    historical_bill_data_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    due_date INT NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_account VARCHAR(20),
    CONSTRAINT FK_HistoricalBillItems_HistoricalBillData FOREIGN KEY (historical_bill_data_id) REFERENCES HistoricalBillData(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IX_CreditCards_UserId ON CreditCards(user_id);
CREATE INDEX IX_Bills_UserId ON Bills(user_id);
CREATE INDEX IX_Bills_CreditCardId ON Bills(credit_card_id);
CREATE INDEX IX_Loans_UserId ON Loans(user_id);
CREATE INDEX IX_Expenses_UserId ON Expenses(user_id);
CREATE INDEX IX_HistoricalBillData_UserId ON HistoricalBillData(user_id);
CREATE INDEX IX_HistoricalBillData_MonthYear ON HistoricalBillData(user_id, month, year);
CREATE INDEX IX_HistoricalBillItems_HistoricalBillDataId ON HistoricalBillItems(historical_bill_data_id);
