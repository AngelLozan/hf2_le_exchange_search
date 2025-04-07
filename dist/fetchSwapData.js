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
exports.fetchSwapData = void 0;
const { Search } = require("./cryptoregex");
const writers_1 = require("./writers");
const index_1 = require("./index");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const readline = require('readline');
function waitForEnter(promptText = 'Press Enter to continue...') {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(promptText, () => {
            rl.close();
            resolve();
        });
    });
}
const fetchSwapData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (_fromAddress = null, _toAddress = null, _toCurrency = null, _fromCurrency = null, addresses, seenSwaps) {
    var _a, _b;
    const baseUrl = process.env.NODE_ENV === 'test'
        ? 'https://exchange-s.exodus.io/v3/orders'
        : 'https://exchange.exodus.io/v3/orders';
    const providerDataUrl = 'https://exchange.exodus.io/v3/provider-orders';
    let toCurrency = [];
    let fromCurrency = [];
    if (_toAddress == null) {
        _toAddress = _fromAddress;
    }
    if (_toCurrency === null && _toAddress !== null) {
        const toCoin = yield Search(_toAddress);
        if (typeof toCoin === 'object') {
            console.log("===> Checking all EVM assets for TO asset");
            for (const tC of toCoin) {
                toCurrency.push(tC.toUpperCase());
            }
        }
        else {
            console.log("===> TO asset: ", toCoin);
            toCurrency.push(toCoin.toUpperCase());
        }
    }
    else {
        if (_toCurrency !== null)
            toCurrency.push(_toCurrency.toUpperCase());
    }
    if (_fromCurrency === null && _fromAddress !== null) {
        const fromCoin = yield Search(_fromAddress);
        if (typeof fromCoin === 'object') {
            console.log("===> Checking all EVM assets for FROM asset");
            for (const fC of fromCoin) {
                fromCurrency.push(fC.toUpperCase());
            }
        }
        else {
            console.log("===> FROM COIN: ", fromCoin);
            fromCurrency.push(fromCoin.toUpperCase());
        }
    }
    else {
        if (_fromCurrency !== null)
            fromCurrency.push(_fromCurrency.toUpperCase());
    }
    let requests = [];
    try {
        if (toCurrency.length === 1 && fromCurrency.length === 1) {
            if (_fromAddress)
                console.log("URL before request FROM", `${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fromCurrency[0]}`);
            requests.push((0, index_1.baseFetch)(`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fromCurrency[0]}`));
            if (_toAddress)
                console.log("URL before request TO", `${baseUrl}?toAddress=${_toAddress}&toAsset=${toCurrency[0]}`);
            requests.push((0, index_1.baseFetch)(`${baseUrl}?toAddress=${_toAddress}&toAsset=${toCurrency[0]}`));
        }
        else {
            toCurrency.forEach((tCoin) => {
                if (tCoin !== "Not Found")
                    if (_toAddress !== '' && _toAddress !== null) {
                        requests.push((0, index_1.baseFetch)(`${baseUrl}?toAddress=${_toAddress}&toAsset=${tCoin}`));
                    }
            });
            fromCurrency.forEach((fCoin) => {
                if (fCoin !== "Not Found")
                    if (_fromAddress !== '' && _fromAddress !== null) {
                        requests.push((0, index_1.baseFetch)(`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fCoin}`));
                    }
            });
        }
        console.log(`\n\n ======> Number of requests to be made: ${requests.length} \n\n`);
        const wrappedRequests = requests.map((r, i) => {
            return () => __awaiter(void 0, void 0, void 0, function* () {
                console.log(`🚀 Starting request [${i + 1}/${requests.length}]`);
                try {
                    const res = yield r;
                    console.log(`✅ Request [${i + 1}] completed with status: ${res === null || res === void 0 ? void 0 : res.status}`);
                    return res;
                }
                catch (error) {
                    console.error(`❌ Request [${i + 1}] failed:`, error);
                    return null;
                }
            });
        });
        const responses = yield (0, index_1.throttleAll)(wrappedRequests, 6, 100);
        const dataArrays = yield Promise.all(responses.map((res) => __awaiter(void 0, void 0, void 0, function* () {
            if (res && res.status === 200) {
                const json = yield res.json();
                return json;
            }
            else {
                console.log("===> Swap data not found or response error");
                return null;
            }
        })));
        const allResults = dataArrays.flat().filter(Boolean);
        console.log(`\n\n ====> Fetched ${dataArrays.flat().length} swaps \n\n`);
        console.log(`\n======================\n\n ====> SWAPS: \n ${JSON.stringify(dataArrays.flat(), null, 2)} \n\n=================================\n`);
        const mergedData = Object.values(allResults.reduce((acc, item) => {
            acc[item.providerOrderId] = item;
            return acc;
        }, {}));
        console.log(`\n\n =======> Merged Data length (swaps removing duplicates by providerOrderId): ${mergedData.length}\n\n`);
        console.log(`\n\n =====> Merged Data: \n ${JSON.stringify(mergedData, null, 2)} \n\n`);
        yield Promise.all(mergedData.map((swap) => __awaiter(void 0, void 0, void 0, function* () {
            const providerOrderId = swap.providerOrderId;
            const svcRes = yield (0, index_1.baseFetch)(`${providerDataUrl}/${providerOrderId}`);
            const svcResJson = yield (svcRes === null || svcRes === void 0 ? void 0 : svcRes.json());
            if (svcResJson.status !== 404) {
                swap.svc = svcResJson.provider.slug;
            }
            else {
                swap.svc = 'Not Found';
            }
        })));
        console.log(`\n\n =====> Seen swaps length: \n ${seenSwaps.size} \n\n`);
        console.log('\n\n ====> Seen Swaps:', [...seenSwaps], '\n\n');
        const uniqueSwaps = mergedData.filter((data) => !seenSwaps.has(data.providerOrderId));
        console.log(`\n\n =====> Unique swaps length (mergedData - seenSwaps with same oid):\n${uniqueSwaps.length}\n\n`);
        console.log(`\n\n =====> Unique swaps:\n${JSON.stringify(uniqueSwaps, null, 2)}\n\n`);
        if (uniqueSwaps.length === 0) {
            console.log("\n\n ===> No new swaps found. Checking for more swaps from new address, if any ...\n\n ========================================================== \n");
            return [addresses, seenSwaps];
        }
        uniqueSwaps.forEach((data) => seenSwaps.add(data.providerOrderId));
        console.log(`\n\n =====> Seen swaps after adding unique swaps: \n ${seenSwaps.size} \n\n`);
        console.log(`\n\n ====> Writing merged data to sheet, records: ${uniqueSwaps.length} \n\n`);
        yield (0, writers_1.swapsRecordWriter)(uniqueSwaps);
        console.log("\n ================================================ \n Iterating through all unique swaps \n ================================================ \n");
        for (const data of uniqueSwaps) {
            const newAddresses = [data.fromAddress, data.toAddress];
            const unseen = newAddresses.filter((addr) => !addresses.includes(addr));
            if (unseen.length === 0) {
                console.log("\n\n ====> No unique addresses found. \n\n");
                continue;
            }
            unseen.forEach((addr) => addresses.push(addr));
            console.log(`====> 🆕 New addresses discovered: ${unseen.join(", ")} \n`);
            yield (0, exports.fetchSwapData)(data.fromAddress || null, data.toAddress || null, ((_a = data.toAmount) === null || _a === void 0 ? void 0 : _a.assetId) || null, ((_b = data.amount) === null || _b === void 0 ? void 0 : _b.assetId) || null, addresses, seenSwaps);
        }
        console.log("\n\n ====> Unique Addresses: ", addresses.length);
        return [addresses, seenSwaps];
    }
    catch (error) {
        console.log("====> Something went wrong with that call", error.message);
        logger.info(error);
        process.exit(1);
    }
});
exports.fetchSwapData = fetchSwapData;
//# sourceMappingURL=fetchSwapData.js.map