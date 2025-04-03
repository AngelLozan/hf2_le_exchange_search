const csvWriter = require("csv-writer");
const { Search } = require("./cryptoregex");
import { fetchSwapData } from "./fetchSwapData";
import { crawlSwapData } from './crawlSwapData';
import path from "path";
import pino from "pino";
import fs from "fs";
const logger = pino();
// const csv = require('csv-parser');
import csv from "csv-parser";

//----------------------------------------
// Types:

export type AmountData = {
	assetId: string;
	value: string;
};

export type Address = string;

export type SwapData = {
	amount: AmountData;
	toAmount: AmountData;
	createdAt: string;
	providerOrderId: string;
	pairId: string;
	fromAddress: string;
	fromTransactionId: string;
	id: string;
	message: string;
	payInAddress: string;
	rateId: string;
	toAddress: string;
	toTransactionId: string;
	updatedAt: string;
	status: string;
	svc?: string;
	from?: string; //amount.assetId;
	to?: string; //toAmount.assetId;
	fromAmtStr?: string; //amount.value;
	fromAmtUSD?: string; //amount.value;
	toAmtStr?: string; //toAmount.value;
	toAmtUSD?: string; //toAmount.value;
	//optional from csv
	fromAmt?: string;
	toAmt?: string;
	svcResponse?: string;
	svcStatus?: string;
	fromSource?: string;
	refundTx?: string;
	btn?: string;
	error?: string;
	clientBuild?: string;
	clientVer?: string;
};

export type ProviderData = {
  id: string;
  orderId: string;
  options: {
    statusRequestParams: {
      headers: {
        "api-key": string;
        "Content-Type": string;
        referer: string;
      };
      message: {
        jsonrpc: string;
        method: string;
        params: {
          id: string;
        };
        id: string;
      };
    };
  };
  response: {
    id: string;
    status: string;
    currencyFrom: string;
    currencyTo: string;
    payinHash: string | null;
    payoutHash: string | null;
    refundHash: string | null;
    payinAddress: string;
    payinExtraId: string | null;
    payoutAddress: string;
    payoutExtraId: string | null;
    amountExpectedFrom: string;
    amountExpectedTo: string;
    amountFrom: string;
    amountTo: string;
    apiExtraFee: number;
    refundReason: string;
    networkFee: number | null;
    createdAt: number;
  };
  provider: {
    id: number;
    slug: string;
  };
};


//----------------------------------------
// Helpers:

function delay(time: number): Promise<void> {
	return new Promise(function (resolve) {
		setTimeout(resolve, time);
	});
}

export async function throttleAll<T>(
	tasks: (() => Promise<T>)[],
	concurrency = 2,
	delayMs = 100,
): Promise<T[]> {
	const results: T[] = [];
	const executing: Promise<void>[] = [];

	for (const task of tasks) {
		const p = (async () => {
			const result = await task();
			results.push(result);
			await delay(delayMs);
		})();

		executing.push(p);

		if (executing.length >= concurrency) {
			await Promise.race(executing);
			executing.splice(0, executing.length); // Clear finished
		}
	}

	await Promise.all(executing);
	return results;
}

process.on("SIGINT", function () {
	console.log("Caught interrupt signal");
	process.exit(0);
});

export const baseFetch = async (_url: string) => {
	let response;
	try {
		response = await fetch(_url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"User-Agent":
					"Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0",
				"App-Name": "hf2_le_exchange_search",
				"App-Version": "1.0.0",
			},
		});
		return response;
	} catch (error: any) {
		console.log("Something went wrong base fetch:", error);
		return response;
	}
};

// export const normalizeAddress = (addr?: string | null): string =>
// 	typeof addr === 'string' ? addr.trim().toLowerCase() : '';


//----------------------------------------
// Entry Point

async function main() {
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

	let csv_file_path: string | null = null;
	let _fromAddress: string | null = null;
	let _toAddress: string | null = null;
	let _toCurrency: string | null = null;
	let _fromCurrency: string | null = null;

	if (args.length < 1) {
		console.error(`
\n\n ====> Run this command to search, replacing bracketed values. *One address required* 👇:
-------------
npm run hf2_le_exchange_search <fromAddress> <toAddress> <toCurrency> <fromCurrency>
-------------
        `);
		process.exit(0);
	} else if (args.length === 1) {
		// CSV file of addresses
		csv_file_path = args[0];
	} else if (args.length === 2) {
		// If only address and only one, use it for both to/from address
		_fromAddress = args[1];
		_toAddress = args[1];
	} else {
		// [_fromAddress, _toAddress, _toCurrency, _fromCurrency] = args;
		[csv_file_path, _fromAddress, _toAddress, _toCurrency, _fromCurrency] =
			args.map((arg) => (arg === "" ? null : arg));
	}

	// console.log(args);
	// const allPromises: Promise<void>[] = [];

	try {
		if (csv_file_path !== null) {
			//Iterate csv file of addresses
			const addressesToProcess: string[] = [];

			fs.createReadStream(csv_file_path)
				.pipe(csv())
				.on("data", (row) => {
					addressesToProcess.push(row.Address);
				})
				.on("end", async () => {
					console.log("addressesToProcess", addressesToProcess);
					console.log("\n\n ====> CSV file successfully processed ✅");

					for (const addr of addressesToProcess) {
						console.log("\n\n ==> Searching address: ", addr);
						await crawlSwapData(addr);
					}

					console.log(
						"\n\n ====> ✅ All recursive searches in CSV completed.",
					);
					process.exit(0);
				});
		} else {
			// Singular address
			await crawlSwapData(
				_fromAddress || null,
				_toAddress || null,
				_toCurrency || null,
				_fromCurrency || null,
			);

			console.log("\n\n ====> ✅ All recursive searches completed.");
			process.exit(0);
		}
	} catch (e: any) {
		console.log(`=====> There was an issue with that CSV read: ${e}`);
		process.exit(0);
	}
}

if (require.main === module) {
	main();
}

