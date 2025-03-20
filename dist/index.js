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
const csvWriter = require('csv-writer');
const { Search } = require("./cryptoregex");
const path_1 = __importDefault(require("path"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const addresses = [];
const writerAddress = csvWriter.createObjectCsvWriter({
    path: path_1.default.resolve(__dirname, 'sheet1.csv'),
    header: [
        { "id": "address", "title": "Address" }
    ],
});
const addressRecordWriter = (_addresses) => __awaiter(void 0, void 0, void 0, function* () {
    yield writerAddress.writeRecords(_addresses);
    console.log("Done writing Sheet 1 with address data. ✅");
    logger.info("Done writing Sheet 1 with address data.");
});
const writerSwap = csvWriter.createObjectCsvWriter({
    path: path_1.default.resolve(__dirname, 'sheet2.csv'),
    header: [
        { "id": "createdAt", "title": "Created At" },
        { "id": "oid", "title": "Order ID" },
        { "id": "svc", "title": "Service" },
        { "id": "pair", "title": "Pair" },
        { "id": "fromAddr", "title": "From Address" },
        { "id": "from", "title": "From" },
        { "id": "to", "title": "To" },
        { "id": "toAddr", "title": "To Address" },
        { "id": "fromAmt", "title": "From Amount" },
        { "id": "fromAmtStr", "title": "From Amount String" },
        { "id": "fromAmtUSD", "title": "From Amount (USD)" },
        { "id": "toAmt", "title": "To Amount" },
        { "id": "toAmtStr", "title": "To Amount String" },
        { "id": "toAmtUSD", "title": "To Amount (USD)" },
        { "id": "rateId", "title": "Rate ID" },
        { "id": "svcResponse", "title": "Service Response" },
        { "id": "fromTx", "title": "From Transaction" },
        { "id": "toTx", "title": "To Transaction" },
        { "id": "status", "title": "Status" },
        { "id": "svcStatus", "title": "Service Status" },
        { "id": "exchangeAddr", "title": "Exchange Address" },
        { "id": "fromSource", "title": "From Source" },
        { "id": "refundTx", "title": "Refund Transaction" },
        { "id": "updatedAt", "title": "Updated At" },
        { "id": "btn", "title": "Button" },
        { "id": "error", "title": "Error" },
        { "id": "clientBuild", "title": "Client Build" },
        { "id": "clientVer", "title": "Client Version" }
    ],
});
const swapsRecordWriter = (_swaps) => __awaiter(void 0, void 0, void 0, function* () {
    yield writerSwap.writeRecords(_swaps);
    console.log("Done writing Sheet 2 with swap data. ✅");
    logger.info("Done writing Sheet 2 with swap data.");
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
                "App-Version": "1.0.0"
            }
        });
        return response;
    }
    catch (error) {
        console.log("Something went wrong base fetch:", error);
        logger.info(error);
        return response;
    }
});
const fetchSwapData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (_toAddress = null, _fromAddress = null, _toCurrency = null, _fromCurrency = null) {
    const baseUrl = 'https://exchange.exodus.io/v3/orders';
    let toCurrency = [];
    let fromCurrency = [];
    if (_toCurrency === null && _toAddress !== null) {
        const toCoin = yield Search(_toAddress);
        toCurrency.push(toCoin);
    }
    else {
        if (_toCurrency !== null)
            toCurrency.push(_toCurrency);
    }
    if (_fromCurrency === null && _fromAddress !== null) {
        const fromCoin = yield Search(_fromAddress);
        fromCurrency.push(fromCoin);
    }
    else {
        if (_fromCurrency !== null)
            fromCurrency.push(_fromCurrency);
    }
    let addresses = [];
    let requests = [];
    try {
        if (toCurrency.length === 1 && fromCurrency.length === 1) {
            if (_fromAddress)
                requests.push(baseFetch(`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${_fromCurrency}`));
            if (_fromAddress)
                requests.push(baseFetch(`${baseUrl}?toAddress=${_toAddress}&toAsset=${_toCurrency}`));
        }
        else {
            toCurrency.forEach((tCoin) => {
                if (tCoin !== "Not Found")
                    requests.push(baseFetch(`${baseUrl}?toAddr=${_toAddress}&toAsset=${tCoin}`));
            });
            fromCurrency.forEach((fCoin) => {
                if (fCoin !== "Not Found")
                    requests.push(baseFetch(`${baseUrl}?fromAddr=${_fromAddress}&fromAsset=${fCoin}`));
            });
        }
        const responses = yield Promise.all(requests);
        const dataArrays = yield Promise.all(responses.map(res => res.status === 200 ? res.json() : console.log("\n\n Swap data not found. \n\n")));
        const mergedData = Object.values(dataArrays.flat().reduce((acc, item) => {
            acc[item.oid] = item;
            return acc;
        }, {}));
        yield swapsRecordWriter(mergedData);
        for (const data of mergedData) {
            if (data.toAddr !== null && data.toAddr !== '' && data.toAddr !== undefined && !addresses.includes(data.toAddr)) {
                addresses.push(data.toAddr);
            }
            if (data.fromAddr !== null && data.fromAddr !== '' && data.fromAddr !== undefined && !addresses.includes(data.fromAddr)) {
                addresses.push(data.fromAddr);
            }
            if (data.toAddr && data.fromAddr) {
                yield (0, exports.fetchSwapData)(data.toAddr, data.fromAddr, data.to, data.from);
            }
            else if (data.toAddr && !data.fromAddr) {
                yield (0, exports.fetchSwapData)(data.toAddr, null, data.to, null);
            }
            else if (!data.toAddr && data.fromAddr) {
                yield (0, exports.fetchSwapData)(null, data.fromAddr, null, data.from);
            }
            else {
                console.log("No more remaining pairs");
                logger.info("No more remaining pairs");
                yield addressRecordWriter(addresses);
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
        if (args.length < 4) {
            console.error("Usage: node dist/index.js <toAddress> <fromAddress> <toCurrency> <fromCurrency>");
            process.exit(1);
        }
        const [_toAddress, _fromAddress, _toCurrency, _fromCurrency] = args;
        yield (0, exports.fetchSwapData)(_toAddress, _fromAddress, _toCurrency, _fromCurrency);
    });
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map