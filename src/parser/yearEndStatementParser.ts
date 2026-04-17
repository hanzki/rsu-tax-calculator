import { parseISO, isValid } from 'date-fns';

export type YearEndStatementLot = {
    symbol: string;
    quantity: number;
    purchaseDate: Date;
    purchasePriceUSD: number;
};

export type ParsedYearEndStatement = {
    reportThroughDate: Date;
    individualLots: YearEndStatementLot[];
    eacLots: YearEndStatementLot[];
};

type RawLot = {
    symbol?: unknown;
    quantity?: unknown;
    purchaseDate?: unknown;
    purchasePriceUSD?: unknown;
};

function assertU(symbol: string, context: string): void {
    if (symbol !== 'U') {
        throw new Error(
            `Unsupported data in ${context}: symbol "${symbol}". Currently only Unity Technologies Inc. (U) shares are supported.`
        );
    }
}

function parseLot(raw: RawLot, context: string): YearEndStatementLot {
    if (typeof raw.symbol !== 'string' || raw.symbol === '') {
        throw new Error(`Invalid ${context} lot: missing symbol`);
    }
    assertU(raw.symbol, context);

    const quantity = Number(raw.quantity);
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`Invalid ${context} lot: quantity must be a positive integer`);
    }

    if (typeof raw.purchaseDate !== 'string' || raw.purchaseDate === '') {
        throw new Error(`Invalid ${context} lot: missing purchaseDate`);
    }
    const purchaseDate = parseISO(raw.purchaseDate);
    if (!isValid(purchaseDate)) {
        throw new Error(`Invalid ${context} lot: could not parse purchaseDate "${raw.purchaseDate}"`);
    }

    const purchasePriceUSD = Number(raw.purchasePriceUSD);
    if (!Number.isFinite(purchasePriceUSD) || purchasePriceUSD < 0) {
        throw new Error(`Invalid ${context} lot: purchasePriceUSD must be a non-negative number`);
    }

    return {
        symbol: raw.symbol,
        quantity,
        purchaseDate,
        purchasePriceUSD,
    };
}

/**
 * Parses a year-end statement JSON file produced by this app's "Download Year-End Statement" feature.
 */
export function parseYearEndStatementExport(input: string): ParsedYearEndStatement {
    let data: unknown;
    try {
        data = JSON.parse(input);
    } catch {
        throw new Error('Year-end statement file is not valid JSON');
    }

    if (data === null || typeof data !== 'object') {
        throw new Error('Year-end statement JSON must be an object');
    }

    const obj = data as Record<string, unknown>;
    const reportRaw = obj.reportThroughDate;
    if (typeof reportRaw !== 'string' || reportRaw === '') {
        throw new Error('Year-end statement is missing reportThroughDate');
    }
    const reportThroughDate = parseISO(reportRaw);
    if (!isValid(reportThroughDate)) {
        throw new Error(`Could not parse reportThroughDate "${reportRaw}"`);
    }

    const accounts = obj.accounts;
    if (accounts === null || typeof accounts !== 'object') {
        throw new Error('Year-end statement is missing accounts');
    }
    const acc = accounts as Record<string, unknown>;

    const indRaw = acc.individual;
    const eacRaw = acc.eac;
    if (!Array.isArray(indRaw) || !Array.isArray(eacRaw)) {
        throw new Error('Year-end statement accounts.individual and accounts.eac must be arrays');
    }

    return {
        reportThroughDate,
        individualLots: indRaw.map((row, i) => parseLot(row as RawLot, `accounts.individual[${i}]`)),
        eacLots: eacRaw.map((row, i) => parseLot(row as RawLot, `accounts.eac[${i}]`)),
    };
}
