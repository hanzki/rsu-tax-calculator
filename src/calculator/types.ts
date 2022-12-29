import { Number, String, Literal, Record, Union, InstanceOf, Static } from 'runtypes';

export namespace Individual {
    export enum Action {
        CreditInterest = 'Credit Interest',
        Journal = 'Journal',
        MiscCashEntry = 'Misc Cash Entry',
        SecurityTransfer = 'Security Transfer',
        Sell = 'Sell',
        ServiceFee = 'Service Fee',
        StockPlanActivity = 'Stock Plan Activity',
        WireSent = 'Wire Sent',
    };

    const CreditInterestTransaction = Record({
        action: Literal(Action.CreditInterest),
        date: InstanceOf(Date),
        description: String,
        amountUSD: Number,
    });
    export type CreditInterestTransaction = Static<typeof CreditInterestTransaction>;

    const JournalTransaction = Record({
        action: Literal(Action.Journal),
        date: InstanceOf(Date),
        description: String,
        amountUSD: Number,
    });
    export type JournalTransaction = Static<typeof JournalTransaction>;
    
    const MiscCashEntryTransaction = Record({
        action: Literal(Action.MiscCashEntry),
        date: InstanceOf(Date),
        description: String,
        amountUSD: Number,
    });
    export type MiscCashEntryTransaction = Static<typeof MiscCashEntryTransaction>;
    
    const SecurityTransferTransaction = Record({
        action: Literal(Action.SecurityTransfer),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
    });
    export type SecurityTransferTransaction = Static<typeof SecurityTransferTransaction>;
    
    const SellTransaction = Record({
        action: Literal(Action.Sell),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        priceUSD: Number,
        feesUSD: Number.optional(),
        amountUSD: Number,
    });
    export type SellTransaction = Static<typeof SellTransaction>;
    
    const ServiceFeeTransaction = Record({
        action: Literal(Action.ServiceFee),
        date: InstanceOf(Date),
        description: String,
        amountUSD: Number,
    });
    export type ServiceFeeTransaction = Static<typeof ServiceFeeTransaction>;
    
    const StockPlanActivityTransaction = Record({
        action: Literal(Action.StockPlanActivity),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        asOfDate: InstanceOf(Date).optional(),
    });
    export type StockPlanActivityTransaction = Static<typeof StockPlanActivityTransaction>;
    
    const WireSentTransaction = Record({
        action: Literal(Action.WireSent),
        date: InstanceOf(Date),
        description: String,
        amountUSD: Number,
    });
    export type WireSentTransaction = Static<typeof WireSentTransaction>;

    export const Transaction = Union(
        CreditInterestTransaction,
        JournalTransaction,
        MiscCashEntryTransaction,
        SecurityTransferTransaction,
        SellTransaction,
        ServiceFeeTransaction,
        StockPlanActivityTransaction,
        WireSentTransaction
    );
    export type Transaction = Static<typeof Transaction>;
}

export namespace EAC {
    export enum Action {
        Deposit = 'Deposit',
        Lapse = 'Lapse',
        Sale = 'Sale',
        WireTransfer = 'Wire Transfer',
    }

    const DepositDetails = Record({
        purchaseDate: InstanceOf(Date),
        purchasePriceUSD: Number,
        subscriptionDate: InstanceOf(Date),
        subscriptionFMVUSD: Number,
        purchaseFMVUSD: Number,  
    });

    const DepositTransaction = Record({
        action: Literal(Action.Deposit),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        depositDetails: DepositDetails
    });

    export type DepositTransaction = Static<typeof DepositTransaction>;

    const LapseDetails = Record({
        awardDate: InstanceOf(Date),
        awardID: String,
        fmvUSD: Number,
        salePriceUSD: Number.optional(),
        sharesSold: Number,
        sharesDeposited: Number,
        totalTaxesUSD: Number.optional(),
    });

    const LapseTransaction = Record({
        action: Literal(Action.Lapse),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        lapseDetails:LapseDetails
    });

    export type LapseTransaction = Static<typeof LapseTransaction>;

    const SaleDetails = Record({
        type: String,
        shares: Number,
        salePriceUSD: Number,
        subscriptionDate: InstanceOf(Date),
        subscriptionFMVUSD: Number,
        purchaseDate: InstanceOf(Date),
        purchasePriceUSD: Number,
        purchaseFMVUSD: Number,
        grossProceedsUSD: Number,  
    });

    const SaleTransaction = Record({
        action: Literal(Action.Sale),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        feesUSD: Number,
        amountUSD: Number,
        saleDetails: SaleDetails,
    });

    export type SaleTransaction = Static<typeof SaleTransaction>;

    const WireTransferTransaction = Record({
        action: Literal(Action.WireTransfer),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        feesUSD: Number,
        amountUSD: Number,
    });

    export type WireTransferTransaction = Static<typeof WireTransferTransaction>;

    export const Transaction = Union(DepositTransaction, LapseTransaction, SaleTransaction, WireTransferTransaction);
    export type Transaction = Static<typeof Transaction>;
}
