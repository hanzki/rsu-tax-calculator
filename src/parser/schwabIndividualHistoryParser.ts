import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { IndividualTransaction, IndividualTransactionAction } from '../calculator';
import { firstLineAndRest, parseDates, parseQuantity, parseUSD } from './parseUtils';

const FIELD_DATE = 'Date';
const FIELD_ACTION = 'Action';
const FIELD_SYMBOL = 'Symbol';
const FIELD_DESCRIPTION = 'Description';
const FIELD_QUANTITY = 'Quantity';
const FIELD_PRICE = 'Price';
const FIELD_FEES = 'Fees & Comm';
const FIELD_AMOUNT = 'Amount';
const FILE_HEADER = [FIELD_DATE, FIELD_ACTION, FIELD_SYMBOL, FIELD_DESCRIPTION, FIELD_QUANTITY, FIELD_PRICE, FIELD_FEES, FIELD_AMOUNT]

function dropSummaryLine(input: string): string {
    const summaryLineIndex = input.indexOf("\n\"Transactions Total\"");
    if (summaryLineIndex !== -1) {
        return input.substring(0, summaryLineIndex);
    } else {
        return input;
    }
}

function parseAction(data: string): IndividualTransactionAction {
    if (Object.values(IndividualTransactionAction).includes(data as IndividualTransactionAction)) {
        return data as IndividualTransactionAction;
    }
    else throw new Error(`Unknown Individual transaction action: ${data}`);
}

export function parseIndividualHistory(input: string): IndividualTransaction[] {
    const [firstLine, rest] = firstLineAndRest(input);
    if (!firstLine.startsWith("\"Transactions  for account")) {
        console.error(`Got: "${firstLine}"`);
        throw new Error('Incompatible file');
    }

    const withoutSummary = dropSummaryLine(rest);

    const papaOptions = { header: true };
    const parsed = Papa.parse(withoutSummary, papaOptions);

    console.debug('parse', parsed);

    if (!_.isEqual(parsed.meta.fields, FILE_HEADER)) {
        console.error(`Got: "${parsed.meta.fields}"`);
        throw new Error('Unexpect file contents');
    }

    const history = [];
    for (const line of parsed.data as any[]) {
        const [date, asOfDate] = parseDates(line[FIELD_DATE]);
        history.push({
            date,
            asOfDate,
            action: parseAction(line[FIELD_ACTION]),
            symbol: line[FIELD_SYMBOL],
            description: line[FIELD_DESCRIPTION],
            quantity: parseQuantity(line[FIELD_QUANTITY]),
            priceUSD: parseUSD(line[FIELD_PRICE]),
            feesUSD: parseUSD(line[FIELD_FEES]),
            amountUSD: parseUSD(line[FIELD_AMOUNT])
        })
    }
    return history;
}