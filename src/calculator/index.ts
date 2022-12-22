import { isBefore, isEqual } from "date-fns";
import { ECBConverter } from "../ecbRates";
import { sortChronologicalBy, sortReverseChronologicalBy } from "../util";

export interface IndividualTransaction {
    date: Date,
    asOfDate?: Date,
    action: string, // TODO: Change to enum
    symbol: string,
    description: string,
    quantity: number,
    priceUSD?: number,
    feesUSD?: number,
    amountUSD?: number
}

export interface EACTransaction {
    date: Date,
    asOfDate?: Date,
    action: string, // TODO: Change to enum
    symbol: string,
    description: string,
    quantity: number,
    feesUSD?: number,
    amountUSD?: number
    depositDetails?: EACDepositDetails,
    saleDetails?: EACSaleDetails,
    lapseDetails?: EACLapseDetails,
}

export interface EACDepositDetails {
    purchaseDate: Date,
    purchasePriceUSD: number,
    subscriptionDate: Date,
    subscriptionFMVUSD: number,
    purchaseFMVUSD: number,  
}

export interface EACSaleDetails {
    type: string,
    shares: number,
    salePriceUSD: number,
    subscriptionDate: Date,
    subscriptionFMVUSD: number,
    purchaseDate: Date,
    purchasePriceUSD: number,
    purchaseFMVUSD: number,
    grossProceedsUSD: number,
}

export interface EACLapseDetails {
    awardDate: Date,
    awardID: string,
    fmvUSD: number,
    salePriceUSD?: number,
    sharesSold: number,
    sharesDeposited: number,
    totalTaxesUSD: number,
}

export interface TaxSaleOfSecurity {
    symbol: string,
    quantity: number,
    saleDate: Date,
    purchaseDate: Date,
    salePriceEUR: number,
    saleFeesEUR: number,
    purchasePriceEUR: number,
    purchaseFeesEUR: number,
    deemedAcquisitionCostEUR: number, // hankintameno-olettama
    capitalGainEUR: number,
    capitalLossEUR: number
}

/**
 * Filters out all transactions which are not related to moving of stocks
 * 
 * @param individualHistory list of transactions to be filtered
 * @returns a list of transactions with only transactions related to gain or loss of stocks
 */
export function filterStockTransactions(individualHistory: IndividualTransaction[]): IndividualTransaction[] {
    return individualHistory.filter(transaction => transaction.quantity)
}

export type TransactionWithCostBasis = {
    transaction: IndividualTransaction,
    purchaseDate: Date,
    purchasePriceUSD: number,
    quantity: number,
}

export interface Lot {
    symbol: string,
    quantity: number,
    purchaseDate: Date,
    purchasePriceUSD: number,
}

/**
 * Calculates historical lots of shares received. For each lot the function calculates the number of shares
 * received on the date and the purchase price for the shares. Multiple shares received on the same date and
 * purchase price are merged into one lot.
 * 
 * @param stockTransactions list of stock transactions from individual history. See {@link filterStockTransactions}.
 * @param eacHistory full Equity Awards Center history
 * @returns list of Lots
 */
export function buildLots(stockTransactions: IndividualTransaction[], eacHistory: EACTransaction[]): Lot[] {
    const spaTransactions = stockTransactions.filter(t => t.action === 'Stock Plan Activity');
    const lots: Lot[] = [];
    for (const spaTransaction of spaTransactions) {
        const lapseTransaction = findLapseTransaction(spaTransaction, eacHistory);
        if (!lapseTransaction?.lapseDetails) throw new Error('Could not match to lapse');

        lots.push({
            symbol: spaTransaction.symbol,
            quantity: spaTransaction.quantity,
            purchaseDate: lapseTransaction.date,
            purchasePriceUSD: lapseTransaction.lapseDetails.fmvUSD,
        })
    }

    // Merge lots with same date and price
    const mergedLots = lots.reduce((acc: Lot[], lot: Lot) => {
        if (!acc.length) return [lot];
        const prev = acc[acc.length - 1];
        if (isEqual(prev.purchaseDate, lot.purchaseDate) && prev.purchasePriceUSD === lot.purchasePriceUSD) {
            const merged = {...prev, quantity: prev.quantity + lot.quantity};
            return [...acc.slice(0,-1), merged];
        }
        return [...acc, lot];
    }, []);

    return mergedLots;
}

/**
 * Finds the correct Lapse transaction from EAC history which corresponds to the shares gained in
 * spaTransaction.
 * @param spaTransaction transaction for gain of shares in Individual history
 * @param eacHistory full EAC History
 */
function findLapseTransaction(spaTransaction: IndividualTransaction, eacHistory: EACTransaction[]): EACTransaction {
    const sortedLapseTransactions = eacHistory
        .filter(t => t.action === 'Lapse' && t.lapseDetails)
        .sort(sortReverseChronologicalBy(t => t.date));
    
    const isBeforeSPA = (lapseTransaction: EACTransaction) => isBefore(lapseTransaction.date, spaTransaction.date);
    const quantityMatchesSPA = (lapseTransaction: EACTransaction) =>
        spaTransaction.quantity === lapseTransaction?.lapseDetails?.sharesDeposited
        || spaTransaction.quantity === lapseTransaction?.lapseDetails?.sharesSold

    const lapseTransaction = sortedLapseTransactions.find(lt => isBeforeSPA(lt) && quantityMatchesSPA(lt));

    if (!lapseTransaction) throw new Error('Could not match to lapse');
    return lapseTransaction;
}

/**
 * Links share losing transactions to the correct lots in order to calculate the correct purchase price.
 * The shares are sold in the First-In First-Out (FIFO) order. In case one lot is not enough to cover for
 * the whole sale transaction the transaction will be split to two parts in the output.
 * 
 * @param stockTransactions list of stock transactions from individual history. See {@link filterStockTransactions}.
 * @param lots list of lots. See {@link buildLots}
 * @returns list of transactions linked with the correct purchase prices. One transaction from input might get
 * split to multiple transactions in the output.
 */
export function calculateCostBases(stockTransactions: IndividualTransaction[], lots: Lot[]): TransactionWithCostBasis[] {
    const salesTransactions = stockTransactions.filter(t => t.action === 'Sell'); // TODO: support Security Transfers
    const chronologicalTransactions = salesTransactions.sort(sortChronologicalBy(t => t.date));

    const chrologicalLots = [...lots].sort(sortChronologicalBy(t => t.purchaseDate));

    const lotIterator = chrologicalLots.values();
    let currentLot: Lot = lotIterator.next().value;
    let sharesSoldFromCurrentLot = 0;

    const results: TransactionWithCostBasis[] = []

    const throwMissingLotError = () => { throw new Error("Couldn't match sell to a lot"); };

    for (const transaction of chronologicalTransactions) {
        if (!currentLot) throwMissingLotError(); // TODO: Log error?
        if (transaction.quantity <= currentLot.quantity - sharesSoldFromCurrentLot) {
            results.push({
                transaction,
                purchaseDate: currentLot.purchaseDate,
                purchasePriceUSD: currentLot.purchasePriceUSD,
                quantity: transaction.quantity,
            });
            sharesSoldFromCurrentLot += transaction.quantity;
        } else {
            let sharesSoldFromPreviousLot = 0;
            if (currentLot.quantity - sharesSoldFromCurrentLot > 0) {
                results.push({
                    transaction,
                    purchaseDate: currentLot.purchaseDate,
                    purchasePriceUSD: currentLot.purchasePriceUSD,
                    quantity: currentLot.quantity - sharesSoldFromCurrentLot,
                });
                sharesSoldFromPreviousLot = currentLot.quantity - sharesSoldFromCurrentLot;
            }
            currentLot = lotIterator.next().value;
            if(!currentLot) throwMissingLotError();
            sharesSoldFromCurrentLot = 0;
            results.push({
                transaction,
                purchaseDate: currentLot.purchaseDate,
                purchasePriceUSD: currentLot.purchasePriceUSD,
                quantity: transaction.quantity - sharesSoldFromPreviousLot,
            });
            sharesSoldFromCurrentLot = transaction.quantity - sharesSoldFromPreviousLot;
        }
    }

    return results;
}

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
            transactionWithCostBasis.transaction.priceUSD as number,
            saleDate
        );
        const saleFeesEUR = ecbConverter.usdToEUR(
            transactionWithCostBasis.transaction.feesUSD as number,
            saleDate
        ); // TODO: fees getting double counted
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

export function calculateTaxes(
    individualHistory: IndividualTransaction[],
    eacHistory: EACTransaction[],
    ecbConverter: ECBConverter
    ): TaxSaleOfSecurity[] {
        // Filter out non-stock transactions
        const stockTransactions = filterStockTransactions(individualHistory);

        // Build list of lots
        const lots = buildLots(stockTransactions, eacHistory);

        // Calculate correct cost basis
        const transactionsWithCostBasis = calculateCostBases(stockTransactions, lots);

        // Create tax report
        const taxReport = createTaxReport(transactionsWithCostBasis, ecbConverter);

        return taxReport;
    }