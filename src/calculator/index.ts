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

export interface Lot {
    symbol: string,
    quantity: number,
    purchaseDate: YMD,
    purchasePriceUSD: number,
}

export function buildLots(
    individualHistory: IndividualTransaction[],
    eacHistory: EACTransaction[],
): Lot[] {
    const stockGainTransactions = individualHistory.filter(t => t.action === 'Stock Plan Activity');
    const rsuLapses = eacHistory.filter(t => t.action === 'Lapse');

    const stockGainToLapses = new Map<string, EACTransaction>();
    for (const stockGainTransaction of stockGainTransactions) {
        const transactionID = `${stockGainTransaction.date}_${stockGainTransaction.symbol}_${stockGainTransaction.quantity}`;
        const earlierLapses = rsuLapses.filter(t => t.date.isBefore(stockGainTransaction.date));
        const earlierLapsesReverseChrono = earlierLapses.reverse();
        const matchingLapse = earlierLapsesReverseChrono.find(t => {
            const ld = t.lapseDetails;
            return stockGainTransaction.quantity === ld?.sharesSold || stockGainTransaction.quantity === ld?.sharesDeposited;
        });

        if(!matchingLapse) throw new Error(`Couldn't match transaction ${transactionID}`);

        stockGainToLapses.set(transactionID, matchingLapse);
    }

    return stockGainTransactions.map(stockGainTransaction => {
        const transactionID = `${stockGainTransaction.date}_${stockGainTransaction.symbol}_${stockGainTransaction.quantity}`;
        const lapse = stockGainToLapses.get(transactionID);
        if(!lapse?.lapseDetails) throw new Error(`Couldn't match transaction ${transactionID}`);

        return {
            symbol: stockGainTransaction.symbol,
            quantity: stockGainTransaction.quantity,
            purchaseDate: lapse.date,
            purchasePriceUSD: lapse.lapseDetails.fmvUSD
        }
    });
}

export function calculateTaxes(
    individualHistory: IndividualTransaction[],
    eacHistory: EACTransaction[],
    ): TaxSaleOfSecurity[] {
        return [];
    }