import * as _ from 'lodash';

export function firstLineAndRest(input: string): [string, string] {
    const lineEndIndex = input.indexOf('\n');
    const firstLine = input.substring(0, lineEndIndex);
    const rest = input.substring(lineEndIndex + 1);
    return [firstLine, rest];
}
export function parseDates(dateString: string): Date[] {
    const dateRegex = /\d\d\/\d\d\/\d\d\d\d/g; // MM/DD/YYYY
    const dates = dateString.match(dateRegex);

    if (!dates?.length || dates.length < 1) {
        console.error(`Couldn't parse dates from "${dateString}"`);
        throw new Error("Invalid Date");
    }

    const parseDate = (str: string): Date => new Date(str);

    return dates.map(parseDate);
}
export function parseQuantity(quantityString: string): number | undefined {
    if (quantityString === '') return undefined;

    const quantity = Number(quantityString.replace(/,/g, ''));
    if (!_.isInteger(quantity)) {
        console.error(`Unexpected quantity value: "${quantityString}"`);
        throw new Error("Invalid Quantity");
    }
    return quantity;
}

export function parseUSD(usdString: string): number | undefined {
    if (usdString === '') return undefined;

    const usdValue = Number(usdString.replace(/[$,]/g, ''));
    if (!_.isNumber(usdValue)) {
        console.error(`Unexpected USD value: "${usdString}"`);
        throw new Error("Invalid USD Value");
    }
    return usdValue;
}

export function parseSymbol(symbolString: string): string | undefined {
    if (symbolString === '') return undefined;
    return symbolString;
}
