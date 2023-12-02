import { Lot } from ".";
import { sortChronologicalBy } from "../util";

/**
 * ForfeitureEvent represents an event when shares were removed from the account.
 * This can be for example a sale or an outgoing transfer.
 */
export interface ForfeitureEvent {
    date: Date,
    quantity: number
}

export interface LotMatch<E extends ForfeitureEvent = ForfeitureEvent> {
    lot: Lot,
    forfeitureEvent: E,
    quantity: number
}

/**
 * Matches a list of forfeiture events to correct lots. One forfeiture event can be matched
 * to one or multiple lots. Also multiple forfeiture events can be matched to the same lot.
 * @param lots List of received lots of shares
 * @param forfeitureEvents List of forfeiture events like sales or outgoing transfers
 * @returns List of lot matches between lots and forfeiture events.
 */
export function matchLots<E extends ForfeitureEvent>(lots: Lot[], forfeitureEvents: E[]): LotMatch<E>[] {
    const chronologicalEvents = [...forfeitureEvents].sort(sortChronologicalBy(t => t.date));
    const chrologicalLots = [...lots].sort(sortChronologicalBy(t => t.purchaseDate));

    const lotIterator = chrologicalLots.values();
    let currentLot: Lot = lotIterator.next().value;
    let sharesMatchedFromLot = 0;

    const results: LotMatch<E>[] = []

    const throwMissingLotError = () => { throw new Error("Couldn't match sell to a lot"); };
    const currentLotIsValid = (evet: E) => currentLot && currentLot.purchaseDate <= evet.date;

    const findMatch = (
        currentLot: Lot,
        event: E,
        sharesMatchedFromLot: number,
        sharesMatchedFromEvent: number
    ): LotMatch<E> => {
        if (!currentLotIsValid(event)) throwMissingLotError();
        const lotSharesLeft = currentLot.quantity - sharesMatchedFromLot;
        const eventSharesLeft = event.quantity - sharesMatchedFromEvent;
        const quantity = Math.min(lotSharesLeft, eventSharesLeft);
        return {
            lot: currentLot,
            forfeitureEvent: event,
            quantity
        }
    }

    for (const forfeitureEvent of chronologicalEvents) {
        let sharesMatchedFromEvent = 0;
        while(forfeitureEvent.quantity > sharesMatchedFromEvent) {
            const match = findMatch(currentLot, forfeitureEvent, sharesMatchedFromLot, sharesMatchedFromEvent);
            sharesMatchedFromEvent += match.quantity;
            
            // iterate the current lot if all shares from the previous lot were matched
            if(match.quantity + sharesMatchedFromLot >= currentLot.quantity) {
                currentLot = lotIterator.next().value;
                sharesMatchedFromLot = 0;
            } else {
                sharesMatchedFromLot += match.quantity;
            }
            results.push(match)
        }
    }

    return results;
}