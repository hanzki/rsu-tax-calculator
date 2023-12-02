
import { ECBConverter } from './index';

const TODAY_DATE = '2022-01-03';
const TODAY_EURUSD_RATE = 0.87;

class DateMock extends Date {
    constructor() {
        super(TODAY_DATE);
    }
}

describe('ECBConverter', () => {
    let ecbConverter: ECBConverter;

    beforeEach(() => {
        ecbConverter = new ECBConverter(new Map([
            ['2022-01-01', 0.85],
            ['2022-01-02', 0.86],
            ['2022-01-03', 0.87],
        ]));

        ecbConverter.Date = DateMock as any;
    });

    describe('usdToEUR', () => {
        it('should convert USD to EUR using the rate for the provided date', () => {
            const usdValue = 100;
            const date = new Date('2022-01-01');
            const expectedEURValue = 100 / 0.85;

            const eurValue = ecbConverter.usdToEUR(usdValue, date);

            expect(eurValue).toBe(expectedEURValue);
        });

        it('should use the current date if no date is provided', () => {
            const usdValue = 100;
            const expectedEURValue = 100 / TODAY_EURUSD_RATE;

            const eurValue = ecbConverter.usdToEUR(usdValue);

            expect(eurValue).toBe(expectedEURValue);
        });
    });

    describe('usdToEURRate', () => {
        it('should return the EUR to USD rate for the provided date', () => {
            const date = new Date('2022-01-02');
            const expectedRate = 1 / 0.86;

            const rate = ecbConverter.usdToEURRate(date);

            expect(rate).toBe(expectedRate);
        });

        it('should use the current date if no date is provided', () => {
            const expectedRate = 1 / TODAY_EURUSD_RATE;

            const rate = ecbConverter.usdToEURRate();

            expect(rate).toBe(expectedRate);
        });

        it('should return the previous rate if no rate is available for the provided date', () => {
            const date = new Date('2022-01-04');
            const expectedRate = 1 / 0.87;

            const rate = ecbConverter.usdToEURRate(date);

            expect(rate).toBe(expectedRate);
        });

        it('should return the previous rate for date T-3 if the rate is not available for the previous two days', () => {
            const date = new Date('2022-01-06');
            const expectedRate = 1 / 0.87;

            const rate = ecbConverter.usdToEURRate(date);

            expect(rate).toBe(expectedRate);
        });

        it('should throw an error if no rate is available for the provided date and the previous 3 days', () => {
            const date = new Date('2022-01-07');
            
            expect(() => ecbConverter.usdToEURRate(date)).toThrowError('No exchange rate for 2022-01-07');
        });
    });
});
