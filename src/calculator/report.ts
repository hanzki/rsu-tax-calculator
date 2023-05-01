import { ESPPTransactionWithCostBasis, TaxSaleOfSecurity, TransactionWithCostBasis } from ".";
import { ECBConverter } from "../ecbRates";
import { sortChronologicalBy } from "../util";

/**
 * Builds tax report from the transactions.
 * @param transactionsWithCostBasis list of transactions with correct purchase prices. See {@link calculateCostBases}.
 * @param ecbConverter currency converter
 * @returns list of sale of security tax report rows
 */
export function createTaxReport(transactionsWithCostBasis: TransactionWithCostBasis[], ecbConverter: ECBConverter): TaxSaleOfSecurity[] {
    const chronologicalTransactions = transactionsWithCostBasis.sort(sortChronologicalBy(t => t.transaction.date));

    return chronologicalTransactions.map(transactionWithCostBasis => {
        const quantity = transactionWithCostBasis.quantity;
        const saleDate = transactionWithCostBasis.transaction.date;
        const purchaseDate = transactionWithCostBasis.purchaseDate;
        const saleUSDEURRate = ecbConverter.usdToEURRate(saleDate);
        const purchaseUSDEURRate = ecbConverter.usdToEURRate(purchaseDate);
        const salePriceUSD = transactionWithCostBasis.transaction.priceUSD;
        const salePriceEUR = ecbConverter.usdToEUR(
            salePriceUSD,
            saleDate
        );
        const saleFeesUSD = transactionWithCostBasis.transaction.feesUSD || 0;
        const saleFeesEUR = transactionWithCostBasis.transaction.feesUSD ?
            ecbConverter.usdToEUR(saleFeesUSD, saleDate)
            :
            0; // TODO: fees getting double counted
        const purchasePriceUSD = transactionWithCostBasis.purchasePriceUSD;
        const purchasePriceEUR = ecbConverter.usdToEUR(
            purchasePriceUSD,
            purchaseDate
        );
        const purchaseFeesUSD = 0;
        const purchaseFeesEUR = 0;

        const gainloss = (salePriceEUR * quantity) - (purchasePriceEUR * quantity) - saleFeesEUR - purchaseFeesEUR;
        return {
            symbol: transactionWithCostBasis.transaction.symbol,
            quantity,
            saleDate,
            purchaseDate,
            salePriceUSD,
            salePriceEUR,
            saleFeesUSD,
            saleFeesEUR,
            saleUSDEURRate,
            purchasePriceUSD,
            purchasePriceEUR,
            purchaseFeesUSD,
            purchaseFeesEUR,
            purchaseUSDEURRate,
            deemedAcquisitionCostEUR: 0, // TODO: add support for hankintameno-olettama
            capitalGainEUR: (gainloss > 0) ? gainloss : 0,
            capitalLossEUR: (gainloss < 0) ? -gainloss : 0,
            isESPP: false
        }
    });
}

export function createESPPTaxReport(transactionsWithCostBasis: ESPPTransactionWithCostBasis[], ecbConverter: ECBConverter): TaxSaleOfSecurity[] {
    const chronologicalTransactions = transactionsWithCostBasis.sort(sortChronologicalBy(t => t.transaction.date));

    return chronologicalTransactions.map(transactionWithCostBasis => {
        const quantity = transactionWithCostBasis.quantity;
        const saleDate = transactionWithCostBasis.transaction.date;
        const purchaseDate = transactionWithCostBasis.purchaseDate;
        const saleUSDEURRate = ecbConverter.usdToEURRate(saleDate);
        const purchaseUSDEURRate = ecbConverter.usdToEURRate(purchaseDate);
        const salePriceUSD = transactionWithCostBasis.transaction.rows[0].salePriceUSD; // TODO: Is it correct to always take the first row?
        const salePriceEUR = ecbConverter.usdToEUR(
            salePriceUSD,
            saleDate
        );
        const saleFeesUSD = transactionWithCostBasis.transaction.feesUSD || 0;
        const saleFeesEUR = transactionWithCostBasis.transaction.feesUSD ?
            ecbConverter.usdToEUR(saleFeesUSD, saleDate)
            :
            0; // TODO: fees getting double counted
        const purchasePriceUSD = transactionWithCostBasis.purchasePriceUSD;
        const purchasePriceEUR = ecbConverter.usdToEUR(
            purchasePriceUSD,
            purchaseDate
        );
        const purchaseFeesUSD = 0;
        const purchaseFeesEUR = 0;

        const gainloss = (salePriceEUR * quantity) - (purchasePriceEUR * quantity) - saleFeesEUR - purchaseFeesEUR;
        return {
            symbol: transactionWithCostBasis.transaction.symbol,
            quantity,
            saleDate,
            purchaseDate,
            salePriceUSD,
            salePriceEUR,
            saleFeesUSD,
            saleFeesEUR,
            saleUSDEURRate,
            purchasePriceUSD,
            purchasePriceEUR,
            purchaseFeesUSD,
            purchaseFeesEUR,
            purchaseUSDEURRate,
            deemedAcquisitionCostEUR: 0, // TODO: add support for hankintameno-olettama
            capitalGainEUR: (gainloss > 0) ? gainloss : 0,
            capitalLossEUR: (gainloss < 0) ? -gainloss : 0,
            isESPP: true
        }
    });
}