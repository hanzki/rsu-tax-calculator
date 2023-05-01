import { Lot, TaxSaleOfSecurity } from ".";
import { ECBConverter } from "../ecbRates";
import { sortChronologicalBy } from "../util";
import { EAC } from "./types";
import { matchLots } from "./util";

export type ESPPTransaction = EAC.DepositTransaction | EAC.SaleTransaction;

const isSaleTransaction = (t: EAC.Transaction): t is EAC.SaleTransaction => t.action === EAC.Action.Sale;
const isDepositTransaction = (t: EAC.Transaction): t is EAC.DepositTransaction => t.action === EAC.Action.Deposit;
const isESPPTransaction = (t: EAC.Transaction): t is ESPPTransaction => isSaleTransaction(t) || isDepositTransaction(t);


/**
 * Filters out all transactions which are not related to ESPP shares
 * 
 * @param eacHistory list of transactions to be filtered
 * @returns a list of transactions with only transactions related to gain and sale of ESPP shares
 */
export function filterESPPTransactions(eacHistory: EAC.Transaction[]): ESPPTransaction[] {
    return eacHistory.filter(isESPPTransaction);
}

/**
 * Builds purchase lots from the ESPP deposit events. The FMV at purchase time is used instead of 
 * the actual purchase price in order to calculate the capital gains/losses correctly. The difference
 * between the actual purchase price and the purchase FMV is taxed separately as earned income.
 * 
 * @param esppTransactions list of espp transactions
 * @returns a list of lots
 */
export function buildLots(esppTransactions: ESPPTransaction[]): Lot[] {
    const sortedDepositTransactions = esppTransactions
        .filter(isDepositTransaction)
        .sort(sortChronologicalBy(t => t.depositDetails.purchaseDate));

    return sortedDepositTransactions.map(t => ({
        symbol: t.symbol,
        quantity: t.quantity,
        purchaseDate: t.depositDetails.purchaseDate,
        purchasePriceUSD: t.depositDetails.purchaseFMVUSD,
    }));
}

export type ESPPTransactionWithCostBasis = {
    transaction: EAC.SaleTransaction,
    purchaseDate: Date,
    purchasePriceUSD: number,
    quantity: number,
}

export function calculateCostBases(esppTransactions: ESPPTransaction[], lots: Lot[]): ESPPTransactionWithCostBasis[] {
    const salesTransactions = esppTransactions.filter(isSaleTransaction);
    const lotMatches = matchLots(lots, salesTransactions);
    return lotMatches.map(m => ({
        transaction: m.forfeitureEvent,
        purchaseDate: m.lot.purchaseDate,
        purchasePriceUSD: m.lot.purchasePriceUSD,
        quantity: m.quantity
    }));
}


export function calculateTaxes(
    eacHistory: EAC.Transaction[],
    ecbConverter: ECBConverter
): TaxSaleOfSecurity[] {
    const esppTransactions = filterESPPTransactions(eacHistory);

    const lots = buildLots(esppTransactions);

    const transactionsWithCostBasis = calculateCostBases(esppTransactions, lots);

    console.log("ESPP transactions", transactionsWithCostBasis);

    return [];
}