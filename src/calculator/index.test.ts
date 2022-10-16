import { YMD } from '../util';
import * as Calculator from './index';

describe('calculator', () => {
    describe('buildLots', () => {
        describe('when there are no tranasctions', () => {
            const individualHistory: Calculator.IndividualTransaction[] = [];
            const eacHistory: Calculator.EACTransaction[] = [];

            const lots = Calculator.buildLots(individualHistory, eacHistory);

            it('returns no lots', () => {
                expect(lots).toEqual([]);
            });
        });

        describe('when there is single lot', () => {
            const individualHistory: Calculator.IndividualTransaction[] = [
                {
                    date: new YMD(2021, 8, 26),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 50,
                }
            ];
            const eacHistory: Calculator.EACTransaction[] = [
                {
                    date: new YMD(2021, 8, 25),
                    action: 'Lapse',
                    symbol: 'U',
                    description: 'Restricted Stock Lapse',
                    quantity: 500,
                    lapseDetails: {
                        awardDate:  new YMD(2020, 7, 20),
                        awardID: 'XXXXX',
                        fmvUSD: 40.2,
                        salePriceUSD: 36.5,
                        sharesSold: 50,
                        sharesDeposited: 450,
                        totalTaxesUSD: 1820,
                    },
                }
            ];

            const lots = Calculator.buildLots(individualHistory, eacHistory);

            it('returns one lot', () => {
                expect(lots).toHaveLength(1);
            });

            it('calculates the lot correctly', () => {
                expect(lots[0]).toMatchObject({
                    symbol: 'U',
                    quantity: 50,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });
        });

        describe('when there two lots for same RSU lapse', () => {
            const individualHistory: Calculator.IndividualTransaction[] = [
                {
                    date: new YMD(2021, 8, 30),
                    asOfDate: new YMD(2021, 8, 27),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 450,
                },
                {
                    date: new YMD(2021, 8, 26),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 50,
                }
            ];
            const eacHistory: Calculator.EACTransaction[] = [
                {
                    date: new YMD(2021, 8, 25),
                    action: 'Lapse',
                    symbol: 'U',
                    description: 'Restricted Stock Lapse',
                    quantity: 500,
                    lapseDetails: {
                        awardDate:  new YMD(2020, 7, 20),
                        awardID: 'XXXXX',
                        fmvUSD: 40.2,
                        salePriceUSD: 36.5,
                        sharesSold: 50,
                        sharesDeposited: 450,
                        totalTaxesUSD: 1820,
                    },
                }
            ];

            const lots = Calculator.buildLots(individualHistory, eacHistory);

            it('returns one lot', () => {
                expect(lots).toHaveLength(2);
            });

            it('calculates the first lot correctly', () => {
                expect(lots[0]).toMatchObject({
                    symbol: 'U',
                    quantity: 450,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });

            it('calculates the second lot correctly', () => {
                expect(lots[1]).toMatchObject({
                    symbol: 'U',
                    quantity: 50,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });
        });

        describe('when there lots from multiple RSU lapses at same time', () => {
            const individualHistory: Calculator.IndividualTransaction[] = [
                {
                    date: new YMD(2021, 8, 30),
                    asOfDate: new YMD(2021, 8, 27),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 450,
                },
                {
                    date: new YMD(2021, 8, 30),
                    asOfDate: new YMD(2021, 8, 27),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 36,
                },
                {
                    date: new YMD(2021, 8, 26),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 4,
                },

                {
                    date: new YMD(2021, 8, 26),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 50,
                }
            ];
            const eacHistory: Calculator.EACTransaction[] = [
                {
                    date: new YMD(2021, 8, 25),
                    action: 'Lapse',
                    symbol: 'U',
                    description: 'Restricted Stock Lapse',
                    quantity: 500,
                    lapseDetails: {
                        awardDate:  new YMD(2020, 7, 20),
                        awardID: 'XXXXX',
                        fmvUSD: 40.2,
                        salePriceUSD: 36.5,
                        sharesSold: 50,
                        sharesDeposited: 450,
                        totalTaxesUSD: 1820,
                    },
                },
                {
                    date: new YMD(2021, 8, 25),
                    action: 'Lapse',
                    symbol: 'U',
                    description: 'Restricted Stock Lapse',
                    quantity: 40,
                    lapseDetails: {
                        awardDate:  new YMD(2020, 7, 20),
                        awardID: 'XXXXX',
                        fmvUSD: 40.2,
                        salePriceUSD: 36.5,
                        sharesSold: 4,
                        sharesDeposited: 36,
                        totalTaxesUSD: 140,
                    },
                }
            ];

            const lots = Calculator.buildLots(individualHistory, eacHistory);

            it('returns one lot', () => {
                expect(lots).toHaveLength(4);
            });

            it('calculates the first lot correctly', () => {
                expect(lots[0]).toMatchObject({
                    symbol: 'U',
                    quantity: 450,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });

            it('calculates the second lot correctly', () => {
                expect(lots[1]).toMatchObject({
                    symbol: 'U',
                    quantity: 36,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });

            it('calculates the third lot correctly', () => {
                expect(lots[2]).toMatchObject({
                    symbol: 'U',
                    quantity: 4,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });

            it('calculates the fourth lot correctly', () => {
                expect(lots[3]).toMatchObject({
                    symbol: 'U',
                    quantity: 50,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });
        });

        describe('when there lots from multiple RSU lapses at different times', () => {
            const individualHistory: Calculator.IndividualTransaction[] = [
                {
                    date: new YMD(2021, 12, 1),
                    asOfDate: new YMD(2021, 11, 30),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 131,
                },
                {
                    date: new YMD(2021, 8, 30),
                    asOfDate: new YMD(2021, 8, 27),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 450,
                },
                {
                    date: new YMD(2021, 8, 26),
                    action: 'Stock Plan Activity',
                    symbol: 'U',
                    description: 'UNITY SOFTWARE INC',
                    quantity: 50,
                }
            ];
            const eacHistory: Calculator.EACTransaction[] = [
                {
                    date: new YMD(2021, 11, 26),
                    action: 'Lapse',
                    symbol: 'U',
                    description: 'Restricted Stock Lapse',
                    quantity: 131,
                    lapseDetails: {
                        awardDate:  new YMD(2020, 7, 20),
                        awardID: 'XXXXX',
                        fmvUSD: 60.9,
                        sharesSold: 0,
                        sharesDeposited: 131,
                        totalTaxesUSD: 0,
                    },
                },
                {
                    date: new YMD(2021, 8, 25),
                    action: 'Lapse',
                    symbol: 'U',
                    description: 'Restricted Stock Lapse',
                    quantity: 500,
                    lapseDetails: {
                        awardDate:  new YMD(2020, 7, 20),
                        awardID: 'XXXXX',
                        fmvUSD: 40.2,
                        salePriceUSD: 36.5,
                        sharesSold: 50,
                        sharesDeposited: 450,
                        totalTaxesUSD: 1820,
                    },
                },
 
            ];

            const lots = Calculator.buildLots(individualHistory, eacHistory);

            it('returns one lot', () => {
                expect(lots).toHaveLength(3);
            });

            it('calculates the first lot correctly', () => {
                expect(lots[0]).toMatchObject({
                    symbol: 'U',
                    quantity: 131,
                    purchaseDate: {year: 2021, month: 11, day: 26},
                    purchasePriceUSD: 60.9,
                });
            });
            it('calculates the second lot correctly', () => {
                expect(lots[1]).toMatchObject({
                    symbol: 'U',
                    quantity: 450,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });
            it('calculates the third lot correctly', () => {
                expect(lots[2]).toMatchObject({
                    symbol: 'U',
                    quantity: 50,
                    purchaseDate: {year: 2021, month: 8, day: 25},
                    purchasePriceUSD: 40.2,
                });
            });
        });
    });
})