import * as wf from '@temporalio/workflow';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';

/**
 * Simple utility to sleep until a specific datetime instead of sleep for number of milliseconds.
 * Uses date-fns/differenceInMilliseconds to calculate the diff.
 * 
 * @param futureDate future Date to wake up at. give a string if you prefer
 * @param fromDate optional - Date to start from, if not today
 * @returns wf.sleep with the right number of milliseconds
 */
 export async function sleepUntil(futureDate: Date | string, fromDate: Date = new Date()) {
  const timeUntilDate = differenceInMilliseconds(
    new Date(futureDate),
    fromDate
  );
  return wf.sleep(timeUntilDate);
}