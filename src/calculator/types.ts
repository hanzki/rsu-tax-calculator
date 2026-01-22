import { Number, String, Literal, Record, Union, InstanceOf, Static, Array } from 'runtypes';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

export namespace Individual {
    export enum Action {
        CancelSell = 'Cancel Sell',
        CreditInterest = 'Credit Interest',
        Journal = 'Journal',
        MiscCashEntry = 'Misc Cash Entry',
        NRATaxAdj = 'NRA Tax Adj',
        SecurityTransfer = 'Security Transfer',
        Sell = 'Sell',
        ServiceFee = 'Service Fee',
        StockPlanActivity = 'Stock Plan Activity',
        WireSent = 'Wire Sent',
    };

    const CancelSellTransaction = Record({
        action: Literal(Action.CancelSell),
        date: InstanceOf(Date),
        asOfDate: InstanceOf(Date).optional(),
        symbol: String,
        description: String,
        quantity: Number,
        priceUSD: Number,
        feesUSD: Number.optional(),
        amountUSD: Number,
    });
    export type CancelSellTransaction = Static<typeof CancelSellTransaction>;

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

    const NRATaxAdjTransaction = Record({
        action: Literal(Action.NRATaxAdj),
        date: InstanceOf(Date),
        description: String,
        amountUSD: Number,
    });
    export type NRATaxAdjTransaction = Static<typeof NRATaxAdjTransaction>;

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
        asOfDate: InstanceOf(Date).optional(),
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
        CancelSellTransaction,
        CreditInterestTransaction,
        JournalTransaction,
        MiscCashEntryTransaction,
        NRATaxAdjTransaction,
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
        ExerciseAndHold = 'Exercise and Hold',
        ExerciseAndSell = 'Exercise and Sell',
        Lapse = 'Lapse',
        Sale = 'Sale',
        SellToCover = 'Sell to Cover',
        WireTransfer = 'Wire Transfer',
        ForcedDisbursement = 'Forced Disbursement',
        ForcedQuickSell = 'Forced Quick Sell',
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

    const ExerciseAndHoldRow = Record({
        awardID: String,
        sharesExercised: Number,
        awardPriceUSD: Number,
        awardType: String,
        awardDate: InstanceOf(Date),
    });
    export type ExerciseAndHoldRow = Static<typeof ExerciseAndHoldRow>;

    const ExerciseAndSellRow = Record({
        awardID: String,
        sharesExercised: Number,
        awardPriceUSD: Number,
        salePriceUSD: Number,
        awardType: String,
        awardDate: InstanceOf(Date),
    });

    const OptionsDetails = Record({
        exerciseCostUSD: Number,
        grossProceedsUSD: Number.optional(),
        netProceedsUSD: Number.optional(),
    });

    const ExerciseAndHoldTransaction = Record({
        action: Literal(Action.ExerciseAndHold),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        feesUSD: Number.optional(),
        amountUSD: Number.optional(),
        rows: Array(ExerciseAndHoldRow),
        details: OptionsDetails
    });
    export type ExerciseAndHoldTransaction = Static<typeof ExerciseAndHoldTransaction>;

    const ExerciseAndSellTransaction = Record({
        action: Literal(Action.ExerciseAndSell),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        feesUSD: Number,
        amountUSD: Number,
        rows: Array(ExerciseAndSellRow),
        details: OptionsDetails
    });
    export type ExerciseAndSellTransaction = Static<typeof ExerciseAndSellTransaction>;

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

    const SaleDetailsRow = Record({
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
        rows: Array(SaleDetailsRow),
    });
    export type SaleTransaction = Static<typeof SaleTransaction>;

    export enum SellToCoverAction {
        Sell = 'STC Sell',
        Hold = 'STC Hold',
    }

    const SellToCoverSellRow = Record({
        action: Literal(SellToCoverAction.Sell),
        awardID: String,
        sharesExercised: Number,
        awardPriceUSD: Number,
        salePriceUSD: Number,
        awardType: String,
        awardDate: InstanceOf(Date),
    });
    export type SellToCoverSellRow = Static<typeof SellToCoverSellRow>;

    const SellToCoverHoldRow = Record({
        action: Literal(SellToCoverAction.Hold),
        awardID: String,
        sharesExercised: Number,
        awardPriceUSD: Number,
        awardType: String,
        awardDate: InstanceOf(Date),
    });
    export type SellToCoverHoldRow = Static<typeof SellToCoverHoldRow>;

    const SellToCoverTransaction = Record({
        action: Literal(Action.SellToCover),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        feesUSD: Number,
        amountUSD: Number,
        rows: Array(Union(SellToCoverSellRow, SellToCoverHoldRow)),
        details: OptionsDetails
    });
    export type SellToCoverTransaction = Static<typeof SellToCoverTransaction>;

    const WireTransferTransaction = Record({
        action: Literal(Action.WireTransfer),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        feesUSD: Number.optional(),
        amountUSD: Number,
    });
    export type WireTransferTransaction = Static<typeof WireTransferTransaction>;

    const ForcedDisbursementTransaction = Record({
        action: Literal(Action.ForcedDisbursement),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        amountUSD: Number,
    });
    export type ForcedDisbursementTransaction = Static<typeof ForcedDisbursementTransaction>;

    const ForcedQuickSellDetailsRow = Record({
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

    const ForcedQuickSellTransaction = Record({
        action: Literal(Action.ForcedQuickSell),
        date: InstanceOf(Date),
        symbol: String,
        description: String,
        quantity: Number,
        feesUSD: Number,
        amountUSD: Number,
        rows: Array(ForcedQuickSellDetailsRow),
    });

    export type ForcedQuickSellTransaction = Static<typeof ForcedQuickSellTransaction>;

    export const Transaction = Union(
        DepositTransaction,
        ExerciseAndSellTransaction,
        ExerciseAndHoldTransaction,
        LapseTransaction,
        SaleTransaction,
        SellToCoverTransaction,
        WireTransferTransaction,
        ForcedDisbursementTransaction,
        ForcedQuickSellTransaction,
    );
    export type Transaction = Static<typeof Transaction>;
}
