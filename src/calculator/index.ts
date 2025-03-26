import { isBefore, isEqual } from "date-fns";
import _ from "lodash";
import { ECBConverter } from "../ecbRates";
import { isWithinAWeek, sortChronologicalBy, sortReverseChronologicalBy } from "../util";
import { EAC, Individual } from "./types";
import { ForfeitureEvent, matchLots } from "./util";
import { createESPPTaxReport, createTaxReport } from "./report";

export interface TaxSaleOfSecurity {
    symbol: string,
    quantity: number,
    saleDate: Date,
    purchaseDate: Date,
    salePriceUSD: number,
    salePriceEUR: number,
    saleFeesUSD: number,
    saleFeesEUR: number,
    saleUSDEURRate: number,
    purchasePriceUSD: number,
    purchasePriceEUR: number,
    purchaseFeesUSD: number,
    purchaseFeesEUR: number,
    purchaseUSDEURRate: number,
    deemedAcquisitionCostEUR: number, // hankintameno-olettama
    capitalGainEUR: number,
    capitalLossEUR: number,
    isESPP: boolean
}

export type StockTransaction = Individual.SellTransaction | Individual.StockPlanActivityTransaction | Individual.SecurityTransferTransaction;

const isStockPlanActivityTransaction = (t: Individual.Transaction): t is Individual.StockPlanActivityTransaction => t.action === Individual.Action.StockPlanActivity;
const isSellTransaction = (t: Individual.Transaction): t is Individual.SellTransaction => t.action === Individual.Action.Sell;
const isSecurityTransferTransaction = (t: Individual.Transaction): t is Individual.SecurityTransferTransaction => t.action === Individual.Action.SecurityTransfer;
const isStockTransaction = (t: Individual.Transaction): t is StockTransaction => isSellTransaction(t) || isStockPlanActivityTransaction(t) || isSecurityTransferTransaction(t);

type OptionSaleTransaction = EAC.ExerciseAndSellTransaction | EAC.SellToCoverTransaction;

const isLapseTransaction = (t: EAC.Transaction): t is EAC.LapseTransaction => t.action === EAC.Action.Lapse;
const isExerciseAndSellTransaction = (t: EAC.Transaction): t is EAC.ExerciseAndSellTransaction => t.action === EAC.Action.ExerciseAndSell;
const isSellToCoverTransaction = (t: EAC.Transaction): t is EAC.SellToCoverTransaction => t.action === EAC.Action.SellToCover;
const isSaleTransaction = (t: EAC.Transaction): t is EAC.SaleTransaction => t.action === EAC.Action.Sale;
const isForcedQuickSellTransaction = (t: EAC.Transaction): t is EAC.SaleTransaction => t.action === EAC.Action.ForcedQuickSell;
const isOptionSaleTransaction = (t: EAC.Transaction): t is OptionSaleTransaction => isExerciseAndSellTransaction(t) || isSellToCoverTransaction(t);

const isSellToCoverSellRow = (r: EAC.SellToCoverTransaction['rows'][number]): r is EAC.SellToCoverSellRow => r.action === EAC.SellToCoverAction.Sell;
const isSellToCoverHoldRow = (r: EAC.SellToCoverTransaction['rows'][number]): r is EAC.SellToCoverHoldRow => r.action === EAC.SellToCoverAction.Hold;

/**
 * Filters out all transactions which are not related to moving of stocks
 * 
 * @param individualHistory list of transactions to be filtered
 * @returns a list of transactions with only transactions related to gain or loss of stocks
 */
export function filterStockTransactions(individualHistory: Individual.Transaction[]): StockTransaction[] {
    return individualHistory.filter(isStockTransaction);
}


/**
 * Filters out receiving and selling of shares related to selling options. These transactions
 * do not follow FIFO order and do not need to be considered when calculating capital income.
 * 
 * @param stockTransactions list of stock transactions from individual history
 * @param eacHistory full Equity Awards Center history
 * @returns a list of stock transactions without transactions related to selling of options
 */
export function filterOutOptionSales(stockTransactions: StockTransaction[], eacHistory: EAC.Transaction[]): StockTransaction[] {
    const optionSaleTransactions = eacHistory.filter(isOptionSaleTransaction);
    const filteredTransactions = [...stockTransactions];

    for (const optionSaleTransaction of optionSaleTransactions) {
        // Find gain&sell pairs for the same day
        const gainAndSellPairs = gainAndSellPairsForADay(filteredTransactions, optionSaleTransaction.date);
        const matchingPairs = pairsMatchingToOptionSale(gainAndSellPairs, optionSaleTransaction);
        const flatMatchingPairs: StockTransaction[] = _.flatten(matchingPairs);

        _.remove(filteredTransactions, t => flatMatchingPairs.includes(t));
    }
    return filteredTransactions;
}

type GainAndSell = [Individual.StockPlanActivityTransaction, Individual.SellTransaction];

function gainAndSellPairsForADay(stockTransactions: StockTransaction[], date: Date): GainAndSell[] {
    const gainAndSellPairs: GainAndSell[] = [];
    const transactionsForTheDay = stockTransactions.filter(t => isEqual(t.date, date));
    const gainTransactions = transactionsForTheDay.filter(isStockPlanActivityTransaction);
    const sellTransactions = transactionsForTheDay.filter(isSellTransaction);

    for (const gainTransaction of gainTransactions) {
        const matchingSell = sellTransactions.find(t => gainTransaction.quantity === t.quantity);
        if (matchingSell !== undefined) {
            _.remove(sellTransactions, t => t === matchingSell);
            gainAndSellPairs.push([gainTransaction, matchingSell]);
        }
    }

    return gainAndSellPairs;
}

function pairsMatchingToOptionSale(gainAndSellPairs: GainAndSell[], optionSale: OptionSaleTransaction): GainAndSell[] {
    const exerciseAndSellRows = (optionSale.action === EAC.Action.ExerciseAndSell) ? optionSale.rows : [];
    const sellToCoverRows = (optionSale.action === EAC.Action.SellToCover) ? optionSale.rows.filter(isSellToCoverSellRow): [];
    const unmatchedOptionSaleRows = [...exerciseAndSellRows, ...sellToCoverRows];
    const easPrices = _.uniq(unmatchedOptionSaleRows.map(r => r.salePriceUSD));

    const isValidMatching = (pairs: GainAndSell[], rows: typeof unmatchedOptionSaleRows): boolean => {
        // Total number of shares should match
        if (_.sumBy(pairs, ([g,]) => g.quantity) !== _.sumBy(rows, r => r.sharesExercised)) {
            return false;
        }

        // Each row should match to a single pair, however one pair might have multiple rows
        if (pairs.length > rows.length) {
            return false;
        }

        // TODO: This logic is probably not completely exhaustive
        return true;
    }

    const matchedPairs: GainAndSell[] = [];

    for (const price of easPrices) {
        const easRows = unmatchedOptionSaleRows.filter(r => r.salePriceUSD === price);
        const pairs = gainAndSellPairs.filter(([,sell]) => sell.priceUSD === price);

        const candidates: GainAndSell[][] = [[]];
        for (const pair of pairs) {
            const previousCandidates = [...candidates];
            for (const candidate of previousCandidates) {
                candidates.push([...candidate, pair]);
            }
        }
        console.log({pairs, candidates});

        const validMatch = candidates.find(candidate => isValidMatching(candidate, easRows));
        if (validMatch === undefined) {
            throw new Error(`Couldn't find a matching for Exercise and Sell ${optionSale.date} for salePrice ${price}`);
        }
        console.log('Found matching pairs', validMatch, easRows);
        matchedPairs.push(...validMatch);
    }

    return matchedPairs;
}

export type TransactionWithCostBasis = {
    transaction: Individual.SellTransaction,
    purchaseDate: Date,
    purchasePriceUSD: number,
    quantity: number,
}

export interface Lot {
    symbol: string,
    quantity: number,
    purchaseDate: Date,
    purchasePriceUSD: number,
}

/**
 * Calculates historical lots of shares received. For each lot the function calculates the number of shares
 * received on the date and the purchase price for the shares. Multiple shares received on the same date and
 * purchase price are merged into one lot.
 * 
 * @param stockTransactions list of stock transactions from individual history. See {@link filterStockTransactions}.
 * @param eacHistory full Equity Awards Center history
 * @returns list of Lots
 */
export function buildLots(stockTransactions: StockTransaction[], eacHistory: EAC.Transaction[]): Lot[] {
    const spaTransactions = stockTransactions.filter(isStockPlanActivityTransaction);
    const lots: Lot[] = [];
    for (const spaTransaction of spaTransactions) {
        const lapseTransaction = findLapseTransaction(spaTransaction, eacHistory);
        const sellToCoverTransaction = findSellToCoverTransaction(spaTransaction, eacHistory);
        if (lapseTransaction !== undefined) {
            lots.push({
                symbol: spaTransaction.symbol,
                quantity: spaTransaction.quantity,
                purchaseDate: lapseTransaction.date,
                purchasePriceUSD: lapseTransaction.lapseDetails.fmvUSD,
            })
        }
        else if (sellToCoverTransaction !== undefined) {
            lots.push({
                symbol: spaTransaction.symbol,
                quantity: spaTransaction.quantity,
                purchaseDate: sellToCoverTransaction.date,
                purchasePriceUSD: sellToCoverTransaction.rows.find(isSellToCoverHoldRow)?.awardPriceUSD || 0, // TODO: This is probably not the correct purchase price. We should use the FMV price instead.
            })
        }
        else {
            console.debug("Unmatched spaTransaction", spaTransaction);
            const transactionDate = spaTransaction.date.toLocaleDateString();
            throw new Error(`Could not match Stock Plan Activity on ${transactionDate} to Lapse or Sell To Cover transaction`);
        }

    }

    // Merge lots with same date and price
    const mergedLots = lots.reduce((acc: Lot[], lot: Lot) => {
        if (!acc.length) return [lot];
        const prev = acc[acc.length - 1];
        if (isEqual(prev.purchaseDate, lot.purchaseDate) && prev.purchasePriceUSD === lot.purchasePriceUSD) {
            const merged = {...prev, quantity: prev.quantity + lot.quantity};
            return [...acc.slice(0,-1), merged];
        }
        return [...acc, lot];
    }, []);

    return mergedLots;
}

/**
 * Finds the correct Lapse transaction from EAC history which corresponds to the shares gained in
 * spaTransaction.
 * @param spaTransaction transaction for gain of shares in Individual history
 * @param eacHistory full EAC History
 */
function findLapseTransaction(spaTransaction: Individual.StockPlanActivityTransaction, eacHistory: EAC.Transaction[]): EAC.LapseTransaction | undefined {
    const sortedLapseTransactions = eacHistory.filter(isLapseTransaction).sort(sortReverseChronologicalBy(t => t.date));
    
    const isBeforeOrEqualSPA = (lapseTransaction: EAC.LapseTransaction) => isBefore(lapseTransaction.date, spaTransaction.date) || isEqual(lapseTransaction.date, spaTransaction.date);
    const quantityMatchesSPA = (lapseTransaction: EAC.LapseTransaction) =>
        spaTransaction.quantity === lapseTransaction.lapseDetails.sharesDeposited
        || spaTransaction.quantity === lapseTransaction.lapseDetails.sharesSold

    const lapseTransaction = sortedLapseTransactions.find(lt => isBeforeOrEqualSPA(lt) && quantityMatchesSPA(lt));

    //if (!lapseTransaction) throw new Error('Could not match to lapse');
    return lapseTransaction;
}

function findSellToCoverTransaction(spaTransaction: Individual.StockPlanActivityTransaction, eacHistory: EAC.Transaction[]): EAC.SellToCoverTransaction | undefined {
    const sellToCoverTransactions = eacHistory.filter(isSellToCoverTransaction);

    const isCloseToSPA = (sellToCoverTransaction: EAC.SellToCoverTransaction) => isWithinAWeek(spaTransaction.date, sellToCoverTransaction.date);
    const quantityMatchesSPA = (sellToCoverTransaction: EAC.SellToCoverTransaction) => 
        sellToCoverTransaction.rows.filter(isSellToCoverHoldRow).some(r => r.sharesExercised === spaTransaction.quantity);

    const sellToCoverTransaction = sellToCoverTransactions.find(sct => isCloseToSPA(sct) && quantityMatchesSPA(sct));
    return sellToCoverTransaction;
}

/**
 * Links share losing transactions to the correct lots in order to calculate the correct purchase price.
 * The shares are sold in the First-In First-Out (FIFO) order. In case one lot is not enough to cover for
 * the whole sale transaction the transaction will be split to two parts in the output.
 * 
 * @param stockTransactions list of stock transactions from individual history. See {@link filterStockTransactions}.
 * @param lots list of lots. See {@link buildLots}
 * @returns list of transactions linked with the correct purchase prices. One transaction from input might get
 * split to multiple transactions in the output.
 */
export function calculateCostBases(stockTransactions: StockTransaction[], lots: Lot[]): TransactionWithCostBasis[] {
    const salesTransactions = stockTransactions.filter(isSellTransaction);
    const outboundStockTransferTransactions = stockTransactions.filter(isSecurityTransferTransaction).filter(t => t.quantity < 0);
    const stockForfeitingTransactions = [...salesTransactions, ...outboundStockTransferTransactions];

    // Outgoing security transfer transactions have negative quantity. We want to use
    // the absolute value instead in order to align the logic with sell transactions
    // which have positive quantity values.
    const absQuantity = (t: StockTransaction) => Math.abs(t.quantity);

    interface StockForfeitingTransaction extends ForfeitureEvent {
        transaction: StockTransaction
    }

    const forfeitureEvents: StockForfeitingTransaction[] = stockForfeitingTransactions.map(t => ({
        date: t.date,
        quantity: absQuantity(t),
        transaction: t
    }));

    const lotMatches = matchLots(lots, forfeitureEvents);
    const results: TransactionWithCostBasis[] = lotMatches
        .filter(m => isSellTransaction(m.forfeitureEvent.transaction))
        .map(m => ({
            transaction: m.forfeitureEvent.transaction as Individual.SellTransaction,
            purchaseDate: m.lot.purchaseDate,
            purchasePriceUSD: m.lot.purchasePriceUSD,
            quantity: m.quantity,
        }))

    return results;
}

export type ESPPTransactionWithCostBasis = {
    transaction: EAC.SaleTransaction,
    purchaseDate: Date,
    purchasePriceUSD: number,
    quantity: number,
}

export function calculateESPPSales(eacHistory: EAC.Transaction[]): ESPPTransactionWithCostBasis[] {
    const esppSaleTransactions = eacHistory.filter(isSaleTransaction);
    const esppForcedQuickSellTransactions = eacHistory.filter(isForcedQuickSellTransaction);
    const combinedTransactions = [...esppSaleTransactions, ...esppForcedQuickSellTransactions];
    return combinedTransactions.reduce<ESPPTransactionWithCostBasis[]>((results, esppSaleTransaction) => {
        results.push(...esppSaleTransaction.rows.map( detailsRow => ({
            transaction: esppSaleTransaction,
            purchaseDate: detailsRow.purchaseDate,
            purchasePriceUSD: getCorrectESPPCostBasis(detailsRow.purchaseFMVUSD, detailsRow.purchasePriceUSD),
            quantity: detailsRow.shares,
        })));
        return results;
    }, []);
}

/**
 * Calculates the correct cost basis for ESPP sales. Because of Finnish tax law at most 10% discount
 * of the FMV for ESPP purchases is tax free for earned income, however this "tax free" portion needs to
 * be deducted from the purchase price in order to calculate the correct cost basis. Thus the 10% discount
 * is taxed as capital income at the time of sale.
 * 
 * @param purchaseFMV FMV at the time of the ESPP purchase
 * @param purchasePrice price paid for the ESPP shares
 */
function getCorrectESPPCostBasis(purchaseFMV: number, purchasePrice: number): number {
    const maxTaxFreeDiscount = purchaseFMV * 0.1;
    return Math.max(purchasePrice, purchaseFMV - maxTaxFreeDiscount);
}

export function calculateTaxes(
    individualHistory: Individual.Transaction[],
    eacHistory: EAC.Transaction[],
    ecbConverter: ECBConverter
    ): TaxSaleOfSecurity[] {
        // Filter out non-stock transactions
        const stockTransactions = filterStockTransactions(individualHistory);

        const transactionsWithoutOptionSales = filterOutOptionSales(stockTransactions, eacHistory);

        // Build list of lots
        const lots = buildLots(transactionsWithoutOptionSales, eacHistory);

        // Calculate correct cost basis
        const transactionsWithCostBasis = calculateCostBases(transactionsWithoutOptionSales, lots);

        const esppTransactionsWithCostBasis = calculateESPPSales(eacHistory);

        // Create tax report
        const taxReport = createTaxReport(transactionsWithCostBasis, ecbConverter);

        // Create ESPP tax report
        const esppReport = createESPPTaxReport(esppTransactionsWithCostBasis, ecbConverter);

        const combinedReport = [...taxReport, ...esppReport].sort(sortChronologicalBy(row => row.saleDate));

        return combinedReport;
    }
