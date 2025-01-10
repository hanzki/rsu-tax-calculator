import { expect, describe, it } from 'vitest'
import * as Calculator from './index';
import { ForfeitureEvent, LotMatch, matchLots } from './util';

const newLot = (
    quantity: number,
    purchaseDate: Date,
    purchasePriceUSD: number = 10,
    symbol: string = 'U'
): Calculator.Lot => ({quantity, purchaseDate, purchasePriceUSD, symbol})

const newForfeitureEvent = (
    quantity: number,
    date: Date,
): ForfeitureEvent => ({quantity, date})

const newLotMatch = (
    lot: Calculator.Lot,
    forfeitureEvent: ForfeitureEvent,
    quantity?: number
): LotMatch => {
    if (quantity === undefined) quantity = forfeitureEvent.quantity
    return {lot, forfeitureEvent, quantity}
}

describe('Calculator utils', () => {
    beforeAll(() => {
        // Mock Date.toLocaleDateString to avoid locale specific date strings
        const toLocaleDateString = Date.prototype.toLocaleDateString;
        Date.prototype.toLocaleDateString = function(locale: any = 'en-US', ...args : any[]) {
          return toLocaleDateString.call(this, locale, ...args);
        };
    });

    describe('matchLots', () => {
        describe('default cases', () => {
            describe('when given empty inputs', () => {
                const lots: Calculator.Lot[] = [];
                const events: ForfeitureEvent[] = [];
                it('returns an empty array', () => {
                    expect(matchLots(lots, events)).toEqual([]);
                })
            })
            describe('when given empty events', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 3, 1))
                ];
                const events: ForfeitureEvent[] = [];
                it('returns an empty array', () => {
                    expect(matchLots(lots, events)).toEqual([]);
                })
            })
        })
        describe('error cases', () => {
            describe('when missing lots', () => {
                const lots: Calculator.Lot[] = [];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 1))
                ];
                it('throws an error', () => {
                    expect(() => matchLots(lots, events)).toThrow("Couldn't match stock forfeiture event on 4/1/2023 to a lot");
                })
            })
            describe('when lots are after event date', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 3, 2))
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 1))
                ];
                it('throws an error', () => {
                    expect(() => matchLots(lots, events)).toThrow("Couldn't match stock forfeiture event on 4/1/2023 to a lot");
                })
            })
            describe('when lots are insuffiencent for all events', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 2, 1))
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 1)),
                    newForfeitureEvent(10, new Date(2023, 3, 5))
                ];
                it('throws an error', () => {
                    expect(() => matchLots(lots, events)).toThrow("Couldn't match stock forfeiture event on 4/5/2023 to a lot");
                })
            })
        })
        describe('simple cases', () => {
            describe('when given one lot and event', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 2, 1))
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 1))
                ];
                const expected = [
                    newLotMatch(lots[0], events[0])
                ]
                it('returns correct matching', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
            })
            describe('when given two lots and one event', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 2, 1)),
                    newLot(10, new Date(2023, 3, 1))
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 1))
                ];
                const expected = [
                    newLotMatch(lots[0], events[0])
                ]
                it('returns correct matching', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
            })
            describe('when given one lot and two event', () => {
                const lots: Calculator.Lot[] = [
                    newLot(20, new Date(2023, 2, 1))
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 1)),
                    newForfeitureEvent(10, new Date(2023, 3, 5))
                ];
                const expected = [
                    newLotMatch(lots[0], events[0]),
                    newLotMatch(lots[0], events[1]),
                ]
                it('returns correct matching', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
            })
            describe('when given two lots and two event', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 2, 1)),
                    newLot(10, new Date(2023, 3, 1)),
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 1)),
                    newForfeitureEvent(10, new Date(2023, 3, 5))
                ];
                const expected = [
                    newLotMatch(lots[0], events[0]),
                    newLotMatch(lots[1], events[1]),
                ]
                it('returns correct matching', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
            })
        })
        describe('complex cases', () => {
            describe('when given out of order inputs', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 3, 1)),
                    newLot(10, new Date(2023, 2, 1))
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(10, new Date(2023, 3, 5)),
                    newForfeitureEvent(10, new Date(2023, 3, 1))
                ];
                const expected = [
                    newLotMatch(lots[1], events[1]),
                    newLotMatch(lots[0], events[0]),
                ]
                it('sorts them correctly', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
            })
            describe('when one event is matched to two lots', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 2, 1)),
                    newLot(10, new Date(2023, 3, 1)),
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(20, new Date(2023, 3, 1))
                ];
                const expected = [
                    newLotMatch(lots[0], events[0], 10),
                    newLotMatch(lots[1], events[0], 10),
                ]
                it('returns correct matching', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
            })
            describe('when one event is matched to three lots', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 1, 1)),
                    newLot(10, new Date(2023, 2, 1)),
                    newLot(10, new Date(2023, 3, 1)),
                ];
                const events: ForfeitureEvent[] = [
                    newForfeitureEvent(30, new Date(2023, 3, 1))
                ];
                const expected = [
                    newLotMatch(lots[0], events[0], 10),
                    newLotMatch(lots[1], events[0], 10),
                    newLotMatch(lots[2], events[0], 10),
                ]
                it('returns correct matching', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
            })
            describe('when using custom event type', () => {
                const lots: Calculator.Lot[] = [
                    newLot(10, new Date(2023, 1, 1)),
                ];
                interface MyEvent extends ForfeitureEvent {
                    foobar: string
                }
                const events: MyEvent[] = [
                    {
                        ...newForfeitureEvent(10, new Date(2023, 3, 1)),
                        foobar: 'TEST',
                    }
                ];
                const expected = [
                    newLotMatch(lots[0], events[0], 10),
                ]
                it('returns correct matching', () => {
                    expect(matchLots(lots, events)).toEqual(expected);
                })
                it('passes custom fields correctly', () => {
                    expect(matchLots(lots, events)[0].forfeitureEvent.foobar).toEqual('TEST');
                })
            })
        })
    })
})