import { YMD } from "../util";

export interface IndividualTransaction {
    date: YMD,
    asOfDate?: YMD,
    action: string, // TODO: Change to enum
    symbol: string,
    description: string,
    quantity: number,
    priceUSD?: number,
    feesUSD?: number,
    amountUSD?: number
}

export interface EACTransaction {
    date: YMD,
    asOfDate?: YMD,
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
    purchaseDate: YMD,
    purchasePriceUSD: number,
    subscriptionDate: YMD,
    subscriptionFMVUSD: number,
    purchaseFMVUSD: number,  
}

export interface EACSaleDetails {
    type: string,
    shares: number,
    salePriceUSD: number,
    subscriptionDate: YMD,
    subscriptionFMVUSD: number,
    purchaseDate: YMD,
    purchasePriceUSD: number,
    purchaseFMVUSD: number,
    grossProceedsUSD: number,
}

export interface EACLapseDetails {
    awardDate: YMD,
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
    saleDate: YMD,
    purchaseDate: YMD,
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
    purchaseDate: YMD,
    purchasePriceUSD: number
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
            && lapseTransaction.date.isBefore(stockTransaction.date);
        });
        if(sellTransaction) {
            const spaTransaction = stockTransactions.find(stockTransaction => {
                return stockTransaction.action === 'Stock Plan Activity'
                && stockTransaction.quantity === sellTransaction.quantity
                && YMD.compare(stockTransaction.date, sellTransaction.date) === 0;
            });
            if(spaTransaction) {
                taxTransactions.push({
                    transaction: sellTransaction,
                    purchaseDate: lapseTransaction.date,
                    purchasePriceUSD: lapseTransaction.lapseDetails?.fmvUSD as number,
                });
                taxTransactions.push({
                    transaction: spaTransaction,
                    purchaseDate: lapseTransaction.date,
                    purchasePriceUSD: lapseTransaction.lapseDetails?.fmvUSD as number,
                });
            }
        }
    }
    return taxTransactions;
}

export interface Lot {
    symbol: string,
    quantity: number,
    purchaseDate: YMD,
    purchasePriceUSD: number,
}

export function buildLots(stockTransactions: IndividualTransaction[], eacHistory: EACTransaction[]): Lot[] {
    const spaTransactions = stockTransactions.filter(t => t.action === 'Stock Plan Activity');
    const lots: Lot[] = [];
    for (const spaTransaction of spaTransactions) {
        const lapseTransaction = eacHistory.find(t => {
            return t.date.isBefore(spaTransaction.asOfDate || spaTransaction.date)
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
        if (YMD.compare(prev.purchaseDate, lot.purchaseDate) !== 0 || prev.purchasePriceUSD !== lot.purchasePriceUSD) {
            return [...acc, lot];
        }
        const merged = {...prev, quantity: prev.quantity + lot.quantity};
        return [...acc.slice(0,-1), merged];
    }, []);

    return mergedLots;
}

export function calculateCostBases(stockTransactions: IndividualTransaction[], lots: Lot[]): TransactionWithCostBasis[] {
    return [];
}

export function createTaxReport(transactionsWithCostBasis: TransactionWithCostBasis[]): TaxSaleOfSecurity[] {
    return [];
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