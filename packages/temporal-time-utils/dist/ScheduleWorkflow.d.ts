import * as wf from '@temporalio/workflow';
import { WithWorkflowArgs, Workflow, WorkflowResultType } from '@temporalio/common';
import parser from 'cron-parser';
export declare const numInvocationsQuery: import("@temporalio/common").QueryDefinition<unknown, []>;
export declare const futureScheduleQuery: import("@temporalio/common").QueryDefinition<unknown, []>;
export declare const manualTriggerSignal: import("@temporalio/common").SignalDefinition<[]>;
export declare type ScheduleWorkflowState = 'RUNNING' | 'PAUSED' | 'STOPPED';
export declare const stateSignal: import("@temporalio/common").SignalDefinition<[ScheduleWorkflowState]>;
export declare const stateQuery: import("@temporalio/common").QueryDefinition<ScheduleWorkflowState, []>;
export declare type ScheduleOptions = {
    cronParser: {
        expression: string;
        options?: parser.ParserOptions;
    };
    maxInvocations?: number;
    jitterMs?: number;
};
export declare type ScheduleWorkflowOptions<T extends wf.Workflow = wf.Workflow> = WithWorkflowArgs<T, wf.ChildWorkflowOptions>;
export declare function ScheduleWorkflow<T extends Workflow>(workflowToSchedule: string, workflowOptions: ScheduleWorkflowOptions<T>, scheduleOptions: ScheduleOptions, invocations?: number): Promise<WorkflowResultType<T>>;
export declare function ScheduleWorkflow<T extends Workflow>(workflowToSchedule: T, workflowOptions: ScheduleWorkflowOptions<T>, scheduleOptions: ScheduleOptions, invocations?: number): Promise<WorkflowResultType<T>>;
