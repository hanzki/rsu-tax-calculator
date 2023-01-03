import { EAC, Individual } from "../calculator/types";
import { Subset } from "../util";

export namespace IndividualHistoryData {
    export function spaTransaction(overrides?: Subset<Individual.StockPlanActivityTransaction>): Individual.StockPlanActivityTransaction {
        return {
            date: new Date(2021, 7, 26),
            action: 'Stock Plan Activity',
            symbol: 'U',
            description: 'UNITY SOFTWARE INC',
            quantity: 50,
            ...overrides,
        } as Individual.StockPlanActivityTransaction
    }

    export function sellTransaction(overrides?: Subset<Individual.SellTransaction>): Individual.SellTransaction {
        return {
            date: new Date(2021, 7, 26),
            action: 'Sell',
            symbol: 'U',
            description: 'UNITY SOFTWARE INC',
            quantity: 50,
            priceUSD: 100,
            feesUSD: 0.03,
            amountUSD: 4999.97,
            ...overrides,
        } as Individual.SellTransaction
    }

    export function journalTransaction(overrides?: Subset<Individual.JournalTransaction>): Individual.JournalTransaction {
        return {
            date: new Date(2021, 7, 26),
            action: 'Journal',
            description: 'Gencash transaction for SPS RS Lapse Tool',
            amountUSD: -4999.97,
            ...overrides,
        } as Individual.JournalTransaction
    }

    export function securityTransferTransaction(overrides?: Subset<Individual.SecurityTransferTransaction>): Individual.SecurityTransferTransaction {
        return {
            date: new Date(2021, 7, 26),
            action: Individual.Action.SecurityTransfer,
            symbol: 'U',
            description: 'UNITY SOFTWARE INC',
            quantity: 50,
            ...overrides,
        } as Individual.SecurityTransferTransaction
    }
} 

export namespace EACHistoryData {
    export function lapseTransaction(overrides?: Subset<EAC.LapseTransaction>): EAC.LapseTransaction {
        return {
            date: new Date(2021, 7, 25),
            action: EAC.Action.Lapse,
            symbol: 'U',
            description: 'Restricted Stock Lapse',
            quantity: 500,
            ...overrides,
            lapseDetails: {
                awardDate:  new Date(2020, 6, 20),
                awardID: 'XXXXX',
                fmvUSD: 40.2,
                salePriceUSD: 36.5,
                sharesSold: 50,
                sharesDeposited: 450,
                totalTaxesUSD: 1820,
                ...overrides?.lapseDetails,
            },
        } as EAC.LapseTransaction
    }

    export function exerciseAndSellTransaction(overrides?: Subset<EAC.ExerciseAndSellTransaction>): EAC.ExerciseAndSellTransaction {
        return {
            date: new Date(2021, 7, 25),
            action: EAC.Action.ExerciseAndSell,
            symbol: 'U',
            description: 'Option Exercise',
            quantity: 500,
            feesUSD: 1,
            amountUSD: 3499,
            rows: [
                {
                    awardID: 'XXXXX',
                    sharesExercised: 250,
                    awardPriceUSD: 2.5,
                    salePriceUSD: 9.5,
                    awardType: 'XX',
                    awardDate: new Date(2015, 9, 1)
                },
                {
                    awardID: 'XXXXX',
                    sharesExercised: 250,
                    awardPriceUSD: 2.5,
                    salePriceUSD: 9.5,
                    awardType: 'XX',
                    awardDate: new Date(2015, 9, 1)
                },
            ],
            ...overrides,
            details: {
                exerciseCostUSD: 1250,
                grossProceedsUSD: 4750,
                netProceedsUSD: 3499,
            }
        } as EAC.ExerciseAndSellTransaction
    }
}