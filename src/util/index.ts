import { compareAsc, compareDesc, isWithinInterval, sub } from "date-fns";

export type Subset<K> = {
    [attr in keyof K]?: K[attr] extends object
        ? Subset<K[attr]>
        : K[attr] extends object | null
        ? Subset<K[attr]> | null
        : K[attr] extends object | null | undefined
        ? Subset<K[attr]> | null | undefined
        : K[attr];
};

export function sortChronologicalBy<T>(f: (x: T) => Date) {
    return (a: T, b: T) => compareAsc(f(a), f(b));
}

export function sortReverseChronologicalBy<T>(f: (x: T) => Date) {
    return (a: T, b: T) => compareDesc(f(a), f(b));
}

/**
 * Checks if the date A and B is within a week from each other.
 * Date A must be the more recent of the two.
 */
export function isWithinAWeek(dateA: Date, dateB: Date): boolean {
    return isWithinInterval(dateB, {
        start: sub(dateA, { days: 7 }),
        end: dateA,
    });
}



