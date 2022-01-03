/**
 * Simple utility to sleep until a specific datetime instead of sleep for number of milliseconds.
 * Uses date-fns/differenceInMilliseconds to calculate the diff.
 *
 * @param futureDate future Date to wake up at. give a string if you prefer
 * @param fromDate optional - Date to start from, if not today
 * @returns wf.sleep with the right number of milliseconds
 */
export declare function sleepUntil(futureDate: Date | string, fromDate?: Date): Promise<void>;
