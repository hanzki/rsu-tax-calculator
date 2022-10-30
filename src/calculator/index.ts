import { compareAsc, isBefore, isEqual } from "date-fns";
import { sortChronologicalBy } from "../util";

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

export function filterStockTransactions(individualHistory: IndividualTransaction[]): IndividualTransaction[] {
    return individualHistory.filter(transaction => transaction.quantity)
}

export type TransactionWithCostBasis = {
    transaction: IndividualTransaction,
    purchaseDate: Date,
    purchasePriceUSD: number,
    quantity: number,
}

export function findTaxTransactions(
    stockTransactions: IndividualTransaction[],
    eacHistory: EACTransaction[]
): TransactionWithCostBasis[] {
    const taxTransactions: TransactionWithCostBasis[] = [];
    const lapseTransactionsWithSharesSold = eacHistory.filter(transaction => {
        return transaction.action === 'Lapse' && transaction.lapseDetails?.sharesSold
    })
    for (const lapseTransaction of lapseTransactionsWithSharesSold) {
        const sellTransaction = stockTransactions.find(stockTransaction => {
            return stockTransaction.action === 'Sell'
            && stockTransaction.quantity === lapseTransaction.lapseDetails?.sharesSold
            && stockTransaction.priceUSD?.toFixed(2) === lapseTransaction.lapseDetails.salePriceUSD?.toFixed(2)
            && isBefore(lapseTransaction.date, stockTransaction.date); // TODO: Check that dates are close enough
        });
        if(sellTransaction) {
            const spaTransaction = stockTransactions.find(stockTransaction => {
                return stockTransaction.action === 'Stock Plan Activity'
                && stockTransaction.quantity === sellTransaction.quantity
                && isEqual(stockTransaction.date, sellTransaction.date);
            });
            if(spaTransaction) {
                taxTransactions.push({
                    transaction: sellTransaction,
                    purchaseDate: lapseTransaction.date,
                    purchasePriceUSD: lapseTransaction.lapseDetails?.fmvUSD as number,
                    quantity: sellTransaction.quantity
                });
                taxTransactions.push({
                    transaction: spaTransaction,
                    purchaseDate: lapseTransaction.date,
                    purchasePriceUSD: lapseTransaction.lapseDetails?.fmvUSD as number,
                    quantity: spaTransaction.quantity
                });
            }
        }
    }
    return taxTransactions;
}

export interface Lot {
    symbol: string,
    quantity: number,
    purchaseDate: Date,
    purchasePriceUSD: number,
}

export function buildLots(stockTransactions: IndividualTransaction[], eacHistory: EACTransaction[]): Lot[] {
    const spaTransactions = stockTransactions.filter(t => t.action === 'Stock Plan Activity');
    const lots: Lot[] = [];
    for (const spaTransaction of spaTransactions) {
        const lapseTransaction = eacHistory.find(t => {
            return isBefore(t.date, spaTransaction.asOfDate || spaTransaction.date) //TODO: Check that dates are close enough
            && t.lapseDetails?.sharesDeposited === spaTransaction.quantity;
        });
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
        if (transaction.quantity < currentLot.quantity - sharesSoldFromCurrentLot) {
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

export function createTaxReport(transactionsWithCostBasis: TransactionWithCostBasis[]): TaxSaleOfSecurity[] {
    const transactionsWithoutSpa = transactionsWithCostBasis.filter(t => t.transaction.action !== 'Stock Plan Activity');
    const chronologicalTransactions = transactionsWithoutSpa.sort(sortChronologicalBy(t => t.transaction.date));

    return chronologicalTransactions.map(transactionWithCostBasis => {
        const quantity = transactionWithCostBasis.quantity;
        const saleDate = transactionWithCostBasis.transaction.date;
        const purchaseDate = transactionWithCostBasis.purchaseDate;
        const salePriceEUR = transactionWithCostBasis.transaction.priceUSD as number; // TODO: Currency conversion
        const saleFeesEUR = transactionWithCostBasis.transaction.feesUSD as number; // TODO: Currency conversion & fees getting double counted
        const purchasePriceEUR = transactionWithCostBasis.purchasePriceUSD; // TODO: Currency conversion,
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
    ): TaxSaleOfSecurity[] {
        // Filter out non-stock transactions
        const stockTransactions = filterStockTransactions(individualHistory);

        // Find all transactions related to tax witholding
        const taxTransactionsWithCostBasis = findTaxTransactions(stockTransactions, eacHistory);

        // Filter out tax witholding transactions
        const taxTransactions = taxTransactionsWithCostBasis.map(twcb => twcb.transaction);
        const nonTaxTransactions = stockTransactions.filter(t => !taxTransactions.includes(t));

        // Build list of lots
        const lots = buildLots(nonTaxTransactions, eacHistory);

        // Calculate correct cost basis
        const nonTaxTransactionsWithCostBasis = calculateCostBases(nonTaxTransactions, lots);

        // Create tax report
        const taxReport = createTaxReport([...taxTransactionsWithCostBasis, ...nonTaxTransactionsWithCostBasis]);

        return taxReport;
    }