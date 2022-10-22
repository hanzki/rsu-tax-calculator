import { EACHistoryData, IndividualHistoryData } from '../test/data';
import { YMD } from '../util';
import * as Calculator from './index';

describe('calculator', () => {
    describe('filterStockTransactions', () => {
        let individualHistory: Calculator.IndividualTransaction[];
        let result: Calculator.IndividualTransaction[];

        beforeEach(() => {
            individualHistory = [
                IndividualHistoryData.sellTransaction(),
                IndividualHistoryData.spaTransaction(),
                IndividualHistoryData.journalTransaction(),
            ];

            result = Calculator.filterStockTransactions(individualHistory);
        });

        it('should return only stock transactions', () => {
            expect(result).toEqual(individualHistory.slice(0, 2));
        });
    });

    describe('findTaxTransactions', () => {
        let stockTransactions: Calculator.IndividualTransaction[];
        let eacHistory: Calculator.EACTransaction[];
        let result: Calculator.TransactionWithCostBasis[];

        beforeEach(() => {
            stockTransactions = [
                IndividualHistoryData.sellTransaction({date: new YMD(2021, 8, 31), quantity: 25, priceUSD: 47}),
                IndividualHistoryData.spaTransaction({date: new YMD(2021, 8, 30), quantity: 36}),
                IndividualHistoryData.sellTransaction({date: new YMD(2021, 8, 26), quantity: 4, priceUSD: 50}),
                IndividualHistoryData.spaTransaction({date: new YMD(2021, 8, 26), quantity: 4}),
            ];

            eacHistory = [
                EACHistoryData.lapseTransaction({date: new YMD(2021, 8, 25), lapseDetails: {sharesSold: 4, salePriceUSD: 50, fmvUSD: 47}})
            ]

            result = Calculator.findTaxTransactions(stockTransactions, eacHistory);
        });

        it('links tax transactions correctly', () => {
            expect(result).toEqual([
                {
                    transaction: stockTransactions[2],
                    purchaseDate: eacHistory[0].date,
                    purchasePriceUSD: eacHistory[0].lapseDetails?.fmvUSD
                },
                {
                    transaction: stockTransactions[3],
                    purchaseDate: eacHistory[0].date,
                    purchasePriceUSD: eacHistory[0].lapseDetails?.fmvUSD
                },
            ]);
        });
    });

    describe('buildLots', () => {
        let stockTransactions: Calculator.IndividualTransaction[];
        let eacHistory: Calculator.EACTransaction[];
        let result: Calculator.Lot[];
        beforeEach(() => {
            stockTransactions = [
                IndividualHistoryData.spaTransaction({date: new YMD(2021, 10, 30), asOfDate: new YMD(2021, 10, 27), quantity: 42}),
                IndividualHistoryData.spaTransaction({date: new YMD(2021, 8, 30), asOfDate: new YMD(2021, 8, 27), quantity: 42}),
                IndividualHistoryData.spaTransaction({date: new YMD(2021, 8, 30), asOfDate: new YMD(2021, 8, 27), quantity: 5})
            ];

            eacHistory = [
                EACHistoryData.lapseTransaction({date: new YMD(2021, 10, 25), lapseDetails: {sharesDeposited: 42, fmvUSD: 69}}),
                EACHistoryData.lapseTransaction({date: new YMD(2021, 8, 25), lapseDetails: {sharesDeposited: 42, fmvUSD: 47}}),
                EACHistoryData.lapseTransaction({date: new YMD(2021, 8, 25), lapseDetails: {sharesDeposited: 5, fmvUSD: 47}})
            ]
            
            result = Calculator.buildLots(stockTransactions, eacHistory);
        });

        it('calculates lots correctly', () => {
            expect(result.length).toEqual(2);
            expect(result[0]).toMatchObject({
                symbol: 'U',
                quantity: 42,
                purchaseDate: {year: 2021, month: 10, day: 25},
                purchasePriceUSD: 69,
            });
            expect(result[1]).toMatchObject({
                symbol: 'U',
                quantity: 47,
                purchaseDate: {year: 2021, month: 8, day: 25},
                purchasePriceUSD: 47,
            })
        });
    });
})