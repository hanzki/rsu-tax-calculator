import { describe, it, expect } from 'vitest';
import { format } from 'date-fns';
import { parseYearEndStatementExport } from './yearEndStatementParser';

const validJson = JSON.stringify({
    reportThroughDate: '2023-12-31',
    generatedAt: "2024-01-01T12:00:00+00:00",
    appVersion: '0.13.0',
    accounts: {
        individual: [
            { symbol: 'U', quantity: 10, purchaseDate: '2022-06-01', purchasePriceUSD: 40.5 },
        ],
        eac: [
            { symbol: 'U', quantity: 5, purchaseDate: '2023-01-15', purchasePriceUSD: 12.3 },
        ],
    },
});

describe('parseYearEndStatementExport', () => {
    it('parses a valid year-end export', () => {
        const r = parseYearEndStatementExport(validJson);
        expect(format(r.reportThroughDate, 'yyyy-MM-dd')).toBe('2023-12-31');
        expect(r.individualLots).toHaveLength(1);
        expect(r.individualLots[0].quantity).toBe(10);
        expect(r.individualLots[0].purchasePriceUSD).toBe(40.5);
        expect(r.eacLots).toHaveLength(1);
        expect(r.eacLots[0].quantity).toBe(5);
    });

    it('rejects invalid JSON', () => {
        expect(() => parseYearEndStatementExport('not json')).toThrow(/valid JSON/);
    });

    it('rejects missing reportThroughDate', () => {
        expect(() =>
            parseYearEndStatementExport(JSON.stringify({ accounts: { individual: [], eac: [] } }))
        ).toThrow(/reportThroughDate/);
    });

    it('rejects non-U symbol', () => {
        const bad = JSON.parse(validJson);
        bad.accounts.individual[0].symbol = 'AAPL';
        expect(() => parseYearEndStatementExport(JSON.stringify(bad))).toThrow(/symbol/);
    });
});
