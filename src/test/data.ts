import { EACTransaction, IndividualTransaction } from "../calculator";
import { Subset } from "../util";

export namespace IndividualHistoryData {
    export function spaTransaction(overrides?: Subset<IndividualTransaction>): IndividualTransaction {
        return {
            date: new Date(2021, 7, 26),
            action: 'Stock Plan Activity',
            symbol: 'U',
            description: 'UNITY SOFTWARE INC',
            quantity: 50,
            ...overrides,
        } as IndividualTransaction
    }

    export function sellTransaction(overrides?: Subset<IndividualTransaction>): IndividualTransaction {
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
        } as IndividualTransaction
    }

    export function journalTransaction(overrides?: Subset<IndividualTransaction>): IndividualTransaction {
        return {
            date: new Date(2021, 7, 26),
            action: 'Journal',
            symbol: 'U',
            description: 'Gencash transaction for SPS RS Lapse Tool',
            quantity: 0,
            amountUSD: -4999.97,
            ...overrides,
        } as IndividualTransaction
    }
} 

export namespace EACHistoryData {
    export function lapseTransaction(overrides?: Subset<EACTransaction>): EACTransaction {
        return {
            date: new Date(2021, 7, 25),
            action: 'Lapse',
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
        } as EACTransaction
    }
}