import { resourceUsage } from 'process';
import { EACHistoryData, IndividualHistoryData } from '../test/data';
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
                IndividualHistoryData.sellTransaction({date: new Date(2021, 7, 31), quantity: 25, priceUSD: 47}),
                IndividualHistoryData.spaTransaction({date: new Date(2021, 7, 30), quantity: 36}),
                IndividualHistoryData.sellTransaction({date: new Date(2021, 7, 26), quantity: 4, priceUSD: 50}),
                IndividualHistoryData.spaTransaction({date: new Date(2021, 7, 26), quantity: 4}),
            ];

            eacHistory = [
                EACHistoryData.lapseTransaction({date: new Date(2021, 7, 25), lapseDetails: {sharesSold: 4, salePriceUSD: 50, fmvUSD: 47}})
            ]

            result = Calculator.findTaxTransactions(stockTransactions, eacHistory);
        });

        it('links tax transactions correctly', () => {
            expect(result).toEqual([
                {
                    transaction: stockTransactions[2],
                    purchaseDate: eacHistory[0].date,
                    purchasePriceUSD: eacHistory[0].lapseDetails?.fmvUSD,
                    quantity: eacHistory[0].lapseDetails?.sharesSold
                },
                {
                    transaction: stockTransactions[3],
                    purchaseDate: eacHistory[0].date,
                    purchasePriceUSD: eacHistory[0].lapseDetails?.fmvUSD,
                    quantity: eacHistory[0].lapseDetails?.sharesSold
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
                IndividualHistoryData.spaTransaction({date: new Date(2021, 9, 30), asOfDate: new Date(2021, 9, 27), quantity: 42}),
                IndividualHistoryData.spaTransaction({date: new Date(2021, 7, 30), asOfDate: new Date(2021, 7, 27), quantity: 42}),
                IndividualHistoryData.spaTransaction({date: new Date(2021, 7, 30), asOfDate: new Date(2021, 7, 27), quantity: 5})
            ];

            eacHistory = [
                EACHistoryData.lapseTransaction({date: new Date(2021, 9, 25), lapseDetails: {sharesDeposited: 42, fmvUSD: 69}}),
                EACHistoryData.lapseTransaction({date: new Date(2021, 7, 25), lapseDetails: {sharesDeposited: 42, fmvUSD: 47}}),
                EACHistoryData.lapseTransaction({date: new Date(2021, 7, 25), lapseDetails: {sharesDeposited: 5, fmvUSD: 47}})
            ]
            
            result = Calculator.buildLots(stockTransactions, eacHistory);
        });

        it('calculates lots correctly', () => {
            expect(result.length).toEqual(2);
            expect(result[0]).toMatchObject({
                symbol: 'U',
                quantity: 42,
                purchaseDate: new Date(2021, 9, 25),
                purchasePriceUSD: 69,
            });
            expect(result[1]).toMatchObject({
                symbol: 'U',
                quantity: 47,
                purchaseDate: new Date(2021, 7, 25),
                purchasePriceUSD: 47,
            })
        });
    });

    describe('calculateCostBases', () => {
        describe('when there is only single lot', () =>{
            let stockTransactions: Calculator.IndividualTransaction[];
            let lots: Calculator.Lot[];
            let result: Calculator.TransactionWithCostBasis[];
            let spaTransaction: Calculator.IndividualTransaction;
            beforeEach(() => {
                spaTransaction = IndividualHistoryData.spaTransaction({date: new Date(2021, 8, 2), quantity: 100});
                stockTransactions = [
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 9, 30), quantity: 42, priceUSD: 56}),
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 8, 25), quantity: 42, priceUSD: 80}),
                    spaTransaction
                ];

                lots = [
                    { symbol: 'U', quantity: 100, purchaseDate: new Date(2021, 7, 30), purchasePriceUSD: 69 }
                ]
                
                result = Calculator.calculateCostBases(stockTransactions, lots);
            });

            it('does not generate output for SPA transactions', () => {
                expect(result.map(t => t.transaction)).not.toContain(spaTransaction);
            });

            it('can connect multiple sales to same lot', () => {
                expect(result).toHaveLength(2);
                expect(result[0].purchaseDate).toEqual(result[1].purchaseDate);
            });
        });

        describe('when there are multiple lots', () => {
            let stockTransactions: Calculator.IndividualTransaction[];
            let lots: Calculator.Lot[];
            let result: Calculator.TransactionWithCostBasis[];
            beforeEach(() => {
                stockTransactions = [
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 9, 30), quantity: 42, priceUSD: 56}),
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 9, 28), quantity: 80, priceUSD: 68}),
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 8, 25), quantity: 42, priceUSD: 80}),
                ];

                lots = [
                    { symbol: 'U', quantity: 100, purchaseDate: new Date(2021, 9, 25), purchasePriceUSD: 42 },
                    { symbol: 'U', quantity: 100, purchaseDate: new Date(2021, 7, 30), purchasePriceUSD: 69 }
                ]
                
                result = Calculator.calculateCostBases(stockTransactions, lots);
            });

            it('can connect different transactions to different lots', () => {
                expect(result[0].purchaseDate).not.toEqual(result[3].purchaseDate);
            });

            it('can connect the same transactions to different lots when selling from multiple lots', () => {
                expect(result[1].purchaseDate).toEqual(lots[1].purchaseDate);
                expect(result[2].purchaseDate).toEqual(lots[0].purchaseDate);
                expect(result[1].transaction).toEqual(result[2].transaction);
            });

            it('but the number of shares sold in output is equal to the input sell transactions', () => {
                expect(result.reduce((sum, t) => sum + t.quantity, 0)).toEqual(stockTransactions.reduce((sum, t) => sum + t.quantity, 0));
            });
        });

        describe('when the lots cannot cover all transactions', () =>{
            let stockTransactions: Calculator.IndividualTransaction[];
            let lots: Calculator.Lot[];
            beforeEach(() => {
                stockTransactions = [
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 9, 30), quantity: 80, priceUSD: 56}),
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 8, 25), quantity: 42, priceUSD: 80}),
                ];

                lots = [
                    { symbol: 'U', quantity: 100, purchaseDate: new Date(2021, 7, 30), purchasePriceUSD: 69 }
                ]
            });

            it('throws an error', () => {
                expect(() => Calculator.calculateCostBases(stockTransactions, lots)).toThrow(Error("Couldn't match sell to a lot"));
            });
        });
    });

    describe('createTaxReport', () => {
        let transactionsWithCostBasis: Calculator.TransactionWithCostBasis[];
        let gainTransaction: Calculator.TransactionWithCostBasis;
        let lossTransaction: Calculator.TransactionWithCostBasis;
        let result: Calculator.TaxSaleOfSecurity[];
        beforeEach(() => {
            gainTransaction = {
                quantity: 42,
                purchaseDate: new Date(2021, 9, 25),
                purchasePriceUSD: 40,
                transaction: IndividualHistoryData.sellTransaction({date: new Date(2021, 9, 30), quantity: 80, priceUSD: 56, feesUSD: 0.5})
            };
            lossTransaction = {
                quantity: 42,
                purchaseDate: new Date(2021, 9, 25),
                purchasePriceUSD: 40,
                transaction: IndividualHistoryData.sellTransaction({date: new Date(2021, 10, 30), quantity: 80, priceUSD: 35, feesUSD: 0.5})    
            };
            transactionsWithCostBasis = [
                gainTransaction,
                lossTransaction
            ]
            
            result = Calculator.createTaxReport(transactionsWithCostBasis);
        });

        it('calculates capital gain correctly', () => {
            expect(result[0]).toEqual({
                symbol: gainTransaction.transaction.symbol,
                quantity: gainTransaction.quantity,
                saleDate: gainTransaction.transaction.date,
                purchaseDate: gainTransaction.purchaseDate,
                salePriceEUR: gainTransaction.transaction.priceUSD,
                saleFeesEUR: gainTransaction.transaction.feesUSD,
                purchasePriceEUR: gainTransaction.purchasePriceUSD,
                purchaseFeesEUR: 0,
                deemedAcquisitionCostEUR: 0,
                capitalGainEUR: 671.5,
                capitalLossEUR: 0
            })
        });

        it('calculates capital loss correctly', () => {
            expect(result[1]).toEqual({
                symbol: lossTransaction.transaction.symbol,
                quantity: lossTransaction.quantity,
                saleDate: lossTransaction.transaction.date,
                purchaseDate: lossTransaction.purchaseDate,
                salePriceEUR: lossTransaction.transaction.priceUSD,
                saleFeesEUR: lossTransaction.transaction.feesUSD,
                purchasePriceEUR: lossTransaction.purchasePriceUSD,
                purchaseFeesEUR: 0,
                deemedAcquisitionCostEUR: 0,
                capitalGainEUR: 0,
                capitalLossEUR: 210.5
            })
        });
    });
})