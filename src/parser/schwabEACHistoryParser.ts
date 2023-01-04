import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { EAC } from '../calculator/types';
import { firstLineAndRest, parseDates, parseQuantity, parseSymbol, parseUSD } from './parseUtils';

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

// "","Award ID","Shares Exercised","Award Price","Sale Price","Award Type","Award Date",
const FIELD_EXERCISE_AND_SELL_AWARD_ID = 'Award ID';
const FIELD_EXERCISE_AND_SELL_SHARES_EXERCISED = 'Shares Exercised';
const FIELD_EXERCISE_AND_SELL_AWARD_PRICE = 'Award Price';
const FIELD_EXERCISE_AND_SELL_SALE_PRICE = 'Sale Price';
const FIELD_EXERCISE_AND_SELL_AWARD_TYPE = 'Award Type';
const FIELD_EXERCISE_AND_SELL_AWARD_DATE = 'Award Date';
const EXERCISE_AND_SELL_ROW_HEADER = [
    FIELD_EMPTY,
    FIELD_EXERCISE_AND_SELL_AWARD_ID,
    FIELD_EXERCISE_AND_SELL_SHARES_EXERCISED,
    FIELD_EXERCISE_AND_SELL_AWARD_PRICE,
    FIELD_EXERCISE_AND_SELL_SALE_PRICE,
    FIELD_EXERCISE_AND_SELL_AWARD_TYPE,
    FIELD_EXERCISE_AND_SELL_AWARD_DATE,
    FIELD_EMPTY,
];

// "","Exercise Cost","Taxes","Gross Proceeds","Net Proceeds",
const FIELD_OPTIONS_DETAILS_EXERCISE_COST = 'Exercise Cost';
const FIELD_OPTIONS_DETAILS_TAXES = 'Taxes';
const FIELD_OPTIONS_DETAILS_GROSS_PROCEEDS = 'Gross Proceeds';
const FIELD_OPTIONS_DETAILS_NET_PROCEEDS = 'Net Proceeds';
const OPTIONS_DETAILS_HEADER = [
    FIELD_EMPTY,
    FIELD_OPTIONS_DETAILS_EXERCISE_COST,
    FIELD_OPTIONS_DETAILS_TAXES,
    FIELD_OPTIONS_DETAILS_GROSS_PROCEEDS,
    FIELD_OPTIONS_DETAILS_NET_PROCEEDS,
    FIELD_EMPTY,
];

// "","Award Id","Action","Shares Exercised","Award Price","Sale Price","Award Type","Award Date",
const FIELD_SELL_TO_COVER_AWARD_ID = 'Award Id';
const FIELD_SELL_TO_COVER_ACTION = 'Action';
const FIELD_SELL_TO_COVER_SHARES_EXERCISED = 'Shares Exercised';
const FIELD_SELL_TO_COVER_AWARD_PRICE = 'Award Price';
const FIELD_SELL_TO_COVER_SALE_PRICE = 'Sale Price';
const FIELD_SELL_TO_COVER_AWARD_TYPE = 'Award Type';
const FIELD_SELL_TO_COVER_AWARD_DATE = 'Award Date';
const SELL_TO_COVER_ROW_HEADER = [
    FIELD_EMPTY,
    FIELD_SELL_TO_COVER_AWARD_ID,
    FIELD_SELL_TO_COVER_ACTION,
    FIELD_SELL_TO_COVER_SHARES_EXERCISED,
    FIELD_SELL_TO_COVER_AWARD_PRICE,
    FIELD_SELL_TO_COVER_SALE_PRICE,
    FIELD_SELL_TO_COVER_AWARD_TYPE,
    FIELD_SELL_TO_COVER_AWARD_DATE,
    FIELD_EMPTY,
];

function throwParsingError(received: string[], expected: string[]): never {
    console.error(`Got: "${received}", Expected: "${expected}"`);
    throw new Error('Unexpect file contents');
}

function readLine(data: string[], header: string[]): { [key in typeof header[number]]: string} {
    let line: any = {};
    data.forEach((value, index) => {
        line[header[index]] = value;
    });
    return line;
}

function parseAction(data: string): EAC.Action {
    if (Object.values(EAC.Action).includes(data as EAC.Action)) {
        return data as EAC.Action;
    }
    else throw new Error(`Unknown EAC transaction action: ${data}`);
}

function checkForUnsupportedData(history: EAC.Transaction[]) {
    const otherSharesInTheAccount = history.find((t) => "symbol" in t && t.symbol !== undefined && t.symbol !== "U");
    if (otherSharesInTheAccount !== undefined && "symbol" in otherSharesInTheAccount) {
        console.log(otherSharesInTheAccount);
        throw new Error(`Unsupported data: The account contains transactions for symbol "${otherSharesInTheAccount.symbol}". Currently only supporting Unity Technologies Inc. (U) shares.`);
    }
}

export function parseEACHistory(input: string): EAC.Transaction[] {
    const [firstLine, rest] = firstLineAndRest(input);
    if (!firstLine.startsWith("\"Transaction Details for Equity Awards Center")) {
        console.error(`Got: "${firstLine}"`);
        throw new Error('Incompatible file');
    }

    const papaOptions = { header: false, skipEmptyLines: true };
    const parsed = Papa.parse<string[]>(rest, papaOptions);

    console.debug('parse', parsed);

    if (!_.isEqual(parsed.data[0], FILE_HEADER)) {
        throwParsingError(parsed.data[0], FILE_HEADER);
    }

    const history: EAC.Transaction[] = [];
    for (let i = 1; i < parsed.data.length; i++) {
        const line = readLine(parsed.data[i], FILE_HEADER);
        const eacTransaction: any = {
            date: parseDates(line[FIELD_DATE])[0],
            action: parseAction(line[FIELD_ACTION]),
            symbol: parseSymbol(line[FIELD_SYMBOL]),
            description: line[FIELD_DESCRIPTION],
            quantity: parseQuantity(line[FIELD_QUANTITY]),
            feesUSD: parseUSD(line[FIELD_FEES]),
            amountUSD: parseUSD(line[FIELD_AMOUNT])
        }

        if (eacTransaction.action === EAC.Action.Deposit) {
            if (!_.isEqual(parsed.data[i+1], DEPOSIT_HEADER)) {
                throwParsingError(parsed.data[i+1], DEPOSIT_HEADER);
            }
            const depositDetailsLine = readLine(parsed.data[i+2], DEPOSIT_HEADER);
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

        if (eacTransaction.action === EAC.Action.Sale) {
            if (!_.isEqual(parsed.data[i+1], SALE_HEADER)) {
                throwParsingError(parsed.data[i+1], SALE_HEADER);
            }
            const saleDetailsLine = readLine(parsed.data[i+2], SALE_HEADER);
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

        if (eacTransaction.action === EAC.Action.Lapse) {
            if (!_.isEqual(parsed.data[i+1], LAPSE_HEADER)) {
                throwParsingError(parsed.data[i+1], LAPSE_HEADER);
            }
            const lapseDetailsLine = readLine(parsed.data[i+2], LAPSE_HEADER);
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

        if (eacTransaction.action === EAC.Action.ExerciseAndSell) {
            if (!_.isEqual(parsed.data[i+1], EXERCISE_AND_SELL_ROW_HEADER)) {
                throwParsingError(parsed.data[i+1], EXERCISE_AND_SELL_ROW_HEADER);
            }
            // Read 1-N exercise and sell rows
            const exerciseAndSellRows = [];
            while (_.isEqual(parsed.data[i+1], EXERCISE_AND_SELL_ROW_HEADER)) {
                const exerciseAndSellRowLine = readLine(parsed.data[i+2], EXERCISE_AND_SELL_ROW_HEADER);
                const exerciseAndSellRow = {
                    awardID: exerciseAndSellRowLine[FIELD_EXERCISE_AND_SELL_AWARD_ID],
                    sharesExercised: parseQuantity(exerciseAndSellRowLine[FIELD_EXERCISE_AND_SELL_SHARES_EXERCISED]),
                    awardPriceUSD: parseUSD(exerciseAndSellRowLine[FIELD_EXERCISE_AND_SELL_AWARD_PRICE]),
                    salePriceUSD: parseUSD(exerciseAndSellRowLine[FIELD_EXERCISE_AND_SELL_SALE_PRICE]),
                    awardType: exerciseAndSellRowLine[FIELD_EXERCISE_AND_SELL_AWARD_TYPE],
                    awardDate: parseDates(exerciseAndSellRowLine[FIELD_EXERCISE_AND_SELL_AWARD_DATE])[0],
                }
                exerciseAndSellRows.push(exerciseAndSellRow);
                i = i+2;
            }
            eacTransaction.rows = exerciseAndSellRows;

            // Read 1 summary line
            if (!_.isEqual(parsed.data[i+1], OPTIONS_DETAILS_HEADER)) {
                throwParsingError(parsed.data[i+1], OPTIONS_DETAILS_HEADER);
            }
            const optionsDetailsLine = readLine(parsed.data[i+2], OPTIONS_DETAILS_HEADER);
            const optionsDetails = {
                exerciseCostUSD: parseUSD(optionsDetailsLine[FIELD_OPTIONS_DETAILS_EXERCISE_COST]),
                grossProceedsUSD: parseUSD(optionsDetailsLine[FIELD_OPTIONS_DETAILS_GROSS_PROCEEDS]),
                netProceedsUSD: parseUSD(optionsDetailsLine[FIELD_OPTIONS_DETAILS_NET_PROCEEDS]),
            }
            eacTransaction.details = optionsDetails;
            i = i+2;
        }

        if (eacTransaction.action === EAC.Action.SellToCover) {
            if (!_.isEqual(parsed.data[i+1], SELL_TO_COVER_ROW_HEADER)) {
                throwParsingError(parsed.data[i+1], SELL_TO_COVER_ROW_HEADER);
            }
            // Read 1-N sell to cover rows
            const sellToCoverRows = [];
            while (_.isEqual(parsed.data[i+1], SELL_TO_COVER_ROW_HEADER)) {
                const sellToCoverRowLine = readLine(parsed.data[i+2], SELL_TO_COVER_ROW_HEADER);
                const sellToCoverRow = {
                    awardID: sellToCoverRowLine[FIELD_SELL_TO_COVER_AWARD_ID],
                    action: sellToCoverRowLine[FIELD_SELL_TO_COVER_ACTION],
                    sharesExercised: parseQuantity(sellToCoverRowLine[FIELD_SELL_TO_COVER_SHARES_EXERCISED]),
                    awardPriceUSD: parseUSD(sellToCoverRowLine[FIELD_SELL_TO_COVER_AWARD_PRICE]),
                    salePriceUSD: parseUSD(sellToCoverRowLine[FIELD_SELL_TO_COVER_SALE_PRICE]),
                    awardType: sellToCoverRowLine[FIELD_SELL_TO_COVER_AWARD_TYPE],
                    awardDate: parseDates(sellToCoverRowLine[FIELD_SELL_TO_COVER_AWARD_DATE])[0],
                }
                sellToCoverRows.push(sellToCoverRow);
                i = i+2;
            }
            eacTransaction.rows = sellToCoverRows;

            // Read 1 summary line
            if (!_.isEqual(parsed.data[i+1], OPTIONS_DETAILS_HEADER)) {
                throwParsingError(parsed.data[i+1], OPTIONS_DETAILS_HEADER);
            }
            const optionsDetailsLine = readLine(parsed.data[i+2], OPTIONS_DETAILS_HEADER);
            const optionsDetails = {
                exerciseCostUSD: parseUSD(optionsDetailsLine[FIELD_OPTIONS_DETAILS_EXERCISE_COST]),
                grossProceedsUSD: parseUSD(optionsDetailsLine[FIELD_OPTIONS_DETAILS_GROSS_PROCEEDS]),
                netProceedsUSD: parseUSD(optionsDetailsLine[FIELD_OPTIONS_DETAILS_NET_PROCEEDS]),
            }
            eacTransaction.details = optionsDetails;
            i = i+2;
        }

        history.push(EAC.Transaction.check(eacTransaction));
    }

    checkForUnsupportedData(history);

    return history;
}