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
        const salePriceEUR = ecbConverter.usdToEUR(
            transactionWithCostBasis.transaction.priceUSD,
            saleDate
        );
        const saleFeesEUR = transactionWithCostBasis.transaction.feesUSD ?
            ecbConverter.usdToEUR(transactionWithCostBasis.transaction.feesUSD, saleDate)
            :
            0; // TODO: fees getting double counted
        const purchasePriceEUR = ecbConverter.usdToEUR(
            transactionWithCostBasis.purchasePriceUSD,
            purchaseDate
        );
        const purchaseFeesEUR = 0;

        const gainloss = (salePriceEUR * quantity) - (purchasePriceEUR * quantity) - saleFeesEUR - purchaseFeesEUR;
        return {
            symbol: transactionWithCostBasis.transaction.symbol,
            quantity,
            saleDate,
            purchaseDate,
            salePriceEUR,
            saleFeesEUR,
            purchasePriceEUR,
            purchaseFeesEUR,
            deemedAcquisitionCostEUR: 0, // TODO: add support for hankintameno-olettama
            capitalGainEUR: (gainloss > 0) ? gainloss : 0,
            capitalLossEUR: (gainloss < 0) ? -gainloss : 0
        }
    });
}

export function createESPPTaxReport(transactionsWithCostBasis: ESPPTransactionWithCostBasis[], ecbConverter: ECBConverter): TaxSaleOfSecurity[] {
    const chronologicalTransactions = transactionsWithCostBasis.sort(sortChronologicalBy(t => t.transaction.date));

    return chronologicalTransactions.map(transactionWithCostBasis => {
        const quantity = transactionWithCostBasis.quantity;
        const saleDate = transactionWithCostBasis.transaction.date;
        const purchaseDate = transactionWithCostBasis.purchaseDate;
        const salePriceEUR = ecbConverter.usdToEUR(
            transactionWithCostBasis.transaction.rows[0].salePriceUSD, // TODO: Is it correct to always take the first row?
            saleDate
        );
        const saleFeesEUR = transactionWithCostBasis.transaction.feesUSD ?
            ecbConverter.usdToEUR(transactionWithCostBasis.transaction.feesUSD, saleDate)
            :
            0; // TODO: fees getting double counted
        const purchasePriceEUR = ecbConverter.usdToEUR(
            transactionWithCostBasis.purchasePriceUSD,
            purchaseDate
        );
        const purchaseFeesEUR = 0;

        const gainloss = (salePriceEUR * quantity) - (purchasePriceEUR * quantity) - saleFeesEUR - purchaseFeesEUR;
        return {
            symbol: transactionWithCostBasis.transaction.symbol,
            quantity,
            saleDate,
            purchaseDate,
            salePriceEUR,
            saleFeesEUR,
            purchasePriceEUR,
            purchaseFeesEUR,
            deemedAcquisitionCostEUR: 0, // TODO: add support for hankintameno-olettama
            capitalGainEUR: (gainloss > 0) ? gainloss : 0,
            capitalLossEUR: (gainloss < 0) ? -gainloss : 0
        }
    });
}