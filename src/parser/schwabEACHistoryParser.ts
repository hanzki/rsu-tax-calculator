import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { EACTransaction, EACTransactionAction } from '../calculator/types';
import { firstLineAndRest, parseDates, parseQuantity, parseUSD } from './parseUtils';

const FIELD_EMPTY = '';

//"Date","Action","Symbol","Description","Quantity","Fees & Commissions","Disbursement Election","Amount"
const FIELD_DATE = 'Date';
const FIELD_ACTION = 'Action';
const FIELD_SYMBOL = 'Symbol';
const FIELD_DESCRIPTION = 'Description';
const FIELD_QUANTITY = 'Quantity';
const FIELD_FEES = 'Fees & Commissions';
const FIELD_DISB_ELECTION = "Disbursement Election";
const FIELD_AMOUNT = 'Amount';
const FILE_HEADER = [FIELD_DATE, FIELD_ACTION, FIELD_SYMBOL, FIELD_DESCRIPTION, FIELD_QUANTITY, FIELD_FEES, FIELD_DISB_ELECTION, FIELD_AMOUNT]

//"","Purchase Date","Purchase Price","Subscription Date","Subscription FMV","Purchase FMV",
const FIELD_DEPOSIT_PURCHASE_DATE = 'Purchase Date';
const FIELD_DEPOSIT_PURCHASE_PRICE = 'Purchase Price';
const FIELD_DEPOSIT_SUBSCRIPTION_DATE = 'Subscription Date';
const FIELD_DEPOSIT_SUBSCRIPTION_FMV = 'Subscription FMV';
const FIELD_DEPOSIT_PURCHASE_FMV = 'Purchase FMV';
const DEPOSIT_HEADER = [
    FIELD_EMPTY,
    FIELD_DEPOSIT_PURCHASE_DATE,
    FIELD_DEPOSIT_PURCHASE_PRICE,
    FIELD_DEPOSIT_SUBSCRIPTION_DATE,
    FIELD_DEPOSIT_SUBSCRIPTION_FMV,
    FIELD_DEPOSIT_PURCHASE_FMV,
    FIELD_EMPTY
]

//"","Type","Shares","Sale Price","Subscription Date","Subscription FMV","Purchase Date","Purchase Price","Purchase FMV","Disposition Type","Grant Id","Vest Date","Vest FMV","Gross Proceeds",
const FIELD_SALE_TYPE = 'Type';
const FIELD_SALE_SHARES = 'Shares';
const FIELD_SALE_SALE_PRICE = 'Sale Price';
const FIELD_SALE_SUBSCRIPTION_DATE = 'Subscription Date';
const FIELD_SALE_SUBSCRIPTION_FMV = 'Subscription FMV';
const FIELD_SALE_PURCHASE_DATE = 'Purchase Date';
const FIELD_SALE_PURCHASE_PRICE = 'Purchase Price';
const FIELD_SALE_PURCHASE_FMV = 'Purchase FMV';
const FIELD_SALE_DISPOSITION_TYPE = 'Disposition Type';
const FIELD_SALE_GRANT_ID = 'Grant Id';
const FIELD_SALE_VEST_DATE = 'Vest Date';
const FIELD_SALE_VEST_FMV = 'Vest FMV';
const FIELD_SALE_GROSS_PROCEEDS = 'Gross Proceeds';
const SALE_HEADER = [
    FIELD_EMPTY,
    FIELD_SALE_TYPE,
    FIELD_SALE_SHARES,
    FIELD_SALE_SALE_PRICE,
    FIELD_SALE_SUBSCRIPTION_DATE,
    FIELD_SALE_SUBSCRIPTION_FMV,
    FIELD_SALE_PURCHASE_DATE,
    FIELD_SALE_PURCHASE_PRICE,
    FIELD_SALE_PURCHASE_FMV,
    FIELD_SALE_DISPOSITION_TYPE,
    FIELD_SALE_GRANT_ID,
    FIELD_SALE_VEST_DATE,
    FIELD_SALE_VEST_FMV,
    FIELD_SALE_GROSS_PROCEEDS,
    FIELD_EMPTY
]

// "","Award Date","Award ID","Fair Market Value","Sale Price","Shares Sold/Withheld for Taxes","Net Shares Deposited","Total Taxes",
const FIELD_LAPSE_AWARD_DATE = 'Award Date';
const FIELD_LAPSE_AWARD_ID = 'Award ID';
const FIELD_LAPSE_AWARD_FMV = 'Fair Market Value';
const FIELD_LAPSE_AWARD_SALE_PRICE = 'Sale Price';
const FIELD_LAPSE_AWARD_SHARES_SOLD = 'Shares Sold/Withheld for Taxes';
const FIELD_LAPSE_AWARD_SHARES_DEPOSITED = 'Net Shares Deposited';
const FIELD_LAPSE_AWARD_TOTAL_TAX = 'Total Taxes';
const LAPSE_HEADER = [
    FIELD_EMPTY,
    FIELD_LAPSE_AWARD_DATE,
    FIELD_LAPSE_AWARD_ID,
    FIELD_LAPSE_AWARD_FMV,
    FIELD_LAPSE_AWARD_SALE_PRICE,
    FIELD_LAPSE_AWARD_SHARES_SOLD,
    FIELD_LAPSE_AWARD_SHARES_DEPOSITED,
    FIELD_LAPSE_AWARD_TOTAL_TAX,
    FIELD_EMPTY
]

function readLine(data: string[], header: string[]): { [key in typeof header[number]]: string} {
    let line: any = {};
    data.forEach((value, index) => {
        line[header[index]] = value;
    });
    return line;
}

function parseAction(data: string): EACTransactionAction {
    if (Object.values(EACTransactionAction).includes(data as EACTransactionAction)) {
        return data as EACTransactionAction;
    }
    else throw new Error(`Unknown EAC transaction action: ${data}`);
}

export function parseEACHistory(input: string): EACTransaction[] {
    const [firstLine, rest] = firstLineAndRest(input);
    if (!firstLine.startsWith("\"Transaction Details for Equity Awards Center")) {
        console.error(`Got: "${firstLine}"`);
        throw new Error('Incompatible file');
    }

    const papaOptions = { header: false, skipEmptyLines: true };
    const parsed = Papa.parse(rest, papaOptions);

    console.debug('parse', parsed);

    if (!_.isEqual(parsed.data[0], FILE_HEADER)) {
        console.error(`Got: "${parsed.data[0]}", Expected: "${FILE_HEADER}"`);
        throw new Error('Unexpect file contents');
    }

    const history: EACTransaction[] = [];
    for (let i = 1; i < parsed.data.length; i++) {
        const line = readLine(parsed.data[i] as string[], FILE_HEADER);
        const eacTransaction: Partial<EACTransaction> = {
            date: parseDates(line[FIELD_DATE])[0],
            action: parseAction(line[FIELD_ACTION]),
            symbol: line[FIELD_SYMBOL],
            description: line[FIELD_DESCRIPTION],
            quantity: parseQuantity(line[FIELD_QUANTITY]),
            feesUSD: parseUSD(line[FIELD_FEES]),
            amountUSD: parseUSD(line[FIELD_AMOUNT])
        }

        if (eacTransaction.action === EACTransactionAction.Deposit) {
            if (!_.isEqual(parsed.data[i+1], DEPOSIT_HEADER)) {
                console.error(`Got: "${parsed.data[i+1]}", Expected: "${DEPOSIT_HEADER}"`);
                throw new Error('Unexpect file contents');
            }
            const depositDetailsLine = readLine(parsed.data[i+2] as string[], DEPOSIT_HEADER);
            const depositDetails = {
                purchaseDate: parseDates(depositDetailsLine[FIELD_DEPOSIT_PURCHASE_DATE])[0],
                purchasePriceUSD: parseUSD(depositDetailsLine[FIELD_DEPOSIT_PURCHASE_PRICE]),
                subscriptionDate: parseDates(depositDetailsLine[FIELD_DEPOSIT_SUBSCRIPTION_DATE])[0],
                subscriptionFMVUSD: parseUSD(depositDetailsLine[FIELD_DEPOSIT_SUBSCRIPTION_FMV]),
                purchaseFMVUSD: parseUSD(depositDetailsLine[FIELD_DEPOSIT_PURCHASE_FMV]),  
            }
            eacTransaction.depositDetails = depositDetails;
            i = i+2;
        }

        if (eacTransaction.action === EACTransactionAction.Sale) {
            if (!_.isEqual(parsed.data[i+1], SALE_HEADER)) {
                console.error(`Got: "${parsed.data[i+1]}", Expected: "${SALE_HEADER}"`);
                throw new Error('Unexpect file contents');
            }
            const saleDetailsLine = readLine(parsed.data[i+2] as string[], SALE_HEADER);
            const saleDetails = {
                type: saleDetailsLine[FIELD_SALE_TYPE],
                shares: parseQuantity(saleDetailsLine[FIELD_SALE_SHARES]),
                salePriceUSD: parseUSD(saleDetailsLine[FIELD_SALE_SALE_PRICE]),
                subscriptionDate: parseDates(saleDetailsLine[FIELD_SALE_SUBSCRIPTION_DATE])[0],
                subscriptionFMVUSD: parseUSD(saleDetailsLine[FIELD_SALE_SUBSCRIPTION_FMV]),
                purchaseDate: parseDates(saleDetailsLine[FIELD_SALE_PURCHASE_DATE])[0],
                purchasePriceUSD: parseUSD(saleDetailsLine[FIELD_SALE_PURCHASE_PRICE]),
                purchaseFMVUSD: parseUSD(saleDetailsLine[FIELD_SALE_PURCHASE_FMV]),
                grossProceedsUSD: parseUSD(saleDetailsLine[FIELD_SALE_GROSS_PROCEEDS]),
            }
            eacTransaction.saleDetails = saleDetails;
            i = i+2;
        }

        if (eacTransaction.action === EACTransactionAction.Lapse) {
            if (!_.isEqual(parsed.data[i+1], LAPSE_HEADER)) {
                console.error(`Got: "${parsed.data[i+1]}", Expected: "${LAPSE_HEADER}"`);
                throw new Error('Unexpect file contents');
            }
            const lapseDetailsLine = readLine(parsed.data[i+2] as string[], LAPSE_HEADER);
            const lapseDetails = {
                awardDate: parseDates(lapseDetailsLine[FIELD_LAPSE_AWARD_DATE])[0],
                awardID: lapseDetailsLine[FIELD_LAPSE_AWARD_ID],
                fmvUSD: parseUSD(lapseDetailsLine[FIELD_LAPSE_AWARD_FMV]),
                salePriceUSD: parseUSD(lapseDetailsLine[FIELD_LAPSE_AWARD_SALE_PRICE]),
                sharesSold: parseQuantity(lapseDetailsLine[FIELD_LAPSE_AWARD_SHARES_SOLD]),
                sharesDeposited: parseQuantity(lapseDetailsLine[FIELD_LAPSE_AWARD_SHARES_DEPOSITED]),
                totalTaxesUSD: parseUSD(lapseDetailsLine[FIELD_LAPSE_AWARD_TOTAL_TAX]),
            }
            eacTransaction.lapseDetails = lapseDetails;
            i = i+2;
        }

        history.push(eacTransaction as EACTransaction); // TODO: Remove cast
    }
    return history;
}