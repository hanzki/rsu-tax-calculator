import { IndividualHistoryData } from '../test/data';
import * as Calculator from './index';
import { createTaxReport } from './report';
import { ECBConverter } from "../ecbRates";

describe('reports', () => {
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
            const ecbConverterMock = {
                usdToEUR: (usdValue: number) => usdValue
            } as ECBConverter
            
            result = createTaxReport(transactionsWithCostBasis, ecbConverterMock);
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
});