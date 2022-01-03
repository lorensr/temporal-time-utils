"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleWorkflow = exports.stateQuery = exports.stateSignal = exports.manualTriggerSignal = exports.futureScheduleQuery = exports.numInvocationsQuery = void 0;
const wf = __importStar(require("@temporalio/workflow"));
const cron_parser_1 = __importDefault(require("cron-parser"));
const differenceInMilliseconds_1 = __importDefault(require("date-fns/differenceInMilliseconds"));
const sleepUntil_1 = require("./sleepUntil");
// queries
exports.numInvocationsQuery = wf.defineQuery('numInvocationsQuery');
exports.futureScheduleQuery = wf.defineQuery('futureScheduleQuery');
exports.manualTriggerSignal = wf.defineSignal('manualTriggerSignal');
exports.stateSignal = wf.defineSignal('stateSignal');
exports.stateQuery = wf.defineQuery('stateQuery');
function ScheduleWorkflow(workflowToSchedule, workflowOptions, scheduleOptions, invocations = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        // signal and query handlers
        wf.setHandler(exports.numInvocationsQuery, () => invocations);
        wf.setHandler(exports.manualTriggerSignal, () => 
        // note that we increment invocations after call
        wf.executeChild(workflowToSchedule, Object.assign({ args: workflowOptions.args, workflowId: `scheduled-${invocations++}-${nextTime.toString()}` }, workflowOptions)));
        let scheduleWorkflowState = 'RUNNING';
        wf.setHandler(exports.stateQuery, () => scheduleWorkflowState);
        wf.setHandler(exports.stateSignal, (state) => void (scheduleWorkflowState = state));
        const interval = cron_parser_1.default.parseExpression(scheduleOptions.cronParser.expression, scheduleOptions.cronParser.options);
        const nextTime = interval.next().toString();
        wf.setHandler(exports.futureScheduleQuery, (numEntriesInFutureSchedule) => {
            const interval = cron_parser_1.default.parseExpression(scheduleOptions.cronParser.expression, scheduleOptions.cronParser.options); // reset interval
            return {
                futureSchedule: genNextTimes(numEntriesInFutureSchedule, () => interval.next().toString()),
                timeLeft: (0, differenceInMilliseconds_1.default)(new Date(nextTime), new Date()),
            };
        });
        // timer logic
        try {
            yield (0, sleepUntil_1.sleepUntil)(nextTime);
            if (scheduleOptions.jitterMs) {
                yield wf.sleep(Math.floor(Math.random() * (scheduleOptions.jitterMs + 1)));
            }
            if (scheduleWorkflowState === 'PAUSED') {
                yield wf.condition(() => scheduleWorkflowState === 'RUNNING');
            }
            wf.executeChild(workflowToSchedule, Object.assign({ args: workflowOptions.args, workflowId: `scheduled-${invocations}-${nextTime.toString()}` }, workflowOptions
            // // regular workflow options apply here, with two additions (defaults shown):
            // cancellationType: ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
            // parentClosePolicy: ParentClosePolicy.PARENT_CLOSE_POLICY_TERMINATE
            ));
            if (scheduleOptions.maxInvocations && scheduleOptions.maxInvocations > invocations) {
                yield wf.continueAsNew(workflowToSchedule, workflowOptions, scheduleOptions, invocations + 1);
            }
            else {
                scheduleWorkflowState = 'STOPPED';
            }
        }
        catch (err) {
            if (wf.isCancellation(err))
                scheduleWorkflowState = 'STOPPED';
            else
                throw err;
        }
    });
}
exports.ScheduleWorkflow = ScheduleWorkflow;
// shared
function genNextTimes(number = 5, getNextTimes) {
    const times = [];
    for (let i = 0; i < number; i++) {
        times.push(getNextTimes());
    }
    return times;
}
