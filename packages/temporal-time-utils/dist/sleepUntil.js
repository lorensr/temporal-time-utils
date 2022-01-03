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
exports.sleepUntil = void 0;
const wf = __importStar(require("@temporalio/workflow"));
const differenceInMilliseconds_1 = __importDefault(require("date-fns/differenceInMilliseconds"));
/**
 * Simple utility to sleep until a specific datetime instead of sleep for number of milliseconds.
 * Uses date-fns/differenceInMilliseconds to calculate the diff.
 *
 * @param futureDate future Date to wake up at. give a string if you prefer
 * @param fromDate optional - Date to start from, if not today
 * @returns wf.sleep with the right number of milliseconds
 */
function sleepUntil(futureDate, fromDate = new Date()) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeUntilDate = (0, differenceInMilliseconds_1.default)(new Date(futureDate), fromDate);
        return wf.sleep(timeUntilDate);
    });
}
exports.sleepUntil = sleepUntil;
