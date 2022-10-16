export class YMD {
    year: number;
    month: number;
    day: number;

    constructor(year: number, month: number, day: number) {
        this.year = year;
        this.month = month;
        this.day = day;
    }

    toString = () => {
        const yearStr = String(this.year);
        const monthStr = String(this.month);
        const dayStr = String(this.day);
        const paddedMonthStr = this.month < 10 ? '0' + monthStr : monthStr;
        const paddedDayStr = this.day < 10 ? '0' + dayStr : dayStr;
        return `${yearStr}-${paddedMonthStr}-${paddedDayStr}`;
    }

    isBefore = (other: YMD) => YMD.compare(this, other) < 0;
    isAfter = (other: YMD) => YMD.compare(this, other) > 0;

    static compare(a: YMD, b: YMD) {
        if (a.year < b.year) {
            return -1;
        }
        if (a.year > b.year) {
            return 1;
        }
        if (a.month < b.month) {
            return -1;
        }
        if (a.month > b.month) {
            return 1;
        }
        if (a.day < b.day) {
            return -1;
        }
        if (a.day > b.day) {
            return 1;
        }
        return 0;
    }
}



