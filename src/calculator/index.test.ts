import { expect, describe, beforeEach, it } from 'vitest'
import { EACHistoryData, IndividualHistoryData } from '../test/data';
import * as Calculator from './index';
import { EAC, Individual } from './types';

describe('calculator', () => {
    describe('filterStockTransactions', () => {
        let individualHistory: Individual.Transaction[];
        let result: Individual.Transaction[];

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

    describe('filterOutOptionSales', () => {
        let stockTransactions: Calculator.StockTransaction[];
        let eacHistory: EAC.Transaction[];
        let result: Calculator.StockTransaction[];

        describe('when there are no option transactions', () => {
            beforeEach(() => {
                stockTransactions = [
                    IndividualHistoryData.sellTransaction(),
                    IndividualHistoryData.spaTransaction(),
                ];
    
                eacHistory = [
                    EACHistoryData.lapseTransaction({date: new Date(2021, 9, 25), lapseDetails: {sharesDeposited: 42, fmvUSD: 69}}),
                    EACHistoryData.lapseTransaction({date: new Date(2021, 7, 25), lapseDetails: {sharesDeposited: 42, fmvUSD: 47}}),
                    EACHistoryData.lapseTransaction({date: new Date(2021, 7, 25), lapseDetails: {sharesDeposited: 5, fmvUSD: 47}})
                ]
    
                result = Calculator.filterOutOptionSales(stockTransactions, eacHistory);
            });
    
            it('should not filter any transactions', () => {
                expect(result).toEqual(stockTransactions);
            });
        });

        describe('when there is an exercise & sell transaction', () => {
            let otherTransactions: Calculator.StockTransaction[];
            beforeEach(() => {
                stockTransactions = [
                    IndividualHistoryData.sellTransaction({ date: new Date(2021, 7, 30), quantity: 50, priceUSD: 8.7}),
                    IndividualHistoryData.sellTransaction({ date: new Date(2021, 7, 25), quantity: 250, priceUSD: 9.5, feesUSD: 0.5}),
                    IndividualHistoryData.sellTransaction({ date: new Date(2021, 7, 25), quantity: 250, priceUSD: 9.5, feesUSD: 0.5}),
                    IndividualHistoryData.spaTransaction({ date: new Date(2021, 7, 25), quantity: 250}),
                    IndividualHistoryData.spaTransaction({ date: new Date(2021, 7, 25), quantity: 250}),
                    IndividualHistoryData.spaTransaction({ date: new Date(2021, 7, 17), quantity: 57}),
                ];
                otherTransactions = [stockTransactions[0], stockTransactions[5]];
    
                eacHistory = [
                    EACHistoryData.exerciseAndSellTransaction({
                        date: new Date(2021, 7, 25),
                        quantity: 500,
                        feesUSD: 1,
                        amountUSD: 3499,
                        rows: [
                            {
                                awardID: 'XXXXX',
                                sharesExercised: 250,
                                awardPriceUSD: 2.5,
                                salePriceUSD: 9.5,
                                awardType: 'XX',
                                awardDate: new Date(2015, 9, 1)
                            },
                            {
                                awardID: 'XXXXX',
                                sharesExercised: 250,
                                awardPriceUSD: 2.5,
                                salePriceUSD: 9.5,
                                awardType: 'XX',
                                awardDate: new Date(2015, 9, 1)
                            },
                        ],
                        details: {
                            exerciseCostUSD: 1250,
                            grossProceedsUSD: 4750,
                            netProceedsUSD: 3499,
                        }
                    })
                ]
    
                result = Calculator.filterOutOptionSales(stockTransactions, eacHistory);
            });
    
            it('should only return transactions which are not related to the sale of options', () => {
                expect(result).toEqual(otherTransactions);
            });
        });

        describe('when multiple option sale rows show up as single sale transaction', () => {
            let otherTransactions: Calculator.StockTransaction[];
            beforeEach(() => {
                stockTransactions = [
                    IndividualHistoryData.sellTransaction({ date: new Date(2021, 7, 30), quantity: 50, priceUSD: 8.7}),
                    IndividualHistoryData.sellTransaction({ date: new Date(2021, 7, 25), quantity: 5, priceUSD: 9.51}),
                    IndividualHistoryData.sellTransaction({ date: new Date(2021, 7, 25), quantity: 800, priceUSD: 9.5}),
                    IndividualHistoryData.sellTransaction({ date: new Date(2021, 7, 25), quantity: 100, priceUSD: 9.5}),
                    IndividualHistoryData.spaTransaction({ date: new Date(2021, 7, 25), quantity: 5}),
                    IndividualHistoryData.spaTransaction({ date: new Date(2021, 7, 25), quantity: 800}),
                    IndividualHistoryData.spaTransaction({ date: new Date(2021, 7, 25), quantity: 100}),
                    IndividualHistoryData.spaTransaction({ date: new Date(2021, 7, 17), quantity: 57}),
                ];
                otherTransactions = [stockTransactions[0], stockTransactions[7]];
    
                eacHistory = [
                    EACHistoryData.exerciseAndSellTransaction({
                        date: new Date(2021, 7, 25),
                        quantity: 905,
                        rows: [
                            {
                                awardID: 'XXXXX',
                                sharesExercised: 379,
                                awardPriceUSD: 2.5,
                                salePriceUSD: 9.5,
                                awardType: 'XX',
                                awardDate: new Date(2015, 9, 1)
                            },
                            {
                                awardID: 'XXXXX',
                                sharesExercised: 408,
                                awardPriceUSD: 2.5,
                                salePriceUSD: 9.5,
                                awardType: 'XX',
                                awardDate: new Date(2015, 9, 1)
                            },
                            {
                                awardID: 'XXXXX',
                                sharesExercised: 100,
                                awardPriceUSD: 2.5,
                                salePriceUSD: 9.5,
                                awardType: 'XX',
                                awardDate: new Date(2015, 9, 1)
                            },
                            {
                                awardID: 'XXXXX',
                                sharesExercised: 5,
                                awardPriceUSD: 2.5,
                                salePriceUSD: 9.51,
                                awardType: 'XX',
                                awardDate: new Date(2015, 9, 1)
                            },
                            {
                                awardID: 'XXXXX',
                                sharesExercised: 13,
                                awardPriceUSD: 2.5,
                                salePriceUSD: 9.5,
                                awardType: 'XX',
                                awardDate: new Date(2015, 9, 1)
                            },
                        ],
                    })
                ]
    
                result = Calculator.filterOutOptionSales(stockTransactions, eacHistory);
            });
    
            it('should only return transactions which are not related to the sale of options', () => {
                expect(result).toEqual(otherTransactions);
            });
        });
    });

    describe('buildLots', () => {
        let stockTransactions: Calculator.StockTransaction[];
        let eacHistory: EAC.Transaction[];
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
            let stockTransactions: Calculator.StockTransaction[];
            let lots: Calculator.Lot[];
            let result: Calculator.TransactionWithCostBasis[];
            let spaTransaction: Individual.Transaction;
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
            let stockTransactions: Calculator.StockTransaction[];
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
            let stockTransactions: Calculator.StockTransaction[];
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

        describe('when the lots cover all transactions exactly', () => {
            let stockTransactions: Calculator.StockTransaction[];
            let lots: Calculator.Lot[];
            let result: Calculator.TransactionWithCostBasis[];
            beforeEach(() => {
                stockTransactions = [
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 9, 30), quantity: 80, priceUSD: 56}),
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 8, 25), quantity: 20, priceUSD: 80}),
                ];

                lots = [
                    { symbol: 'U', quantity: 100, purchaseDate: new Date(2021, 7, 30), purchasePriceUSD: 69 }
                ]

                result = Calculator.calculateCostBases(stockTransactions, lots);
            });

            it('calculates cost bases correctly', () => {
                expect(result).toEqual([
                    {
                        transaction: stockTransactions[1],
                        purchaseDate: lots[0].purchaseDate,
                        purchasePriceUSD: lots[0].purchasePriceUSD,
                        quantity: stockTransactions[1].quantity
                    },
                    {
                        transaction: stockTransactions[0],
                        purchaseDate: lots[0].purchaseDate,
                        purchasePriceUSD: lots[0].purchasePriceUSD,
                        quantity: stockTransactions[0].quantity
                    },
                ])
            })
        })

        describe('when some shares were transferred from the account without selling', () => {
            let stockTransactions: Calculator.StockTransaction[];
            let lots: Calculator.Lot[];
            let result: Calculator.TransactionWithCostBasis[];
            beforeEach(() => {
                stockTransactions = [
                    IndividualHistoryData.sellTransaction({date: new Date(2021, 9, 30), quantity: 80, priceUSD: 56}),
                    IndividualHistoryData.securityTransferTransaction({date: new Date(2021, 8, 25), quantity: -50}),
                ];

                lots = [
                    { symbol: 'U', quantity: 100, purchaseDate: new Date(2021, 8, 20), purchasePriceUSD: 42 },
                    { symbol: 'U', quantity: 50, purchaseDate: new Date(2021, 7, 30), purchasePriceUSD: 69 }
                ]

                result = Calculator.calculateCostBases(stockTransactions, lots);
            });

            it('transferred shares are skipped when calculating cost basis for sales', () => {
                expect(result).toHaveLength(1);
                expect(result[0]).toMatchObject({
                    transaction: stockTransactions[0],
                    purchaseDate: lots[0].purchaseDate,
                    purchasePriceUSD: lots[0].purchasePriceUSD,
                    quantity: stockTransactions[0].quantity
                })
            });
        });
    });
})