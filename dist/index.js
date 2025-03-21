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
const logger = (0, pino_1.default)();
const writerAddress = csvWriter.createObjectCsvWriter({
    path: path_1.default.resolve(__dirname, "sheet1.csv"),
    header: [{ id: "address", title: "Address" }],
});
const addressRecordWriter = (_addresses) => __awaiter(void 0, void 0, void 0, function* () {
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
const fetchSwapData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (_fromAddress = null, _toAddress = null, _toCurrency = null, _fromCurrency = null) {
    const baseUrl = "https://exchange.exodus.io/v3/orders";
    let addresses = [];
    let toCurrency = [];
    let fromCurrency = [];
    if (_toCurrency === null && _toAddress !== null) {
        const toCoin = yield Search(_toAddress);
        console.log("===> TO COIN: ", toCoin);
        toCurrency.push(toCoin.toUpperCase());
    }
    else {
        if (_toCurrency !== null)
            toCurrency.push(_toCurrency.toUpperCase());
    }
    if (_fromCurrency === null && _fromAddress !== null) {
        const fromCoin = yield Search(_fromAddress);
        console.log("===> FROM COIN: ", fromCoin);
        fromCurrency.push(fromCoin.toUpperCase());
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
                console.log("Fetched data chunk:", JSON.stringify(json, null, 2));
                return json;
            }
            else {
                console.log("Swap data not found or response error");
                return null;
            }
        })));
        const allResults = dataArrays.flat().filter(Boolean);
        console.log("\n\n DATA ARRAYS: ", dataArrays.flat());
        const mergedData = Object.values(allResults.reduce((acc, item) => {
            acc[item.providerOrderId] = item;
            return acc;
        }, {}));
        yield swapsRecordWriter(mergedData);
        for (const data of mergedData) {
            if (data.toAddress !== null &&
                data.toAddress !== "" &&
                data.toAddress !== undefined &&
                !addresses.includes(data.toAddress)) {
                addresses.push(data.toAddress);
            }
            if (data.fromAddress !== null &&
                data.fromAddress !== "" &&
                data.fromAddress !== undefined &&
                !addresses.includes(data.fromAddress)) {
                addresses.push(data.fromAddress);
            }
            const toCheck = [data.toAddress, data.fromAddress];
            const allFound = toCheck.every(addr => addresses.includes(addr));
            if (allFound) {
                console.log("\n\n✅ All addresses already logged, writing addresses then exiting.... \n\n");
                yield addressRecordWriter(addresses);
                process.exit(1);
            }
            else if (data.toAddress && data.fromAddress) {
                yield (0, exports.fetchSwapData)(data.fromAddress, data.toAddress, data.to, data.from);
            }
            else if (data.toAddress && !data.fromAddress) {
                yield (0, exports.fetchSwapData)(null, data.toAddress, data.to, null);
            }
            else if (!data.toAddress && data.fromAddress) {
                yield (0, exports.fetchSwapData)(data.fromAddress, null, null, data.from);
            }
            else {
                console.log("No more remaining pairs");
            }
        }
    }
    catch (error) {
        console.log("Something went wrong with that call", error.message);
        logger.info(error);
    }
});
exports.fetchSwapData = fetchSwapData;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        console.log(args);
        let _fromAddress = null;
        let _toAddress = null;
        let _toCurrency = null;
        let _fromCurrency = null;
        if (args.length < 1) {
            console.error(`
Run this command to search, replacing bracketed values. *One address required* 👇:
-------------
npm run hf2_le_exchange_search <fromAddress> <toAddress> <toCurrency> <fromCurrency>
-------------
        `);
            process.exit(1);
        }
        else if (args.length < 2) {
            _fromAddress = args[0];
            _toAddress = args[0];
        }
        else {
            [_fromAddress, _toAddress, _toCurrency, _fromCurrency] = args;
        }
        console.log(args);
        yield (0, exports.fetchSwapData)(_fromAddress || null, _toAddress || null, _toCurrency || null, _fromCurrency || null);
    });
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map