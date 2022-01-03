/**
 * A timer that can be updated with a new deadline.
 */
export declare class UpdatableTimer implements PromiseLike<void> {
    #private;
    deadlineUpdated: boolean;
    constructor(deadline: number);
    private run;
    then<TResult1 = void, TResult2 = never>(onfulfilled?: (value: void) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): PromiseLike<TResult1 | TResult2>;
    set deadline(value: number);
    get deadline(): number;
}
