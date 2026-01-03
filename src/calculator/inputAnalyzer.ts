import { Individual, EAC } from "./types";

type ParsedTransaction = Individual.Transaction | EAC.Transaction;

export function analyzeInputData(transactions: ParsedTransaction[]): {
    firstTransactionDate: Date;
    lastTransactionDate: Date;
} {
    const firstTransactionDate = transactions.reduce((earliest, transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate < earliest ? transactionDate : earliest;
    }, new Date());

    const lastTransactionDate = transactions.reduce((latest, transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate > latest ? transactionDate : latest;
    }, new Date(0));

    return {
        firstTransactionDate,
        lastTransactionDate,
    };
};
