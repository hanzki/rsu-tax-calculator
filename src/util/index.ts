import { compareAsc } from "date-fns";

export type Subset<K> = {
    [attr in keyof K]?: K[attr] extends object
        ? Subset<K[attr]>
        : K[attr] extends object | null
        ? Subset<K[attr]> | null
        : K[attr] extends object | null | undefined
        ? Subset<K[attr]> | null | undefined
        : K[attr];
};

export function sortChronologicalBy(f: (x: any) => Date) {
    return (a: any, b: any) => compareAsc(f(a), f(b));
}



