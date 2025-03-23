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
const csvWriter = require("csv-writer");
const { Search } = require("./cryptoregex");
const path_1 = __importDefault(require("path"));
const pino_1 = __importDefault(require("pino"));
const fs_1 = __importDefault(require("fs"));
const logger = (0, pino_1.default)();
const csv_parser_1 = __importDefault(require("csv-parser"));
const writerAddress = csvWriter.createObjectCsvWriter({
    path: path_1.default.resolve(__dirname, "sheet1.csv"),
    header: [{ id: "address", title: "Address" }],
});
const addressRecordWriter = (_addresses) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(_addresses);
    const formatted = _addresses.map((addr) => ({ address: addr }));
    yield writerAddress.writeRecords(formatted);
});
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
        { id: "svc", title: "Service" },
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
    yield writerSwap.writeRecords(_swaps);
});
const baseFetch = (_url) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    try {
        response = yield fetch(_url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0",
                "App-Name": "hf2_le_exchange_search",
                "App-Version": "1.0.0",
            },
        });
        return response;
    }
    catch (error) {
        console.log("Something went wrong base fetch:", error);
        logger.info(error);
        return response;
    }
});
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
function throttleAll(tasks_1) {
    return __awaiter(this, arguments, void 0, function* (tasks, concurrency = 2, delayMs = 100) {
        const results = [];
        const executing = [];
        for (const task of tasks) {
            const p = (() => __awaiter(this, void 0, void 0, function* () {
                const result = yield task();
                results.push(result);
                yield delay(delayMs);
            }))();
            executing.push(p);
            if (executing.length >= concurrency) {
                yield Promise.race(executing);
                executing.splice(0, executing.length);
            }
        }
        yield Promise.all(executing);
        return results;
    });
}
const addresses = [];
const normalizeAddress = (addr) => addr.trim().toLowerCase();
process.on('SIGINT', function () {
    console.log("Caught interrupt signal");
    process.exit(0);
});
const fetchSwapData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (_fromAddress = null, _toAddress = null, _toCurrency = null, _fromCurrency = null, addresses) {
    const baseUrl = "https://exchange.exodus.io/v3/orders";
    let toCurrency = [];
    let fromCurrency = [];
    if (_fromAddress !== null && !addresses.includes(normalizeAddress(_fromAddress)))
        addresses.push(normalizeAddress(_fromAddress));
    if (_toAddress !== null && !addresses.includes(normalizeAddress(_toAddress)))
        addresses.push(normalizeAddress(_toAddress));
    if (_toCurrency === null && _toAddress !== null) {
        const toCoin = yield Search(_toAddress);
        if (toCoin.length > 1) {
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
        if (fromCoin.length > 1) {
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
            requests.push(baseFetch(`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fromCurrency[0]}`));
            if (_toAddress)
                console.log("URL before request TO", `${baseUrl}?toAddress=${_toAddress}&toAsset=${toCurrency[0]}`);
            requests.push(baseFetch(`${baseUrl}?toAddress=${_toAddress}&toAsset=${toCurrency[0]}`));
        }
        else {
            toCurrency.forEach((tCoin) => {
                if (tCoin !== "Not Found")
                    requests.push(baseFetch(`${baseUrl}?toAddress=${_toAddress}&toAsset=${tCoin}`));
            });
            fromCurrency.forEach((fCoin) => {
                if (fCoin !== "Not Found")
                    requests.push(baseFetch(`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fCoin}`));
            });
        }
        const responses = yield Promise.all(requests);
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
        const mergedData = Object.values(allResults.reduce((acc, item) => {
            acc[item.providerOrderId] = item;
            return acc;
        }, {}));
        yield swapsRecordWriter(mergedData);
        for (const data of mergedData) {
            const newAddresses = [normalizeAddress(data.toAddress), normalizeAddress(data.fromAddress)];
            const allProcessed = newAddresses.every(addr => addresses.includes(addr));
            if (allProcessed) {
                console.log("\n\n ====> ✅ All addresses already logged, writing addresses then exiting.... \n\n");
                yield addressRecordWriter([...new Set(addresses)]);
                console.log("\n\n Unique Addresses written: ", addresses.length);
                process.exit(1);
            }
            if (data.toAddress && !addresses.includes(normalizeAddress(data.toAddress))) {
                addresses.push(normalizeAddress(data.toAddress));
            }
            if (data.fromAddress && !addresses.includes(normalizeAddress(data.fromAddress))) {
                addresses.push(normalizeAddress(data.fromAddress));
            }
            yield (0, exports.fetchSwapData)(data.fromAddress || null, data.toAddress || null, data.to || null, data.from || null, addresses);
        }
    }
    catch (error) {
        console.log("====> Something went wrong with that call", error.message);
        logger.info(error);
        process.exit(1);
    }
});
exports.fetchSwapData = fetchSwapData;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const timerAnimation = (function () {
            var P = ["[\\]", "[|]", "[/]", "[-]"];
            var start = 0;
            return setInterval(function () {
                process.stdout.write("\r" + P[start++]);
                start &= 3;
            }, 150);
        })();
        const args = process.argv.slice(2);
        console.log("\n\n ===> Running search with arguments: ", args);
        let csv_file_path = null;
        let _fromAddress = null;
        let _toAddress = null;
        let _toCurrency = null;
        let _fromCurrency = null;
        if (args.length < 1) {
            console.error(`
\n\n ====> Run this command to search, replacing bracketed values. *One address required* 👇:
-------------
npm run hf2_le_exchange_search <fromAddress> <toAddress> <toCurrency> <fromCurrency>
-------------
        `);
            process.exit(1);
        }
        else if (args.length === 1) {
            csv_file_path = args[0];
        }
        else if (args.length === 2) {
            _fromAddress = args[1];
            _toAddress = args[1];
        }
        else {
            [csv_file_path, _fromAddress, _toAddress, _toCurrency, _fromCurrency] = args.map(arg => arg === '' ? null : arg);
        }
        const allPromises = [];
        try {
            if (csv_file_path !== null) {
                fs_1.default.createReadStream(csv_file_path)
                    .pipe((0, csv_parser_1.default)())
                    .on('data', (row) => __awaiter(this, void 0, void 0, function* () {
                    console.log("\n\n ==> Searching address: ", row.ADDRESS);
                    allPromises.push((0, exports.fetchSwapData)(row.ADDRESS, null, null, null, addresses));
                }))
                    .on('end', () => __awaiter(this, void 0, void 0, function* () {
                    console.log('\n\n ====> CSV file successfully processed');
                    yield addressRecordWriter(addresses);
                    console.log('\n\n ====> ✅ Unique addresses written to file:', addresses.length);
                }));
            }
            else {
                yield (0, exports.fetchSwapData)(_fromAddress || null, _toAddress || null, _toCurrency || null, _fromCurrency || null, addresses || []);
            }
        }
        catch (e) {
            console.log(`=====> There was an issue with that CSV read: ${e}`);
        }
    });
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map