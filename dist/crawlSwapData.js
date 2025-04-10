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
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlSwapData = void 0;
const fetchSwapData_1 = require("./fetchSwapData");
const writers_1 = require("./writers");
const crawlSwapData = (from, to, toAsset, fromAsset) => __awaiter(void 0, void 0, void 0, function* () {
    let addresses = [];
    let seenSwaps = new Set();
    const [discovered1, seen1] = yield (0, fetchSwapData_1.fetchSwapData)(from, to, toAsset, fromAsset, addresses, seenSwaps);
    addresses = [...new Set([...addresses, ...discovered1])];
    seenSwaps = seen1;
    console.log("\n ==================================== \n ==================================== \n Second fetch swap \n ==================================== \n ==================================== \n");
    const [discovered2, seen2] = yield (0, fetchSwapData_1.fetchSwapData)(null, from, toAsset, fromAsset, addresses, seenSwaps);
    addresses = [...new Set([...addresses, ...discovered2])];
    seenSwaps = seen2;
    console.log("\n\n ====> ✅ All recursion complete, writing addresses \n\n");
    yield (0, writers_1.addressRecordWriter)([...new Set(addresses)]);
    console.log("\n\n Unique Addresses written: ", addresses.length);
    return true;
});
exports.crawlSwapData = crawlSwapData;
//# sourceMappingURL=crawlSwapData.js.map