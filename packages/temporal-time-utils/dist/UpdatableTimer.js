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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _UpdatableTimer_deadline;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatableTimer = void 0;
const wf = __importStar(require("@temporalio/workflow"));
// // example usage
// export async function countdownWorkflow(): Promise<void> {
//   const target = Date.now() + 24 * 60 * 60 * 1000; // 1 day!!!
//   const timer = new UpdatableTimer(target);
//   console.log('timer set for: ' + new Date(target).toString());
//   wf.setListener(setDeadlineSignal, (deadline) => {
//     // send in new deadlines via Signal
//     timer.deadline = deadline;
//     console.log('timer now set for: ' + new Date(deadline).toString());
//   });
//   wf.setListener(timeLeftQuery, () => timer.deadline - Date.now());
//   await timer; // if you send in a signal with a new time, this timer will resolve earlier!
//   console.log('countdown done!');
// }
/**
 * A timer that can be updated with a new deadline.
 */
class UpdatableTimer {
    constructor(deadline) {
        this.deadlineUpdated = false;
        _UpdatableTimer_deadline.set(this, void 0);
        __classPrivateFieldSet(this, _UpdatableTimer_deadline, deadline, "f");
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            /* eslint-disable no-constant-condition */
            while (true) {
                this.deadlineUpdated = false;
                if (!(yield wf.condition(() => this.deadlineUpdated, __classPrivateFieldGet(this, _UpdatableTimer_deadline, "f") - Date.now()))) {
                    break;
                }
            }
        });
    }
    then(onfulfilled, onrejected) {
        return this.run().then(onfulfilled, onrejected);
    }
    set deadline(value) {
        __classPrivateFieldSet(this, _UpdatableTimer_deadline, value, "f");
        this.deadlineUpdated = true;
    }
    get deadline() {
        return __classPrivateFieldGet(this, _UpdatableTimer_deadline, "f");
    }
}
exports.UpdatableTimer = UpdatableTimer;
_UpdatableTimer_deadline = new WeakMap();
