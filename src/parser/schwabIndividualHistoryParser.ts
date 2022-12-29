import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { firstLineAndRest, parseDates, parseQuantity, parseUSD } from './parseUtils';
import { Individual } from '../calculator/types';

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

function parseAction(data: string): Individual.Action {
    if (Object.values(Individual.Action).includes(data as Individual.Action)) {
        return data as Individual.Action;
    }
    else throw new Error(`Unknown Individual transaction action: ${data}`);
}

export function parseIndividualHistory(input: string): Individual.Transaction[] {
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

    const history: Individual.Transaction[] = [];
    for (const line of parsed.data as {[key: string]: string}[]) {
        const [date, asOfDate] = parseDates(line[FIELD_DATE]);
        history.push(Individual.Transaction.check({
            date,
            asOfDate,
            action: parseAction(line[FIELD_ACTION]),
            symbol: line[FIELD_SYMBOL],
            description: line[FIELD_DESCRIPTION],
            quantity: parseQuantity(line[FIELD_QUANTITY]),
            priceUSD: parseUSD(line[FIELD_PRICE]),
            feesUSD: parseUSD(line[FIELD_FEES]),
            amountUSD: parseUSD(line[FIELD_AMOUNT])
        }))
    }
    return history;
}