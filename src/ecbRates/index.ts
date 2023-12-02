import { format, isMatch, sub } from "date-fns";
import { isNumber } from "lodash";
import * as Papa from 'papaparse';

const ECB_DATA_URL = '/service/data/EXR/D.USD.EUR.SP00.A?format=csvdata&startPeriod=2020-01-01&detail=dataonly';
const FIELD_TIME_PERIOD = 'TIME_PERIOD';
const FIELD_OBS_VALUE = 'OBS_VALUE';

type ECBRow = {
    [FIELD_TIME_PERIOD]: string,
    [FIELD_OBS_VALUE]: string,
}

function validateDate(input: string): string {
    if (!isMatch(input, 'yyyy-MM-dd')) {
        throw new Error(`Malformed date: ${input}`)
    }
    return input;
}

function validateRate(input: string): number {
    const number = Number(input);
    if (!isNumber(number)){
        throw new Error(`Malformed exchange rate: ${input}`)
    }
    return number;
}

export class ECBConverter {
    rates: Map<string,number>;
    Date = Date;

    constructor (rates: Map<string,number>) {
        this.rates = rates;
    }

    usdToEUR(usdValue: number, date: Date = new this.Date()): number {
        const rate = this.usdToEURRate(date);
        return usdValue * rate;
    }

    usdToEURRate(date: Date = new this.Date()): number {
        const dateKey = format(date, 'yyyy-MM-dd');

        let eurToUSDRate = this.rates.get(dateKey);
        console.debug(`EUR-USD (${dateKey}): ${eurToUSDRate}`);

        if (!eurToUSDRate) {
            let nlookback = 1;
            while (!eurToUSDRate && nlookback <= 3) {
                const previousDate = sub(date, { days: nlookback });
                const previousDateKey = format(previousDate, 'yyyy-MM-dd');
                eurToUSDRate = this.rates.get(previousDateKey);
                if (eurToUSDRate) {
                    console.debug(`EUR-USD (${dateKey}): undefined, using EUR-USD (${previousDateKey}): ${eurToUSDRate}`);
                }
                nlookback++;
            }
            if (!eurToUSDRate) {
                throw new Error(`No exchange rate for ${dateKey}`);
            }
        }

        return 1 / eurToUSDRate;
    }

    static async loadECBData(): Promise<ECBConverter> {
        const ecbRatesData: Papa.ParseResult<ECBRow> = await new Promise((resolve, reject) => {
            Papa.parse(ECB_DATA_URL, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: resolve,
                error: reject
            })
        });

        console.debug('ecbRatesData', ecbRatesData);
        
        const rates = new Map<string,number>();
        ecbRatesData.data.forEach(row => {
            const validDate = validateDate(row[FIELD_TIME_PERIOD]);
            const validRate = validateRate(row[FIELD_OBS_VALUE]);
            rates.set(validDate, validRate);
        });

        return new ECBConverter(rates);
    }
}