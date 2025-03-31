"use strict";
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
exports.swapsRecordWriter = exports.addressRecordWriter = void 0;
const csvWriter = require("csv-writer");
const path_1 = __importDefault(require("path"));
const writerAddress = csvWriter.createObjectCsvWriter({
    path: path_1.default.resolve(__dirname, "sheet1.csv"),
    header: [{ id: "address", title: "Address" }],
});
const addressRecordWriter = (_addresses) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(_addresses);
    const formatted = _addresses.map((addr) => ({ address: addr }));
    yield writerAddress.writeRecords(formatted);
});
exports.addressRecordWriter = addressRecordWriter;
const writerSwap = csvWriter.createObjectCsvWriter({
    path: path_1.default.resolve(__dirname, "sheet2.csv"),
    header: [
        { id: "createdAt", title: "Created At" },
        { id: "providerOrderId", title: "Order ID" },
        { id: "pairId", title: "Pair" },
        { id: "fromAddress", title: "From Address" },
        { id: "fromTransactionId", title: "From Transaction ID" },
        { id: "toAddress", title: "To Address" },
        { id: "toTransactionId", title: "To Transaction ID" },
        { id: "id", title: "Swap ID" },
        { id: "message", title: "Message" },
        { id: "payInAddress", title: "Pay-In Address" },
        { id: "rateId", title: "Rate ID" },
        { id: "status", title: "Status" },
        { id: "updatedAt", title: "Updated At" },
        { id: "amount", title: "Amount" },
        { id: "toAmount", title: "To Amount" },
        { id: "svc", title: "Provider" },
        { id: "from", title: "From" },
        { id: "to", title: "To" },
        { id: "fromAmt", title: "From Amount" },
        { id: "fromAmtStr", title: "From Amount String" },
        { id: "fromAmtUSD", title: "From Amount (USD)" },
        { id: "toAmt", title: "To Amount" },
        { id: "toAmtStr", title: "To Amount String" },
        { id: "toAmtUSD", title: "To Amount (USD)" },
        { id: "svcResponse", title: "Service Response" },
        { id: "svcStatus", title: "Service Status" },
        { id: "fromSource", title: "From Source" },
        { id: "refundTx", title: "Refund Transaction" },
        { id: "btn", title: "Button" },
        { id: "error", title: "Error" },
        { id: "clientBuild", title: "Client Build" },
        { id: "clientVer", title: "Client Version" },
    ],
});
const swapsRecordWriter = (_swaps) => __awaiter(void 0, void 0, void 0, function* () {
    const formatted = _swaps.map((swap) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return (Object.assign(Object.assign({}, swap), { from: (_a = swap.amount) === null || _a === void 0 ? void 0 : _a.assetId, to: (_b = swap.toAmount) === null || _b === void 0 ? void 0 : _b.assetId, fromAmt: (_c = swap.amount) === null || _c === void 0 ? void 0 : _c.value, fromAmtStr: (_d = swap.amount) === null || _d === void 0 ? void 0 : _d.value, fromAmtUSD: (_e = swap.amount) === null || _e === void 0 ? void 0 : _e.value, toAmt: (_f = swap.toAmount) === null || _f === void 0 ? void 0 : _f.value, toAmtStr: (_g = swap.toAmount) === null || _g === void 0 ? void 0 : _g.value, toAmtUSD: (_h = swap.toAmount) === null || _h === void 0 ? void 0 : _h.value, amount: `${(_j = swap.amount) === null || _j === void 0 ? void 0 : _j.value} ${(_k = swap.amount) === null || _k === void 0 ? void 0 : _k.assetId}`, toAmount: `${(_l = swap.toAmount) === null || _l === void 0 ? void 0 : _l.value} ${(_m = swap.toAmount) === null || _m === void 0 ? void 0 : _m.assetId}` }));
    });
    yield writerSwap.writeRecords(formatted);
});
exports.swapsRecordWriter = swapsRecordWriter;
//# sourceMappingURL=writers.js.map