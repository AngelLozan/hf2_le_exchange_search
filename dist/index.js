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
exports.normalizeAddress = exports.baseFetch = void 0;
exports.throttleAll = throttleAll;
const csvWriter = require("csv-writer");
const { Search } = require("./cryptoregex");
const crawlSwapData_1 = require("./crawlSwapData");
const pino_1 = __importDefault(require("pino"));
const fs_1 = __importDefault(require("fs"));
const logger = (0, pino_1.default)();
const csv_parser_1 = __importDefault(require("csv-parser"));
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
process.on("SIGINT", function () {
    console.log("Caught interrupt signal");
    process.exit(0);
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
        return response;
    }
});
exports.baseFetch = baseFetch;
const normalizeAddress = (addr) => typeof addr === 'string' ? addr.trim().toLowerCase() : '';
exports.normalizeAddress = normalizeAddress;
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
            process.exit(0);
        }
        else if (args.length === 1) {
            csv_file_path = args[0];
        }
        else if (args.length === 2) {
            _fromAddress = args[1];
            _toAddress = args[1];
        }
        else {
            [csv_file_path, _fromAddress, _toAddress, _toCurrency, _fromCurrency] =
                args.map((arg) => (arg === "" ? null : arg));
        }
        try {
            if (csv_file_path !== null) {
                const addressesToProcess = [];
                fs_1.default.createReadStream(csv_file_path)
                    .pipe((0, csv_parser_1.default)())
                    .on("data", (row) => {
                    addressesToProcess.push(row.Address);
                })
                    .on("end", () => __awaiter(this, void 0, void 0, function* () {
                    console.log("addressesToProcess", addressesToProcess);
                    console.log("\n\n ====> CSV file successfully processed");
                    for (const addr of addressesToProcess) {
                        console.log("\n\n ==> Searching address: ", addr);
                        yield (0, crawlSwapData_1.crawlSwapData)(addr);
                    }
                    console.log("\n\n ====> ✅ All recursive searches in CSV completed.");
                    process.exit(0);
                }));
            }
            else {
                yield (0, crawlSwapData_1.crawlSwapData)(_fromAddress || undefined, _toAddress || undefined, _toCurrency || undefined, _fromCurrency || undefined);
                console.log("\n\n ====> ✅ All recursive searches completed.");
                process.exit(0);
            }
        }
        catch (e) {
            console.log(`=====> There was an issue with that CSV read: ${e}`);
            process.exit(0);
        }
    });
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map