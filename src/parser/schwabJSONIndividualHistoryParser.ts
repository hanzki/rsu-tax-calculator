import * as _ from 'lodash';
import { parseDates, parseQuantity, parseSymbol, parseUSD } from './parseUtils';
import { Individual } from '../calculator/types';

function parseAction(data: string): Individual.Action {
    if (Object.values(Individual.Action).includes(data as Individual.Action)) {
        return data as Individual.Action;
    }
    else throw new Error(`Unknown Individual transaction action: ${data}`);
}

function checkForUnsupportedData(history: Individual.Transaction[]) {
    const incomingSecurityTransfer = history.find(t => t.action === Individual.Action.SecurityTransfer && t.quantity >= 0);
    if (incomingSecurityTransfer !== undefined) {
        throw new Error("Unsupported data: Cannot handle correctly incoming security transfers");
    }

    const otherSharesInTheAccount = history.find((t) => "symbol" in t && t.symbol !== undefined && t.symbol !== "U");
    if (otherSharesInTheAccount !== undefined && "symbol" in otherSharesInTheAccount) {
        console.log(otherSharesInTheAccount);
        throw new Error(`Unsupported data: The account contains transactions for symbol "${otherSharesInTheAccount.symbol}". Currently only supporting Unity Technologies Inc. (U) shares.`);
    }
}

export function parseIndividualHistory(input: string): Individual.Transaction[] {
    const schwabData = JSON.parse(input);

    const history: Individual.Transaction[] = [];
    for (const line of schwabData.BrokerageTransactions) {
        const [date, asOfDate] = parseDates(line.Date);
        history.push(Individual.Transaction.check({
            date,
            asOfDate,
            action: parseAction(line.Action),
            symbol: parseSymbol(line.Symbol),
            description: line.Description,
            quantity: parseQuantity(line.Quantity),
            priceUSD: parseUSD(line.Price),
            feesUSD: parseUSD(line['Fees & Comm']),
            amountUSD: parseUSD(line.Amount)
        }))
    }

    checkForUnsupportedData(history);

    return history;
}