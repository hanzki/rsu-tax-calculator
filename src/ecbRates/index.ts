import { format, isMatch } from "date-fns";
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

    constructor (rates: Map<string,number>) {
        this.rates = rates;
    }

    usdToEUR(usdValue: number, date: Date = new Date): number {
        const dateKey = format(date, 'yyyy-MM-dd');

        const eurToUSDRate = this.rates.get(dateKey);
        console.debug(`USD-EUR (${dateKey}): ${eurToUSDRate}`);

        if (!eurToUSDRate) {
            throw new Error(`No exchange rate for ${dateKey}`);
        }

        return usdValue / eurToUSDRate;
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