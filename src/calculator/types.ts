
interface Symbol {
    symbol: string
}

interface Fees {
    feesUSD: number
}

interface Amount {
    amountUSD: number
}

interface Quantity {
    quantity: number
}

interface Fees {
    feesUSD: number
}

interface Amount {
    amountUSD: number
}

interface Price {
    priceUSD: number,
}

export enum IndividualTransactionAction {
    CreditInterest = 'Credit Interest',
    Journal = 'Journal',
    MiscCashEntry = 'Misc Cash Entry',
    SecurityTransfer = 'Security Transfer',
    Sell = 'Sell',
    ServiceFee = 'Service Fee',
    StockPlanActivity = 'Stock Plan Activity',
    WireSent = 'Wire Sent',
}

export type IndividualTransaction = IndCreditInterestTransaction
    | IndJournalTransaction
    | IndMiscCashEntryTransaction
    | IndSecurityTransferTransaction
    | IndSellTransaction
    | IndServiceFeeTransaction
    | IndStockPlanActivityTransaction
    | IndWireSentTransaction;

interface IndividualTransactionBase {
    date: Date,
    description: string,
}

export interface IndCreditInterestTransaction extends IndividualTransactionBase, Amount {
    action: IndividualTransactionAction.CreditInterest
}

export interface IndJournalTransaction extends IndividualTransactionBase, Amount {
    action: IndividualTransactionAction.Journal
}

export interface IndMiscCashEntryTransaction extends IndividualTransactionBase, Amount {
    action: IndividualTransactionAction.MiscCashEntry
}

export interface IndSecurityTransferTransaction extends IndividualTransactionBase, Symbol, Quantity {
    action: IndividualTransactionAction.SecurityTransfer
}

export interface IndSellTransaction extends IndividualTransactionBase, Symbol, Quantity, Price, Fees, Amount {
    action: IndividualTransactionAction.Sell
}

export interface IndServiceFeeTransaction extends IndividualTransactionBase, Amount {
    action: IndividualTransactionAction.ServiceFee
}

export interface IndStockPlanActivityTransaction extends IndividualTransactionBase, Symbol, Quantity {
    action: IndividualTransactionAction.StockPlanActivity,
    asOfDate?: Date,
}

export interface IndWireSentTransaction extends IndividualTransactionBase, Amount {
    action: IndividualTransactionAction.WireSent
}

export enum EACTransactionAction {
    Deposit = 'Deposit',
    Lapse = 'Lapse',
    Sale = 'Sale',
    WireTransfer = 'Wire Transfer',
}

export type EACTransaction = EACDepositTransaction
    | EACLapseTransaction
    | EACSaleTransaction
    | EACWireTransferTransaction;

interface EACTransactionBase extends Symbol {
    date: Date,
    description: string,
}


export interface EACDepositTransaction extends EACTransactionBase, Quantity {
    action: EACTransactionAction.Deposit,
    depositDetails: {
        purchaseDate: Date,
        purchasePriceUSD: number,
        subscriptionDate: Date,
        subscriptionFMVUSD: number,
        purchaseFMVUSD: number,  
    }
}

export interface EACLapseTransaction extends EACTransactionBase, Quantity {
    action: EACTransactionAction.Lapse,
    lapseDetails: {
        awardDate: Date,
        awardID: string,
        fmvUSD: number,
        salePriceUSD?: number,
        sharesSold: number,
        sharesDeposited: number,
        totalTaxesUSD: number,
    }
}

export interface EACSaleTransaction extends EACTransactionBase, Quantity, Fees, Amount {
    action: EACTransactionAction.Sale,
    saleDetails: {
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
}

export interface EACWireTransferTransaction extends EACTransactionBase, Fees, Amount {
    action: EACTransactionAction.WireTransfer
}