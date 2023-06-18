import { ECBConverter } from "../ecbRates";
import { EAC, Individual } from "./types";

interface ForexEvent {
    sourceCurrency: string,
    targetCurrency: string,
    sourceAmount: number,
    targetAmount: number,
}

type CashDepositTransaction = Individual.SellTransaction | Individual.CreditInterestTransaction | Individual.MiscCashEntryTransaction 

const isSellTransaction = (t: Individual.Transaction): t is Individual.SellTransaction => t.action === Individual.Action.Sell;
const isCreditInterestTransaction = (t: Individual.Transaction): t is Individual.CreditInterestTransaction => t.action === Individual.Action.CreditInterest;
const isMiscCashEntryTransaction = (t: Individual.Transaction): t is Individual.MiscCashEntryTransaction => t.action === Individual.Action.MiscCashEntry;
const isCashDepositTransaction = (t: Individual.Transaction): t is CashDepositTransaction => isSellTransaction(t) || isCreditInterestTransaction(t) || isMiscCashEntryTransaction(t);

type CashWithdrawTransaction = Individual.JournalTransaction | Individual.ServiceFeeTransaction | Individual.WireSentTransaction 

const isJournalTransaction = (t: Individual.Transaction): t is Individual.JournalTransaction => t.action === Individual.Action.Journal;
const isServiceFeeTransaction = (t: Individual.Transaction): t is Individual.ServiceFeeTransaction => t.action === Individual.Action.ServiceFee;
const isWireSentTransaction = (t: Individual.Transaction): t is Individual.WireSentTransaction => t.action === Individual.Action.WireSent;
const isCashWithdrawTransaction = (t: Individual.Transaction): t is CashDepositTransaction => isSellTransaction(t) || isCreditInterestTransaction(t) || isMiscCashEntryTransaction(t);


function filterCashDepositTransactions(individualHistory: Individual.Transaction[]): CashDepositTransaction[] {
    return individualHistory.filter(isCashDepositTransaction);
}

function filterCashWithdrawTransactions(individualHistory: Individual.Transaction[]): CashDepositTransaction[] {
    return individualHistory.filter(isCashWithdrawTransaction);
}

export function calculateForexGainLoss(
    individualHistory: Individual.Transaction[],
    eacHistory: EAC.Transaction[],
    ecbConverter: ECBConverter
    ): any[] {


        return [];
    }