import { EAC } from '../calculator/types';
import { parseDates, parseQuantity, parseSymbol, parseUSD } from './parseUtils';

const FIELD_DATE = 'Date';
const FIELD_ACTION = 'Action';
const FIELD_SYMBOL = 'Symbol';
const FIELD_DESCRIPTION = 'Description';
const FIELD_QUANTITY = 'Quantity';
const FIELD_FEES = 'FeesAndCommissions';
// const FIELD_DISB_ELECTION = "DisbursementElection";
const FIELD_AMOUNT = 'Amount';

const FIELD_DEPOSIT_PURCHASE_DATE = 'PurchaseDate';
const FIELD_DEPOSIT_PURCHASE_PRICE = 'PurchasePrice';
const FIELD_DEPOSIT_SUBSCRIPTION_DATE = 'SubscriptionDate';
const FIELD_DEPOSIT_SUBSCRIPTION_FMV = 'SubscriptionFairMarketValue';
const FIELD_DEPOSIT_PURCHASE_FMV = 'PurchaseFairMarketValue';

const FIELD_SALE_TYPE = 'Type';
const FIELD_SALE_SHARES = 'Shares';
const FIELD_SALE_SALE_PRICE = 'SalePrice';
const FIELD_SALE_SUBSCRIPTION_DATE = 'SubscriptionDate';
const FIELD_SALE_SUBSCRIPTION_FMV = 'SubscriptionFairMarketValue';
const FIELD_SALE_PURCHASE_DATE = 'PurchaseDate';
const FIELD_SALE_PURCHASE_PRICE = 'PurchasePrice';
const FIELD_SALE_PURCHASE_FMV = 'PurchaseFairMarketValue';
// const FIELD_SALE_DISPOSITION_TYPE = 'DispositionType';
// const FIELD_SALE_GRANT_ID = 'GrantId';
// const FIELD_SALE_VEST_DATE = 'VestDate';
// const FIELD_SALE_VEST_FMV = 'VestFairMarketValue';
const FIELD_SALE_GROSS_PROCEEDS = 'GrossProceeds';

const FIELD_LAPSE_AWARD_DATE = 'AwardDate';
const FIELD_LAPSE_AWARD_ID = 'AwardId';
const FIELD_LAPSE_AWARD_FMV = 'FairMarketValuePrice';
const FIELD_LAPSE_AWARD_SALE_PRICE = 'SalePrice';
const FIELD_LAPSE_AWARD_SHARES_SOLD = 'SharesSoldWithheldForTaxes';
const FIELD_LAPSE_AWARD_SHARES_DEPOSITED = 'NetSharesDeposited';
const FIELD_LAPSE_AWARD_TOTAL_TAX = 'Taxes';

// TODO: Add JSON parsing for options transactions
/*
// "","Award ID","Shares Exercised","Award Price","Sale Price","Award Type","Award Date",
const FIELD_EXERCISE_AND_SELL_AWARD_ID = 'Award ID';
const FIELD_EXERCISE_AND_SELL_SHARES_EXERCISED = 'Shares Exercised';
const FIELD_EXERCISE_AND_SELL_AWARD_PRICE = 'Award Price';
const FIELD_EXERCISE_AND_SELL_SALE_PRICE = 'Sale Price';
const FIELD_EXERCISE_AND_SELL_AWARD_TYPE = 'Award Type';
const FIELD_EXERCISE_AND_SELL_AWARD_DATE = 'Award Date';

// "","Exercise Cost","Taxes","Gross Proceeds","Net Proceeds",
const FIELD_OPTIONS_DETAILS_EXERCISE_COST = 'Exercise Cost';
const FIELD_OPTIONS_DETAILS_TAXES = 'Taxes';
const FIELD_OPTIONS_DETAILS_GROSS_PROCEEDS = 'Gross Proceeds';
const FIELD_OPTIONS_DETAILS_NET_PROCEEDS = 'Net Proceeds';

// "","Award Id","Action","Shares Exercised","Award Price","Sale Price","Award Type","Award Date",
const FIELD_SELL_TO_COVER_AWARD_ID = 'Award Id';
const FIELD_SELL_TO_COVER_ACTION = 'Action';
const FIELD_SELL_TO_COVER_SHARES_EXERCISED = 'Shares Exercised';
const FIELD_SELL_TO_COVER_AWARD_PRICE = 'Award Price';
const FIELD_SELL_TO_COVER_SALE_PRICE = 'Sale Price';
const FIELD_SELL_TO_COVER_AWARD_TYPE = 'Award Type';
const FIELD_SELL_TO_COVER_AWARD_DATE = 'Award Date';
*/

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
    const schwabData = JSON.parse(input);

    const history: EAC.Transaction[] = [];
    for (const line of schwabData.Transactions) {
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
            const depositDetailsLine = line.TransactionDetails[0].Details;
            const depositDetails = {
                purchaseDate: parseDates(depositDetailsLine[FIELD_DEPOSIT_PURCHASE_DATE])[0],
                purchasePriceUSD: parseUSD(depositDetailsLine[FIELD_DEPOSIT_PURCHASE_PRICE]),
                subscriptionDate: parseDates(depositDetailsLine[FIELD_DEPOSIT_SUBSCRIPTION_DATE])[0],
                subscriptionFMVUSD: parseUSD(depositDetailsLine[FIELD_DEPOSIT_SUBSCRIPTION_FMV]),
                purchaseFMVUSD: parseUSD(depositDetailsLine[FIELD_DEPOSIT_PURCHASE_FMV]),  
            }
            eacTransaction.depositDetails = depositDetails;
        }

        if (eacTransaction.action === EAC.Action.Sale) {
            // Read 1-N sale details rows
            const saleDetailsRows = [];
            for (let saleDetailsRowLine of line.TransactionDetails) {
                saleDetailsRowLine = saleDetailsRowLine.Details;
                const saleDetailsRow = {
                    type: saleDetailsRowLine[FIELD_SALE_TYPE],
                    shares: parseQuantity(saleDetailsRowLine[FIELD_SALE_SHARES]),
                    salePriceUSD: parseUSD(saleDetailsRowLine[FIELD_SALE_SALE_PRICE]),
                    subscriptionDate: parseDates(saleDetailsRowLine[FIELD_SALE_SUBSCRIPTION_DATE])[0],
                    subscriptionFMVUSD: parseUSD(saleDetailsRowLine[FIELD_SALE_SUBSCRIPTION_FMV]),
                    purchaseDate: parseDates(saleDetailsRowLine[FIELD_SALE_PURCHASE_DATE])[0],
                    purchasePriceUSD: parseUSD(saleDetailsRowLine[FIELD_SALE_PURCHASE_PRICE]),
                    purchaseFMVUSD: parseUSD(saleDetailsRowLine[FIELD_SALE_PURCHASE_FMV]),
                    grossProceedsUSD: parseUSD(saleDetailsRowLine[FIELD_SALE_GROSS_PROCEEDS]),
                }
                saleDetailsRows.push(saleDetailsRow);
            }
            eacTransaction.rows = saleDetailsRows;
        }

        if (eacTransaction.action === EAC.Action.Lapse) {
            const lapseDetailsLine = line.TransactionDetails[0].Details;
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
        }

        if (eacTransaction.action === EAC.Action.ForcedQuickSell) {
            // Read 1-N sale details rows
            const forcedQuickSellDetailsRows = [];
            for (let detailsRowLine of line.TransactionDetails) {
                detailsRowLine = detailsRowLine.Details;
                const saleDetailsRow = {
                    type: detailsRowLine[FIELD_SALE_TYPE],
                    shares: parseQuantity(detailsRowLine[FIELD_SALE_SHARES]),
                    salePriceUSD: parseUSD(detailsRowLine[FIELD_SALE_SALE_PRICE]),
                    subscriptionDate: parseDates(detailsRowLine[FIELD_SALE_SUBSCRIPTION_DATE])[0],
                    subscriptionFMVUSD: parseUSD(detailsRowLine[FIELD_SALE_SUBSCRIPTION_FMV]),
                    purchaseDate: parseDates(detailsRowLine[FIELD_SALE_PURCHASE_DATE])[0],
                    purchasePriceUSD: parseUSD(detailsRowLine[FIELD_SALE_PURCHASE_PRICE]),
                    purchaseFMVUSD: parseUSD(detailsRowLine[FIELD_SALE_PURCHASE_FMV]),
                    grossProceedsUSD: parseUSD(detailsRowLine[FIELD_SALE_GROSS_PROCEEDS]),
                }
                forcedQuickSellDetailsRows.push(saleDetailsRow);
            }
            eacTransaction.rows = forcedQuickSellDetailsRows;
        }

        // TODO: Add JSON parsing for options transactions
        /*
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
        */

        history.push(EAC.Transaction.check(eacTransaction));
    }

    checkForUnsupportedData(history);

    return history;
}