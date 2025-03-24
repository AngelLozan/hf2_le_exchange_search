const csvWriter = require("csv-writer");
const { Search } = require("./cryptoregex");
import path from "path";
import pino from "pino";
import fs from "fs";
const logger = pino();
// const csv = require('csv-parser');
import csv from "csv-parser";

type AmountData = {
	assetId: string;
	value: string;
};

type Address = string;

type SwapData = {
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
	//optional from csv
	svc?: string;
	from?: string; //amount.assetId;
	to?: string; //toAmount.assetId;
	fromAmt?: string;
	fromAmtStr?: string; //amount.value;
	fromAmtUSD?: string; //amount.value;
	toAmt?: string;
	toAmtStr?: string; //toAmount.value;
	toAmtUSD?: string; //toAmount.value;
	svcResponse?: string;
	svcStatus?: string;
	fromSource?: string;
	refundTx?: string;
	btn?: string;
	error?: string;
	clientBuild?: string;
	clientVer?: string;
};

// TO DO: Adapt appropriate type and reduce by providerOrderId

// {
//       amount: [Object],
//       toAmount: [Object],
//       createdAt: '2025-01-07T23:44:55.761Z',
//       fromAddress: 'TWZ5fhmREyszAwyfFESHcBanMwY42LEiuP',
//       fromTransactionId: '930c661659bba2ca5bb6016c94ae7689561ba2e99e5fc7551fdc3a37070c5d02',
//       id: 'Gb0D8dyX0MeN3eE',
//       message: '',
//       pairId: 'USDTTRX_TRX',
//       payInAddress: 'TLeXWADfVXwaB7DiFCgqAG7MURPSK9mkGp',
//       providerOrderId: '0dxq0x9sshv05gt1mg',
//       rateId: '67216e32-d973-4acc-8aa1-3581551fbb94',
//       toAddress: 'TWZ5fhmREyszAwyfFESHcBanMwY42LEiuP',
//       toTransactionId: 'ea52148a9b25d0ddaba55d679615d88a9e5ec98224c1c35f08d772b0cdf79ae5',
//       updatedAt: '2025-01-07T23:48:53.649Z',
//       status: 'complete'
//     },

// Put additional addresses from swap pair. Add to sheet 1
const writerAddress = csvWriter.createObjectCsvWriter({
	path: path.resolve(__dirname, "sheet1.csv"),
	header: [{ id: "address", title: "Address" }],
});

const addressRecordWriter = async (_addresses: string[]) => {
	console.log(_addresses);
	const formatted = _addresses.map((addr) => ({ address: addr }));
	await writerAddress.writeRecords(formatted);
};

const writerSwap = csvWriter.createObjectCsvWriter({
	path: path.resolve(__dirname, "sheet2.csv"),
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

		// Optional to define
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

const swapsRecordWriter = async (_swaps: SwapData[]) => {
	await writerSwap.writeRecords(_swaps);
};

const baseFetch = async (_url: string) => {
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
		// console.log("\n\n RESPONSE: ", response);
		return response;
	} catch (error: any) {
		console.log("Something went wrong base fetch:", error);
		logger.info(error);
		return response;
	}
};

//----------------------------------------
// Helpers:

function delay(time: number): Promise<void> {
	return new Promise(function (resolve) {
		setTimeout(resolve, time);
	});
}

async function throttleAll<T>(
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


const normalizeAddress = (addr: string) => addr.trim().toLowerCase();

//----------------------------------------

process.on("SIGINT", function () {
	console.log("Caught interrupt signal");
	process.exit(0);
});

// Get swap data from api
export const fetchSwapData = async (
	_fromAddress: string | null = null,
	_toAddress: string | null = null,
	_toCurrency: string | null = null,
	_fromCurrency: string | null = null,
	addresses: Address[],
	seenSwaps: Set<string>
) => {
	// const baseUrl = "https://exchange-s.exodus.io/v3/orders"; // Dev
	const baseUrl = "https://exchange.exodus.io/v3/orders"; // Prod
	// let addresses: Address[] = [];
	let toCurrency: string[] = [];
	let fromCurrency: string[] = [];


	if (
		_fromAddress !== null &&
		!addresses.includes(normalizeAddress(_fromAddress))
	)
		addresses.push(normalizeAddress(_fromAddress));
	// if(_fromAddress !== null && !addresses.includes(_fromAddress)) addresses.push(_fromAddress);
	if (
		_toAddress !== null &&
		!addresses.includes(normalizeAddress(_toAddress))
	)
		addresses.push(normalizeAddress(_toAddress));
	// if(_toAddress !== null && !addresses.includes(_toAddress)) addresses.push(_toAddress);

	// let evmCurrencies: string[] = [];

	// If currency is null, then need to use cryptoregex to determine based on address
	if (_toCurrency === null && _toAddress !== null) {
		const toCoin = await Search(_toAddress);

		if (toCoin.length > 1) {
			console.log("===> Checking all EVM assets for TO asset");
			for (const tC of toCoin) {
				toCurrency.push(tC.toUpperCase());
			}
		} else {
			console.log("===> TO asset: ", toCoin);
			toCurrency.push(toCoin.toUpperCase());
		}
	} else {
		if (_toCurrency !== null) toCurrency.push(_toCurrency.toUpperCase());
	}

	if (_fromCurrency === null && _fromAddress !== null) {
		const fromCoin = await Search(_fromAddress);

		if (fromCoin.length > 1) {
			console.log("===> Checking all EVM assets for FROM asset");
			for (const fC of fromCoin) {
				fromCurrency.push(fC.toUpperCase());
			}
		} else {
			console.log("===> FROM COIN: ", fromCoin);
			fromCurrency.push(fromCoin.toUpperCase());
		}
	} else {
		if (_fromCurrency !== null)
			fromCurrency.push(_fromCurrency.toUpperCase());
	}

	let requests: Promise<Response | undefined>[] = [];

	try {
		/*
			Request url examples:
			https://exchange.exodus.io/v3/orders?toAddress=31muhDdxQEE7E2MUUF3qunAKr4NR4Tn1Qy&toAsset=BTC
			https://exchange.exodus.io/v3/orders?fromAddress=addr1q84x3qh7e0q6fldmj5mnk89vjlvgncsw5g9dmxmel4qt00j04mm39fw8l4pewc59xl59v7zszwye9vhuh3zwft8e5j9sslflq0&fromAsset=ADA
		*/

		if (toCurrency.length === 1 && fromCurrency.length === 1) {
			if (_fromAddress)
				console.log(
					"URL before request FROM",
					`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fromCurrency[0]}`,
				);
			requests.push(
				baseFetch(
					`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fromCurrency[0]}`,
				),
			);
			if (_toAddress)
				console.log(
					"URL before request TO",
					`${baseUrl}?toAddress=${_toAddress}&toAsset=${toCurrency[0]}`,
				);
			requests.push(
				baseFetch(
					`${baseUrl}?toAddress=${_toAddress}&toAsset=${toCurrency[0]}`,
				),
			);
		} else {
			//Handle multiple currencies with multiple requests
			toCurrency.forEach((tCoin) => {
				if (tCoin !== "Not Found")
					requests.push(
						baseFetch(
							`${baseUrl}?toAddress=${_toAddress}&toAsset=${tCoin}`,
						),
					);
			});

			fromCurrency.forEach((fCoin) => {
				if (fCoin !== "Not Found")
					requests.push(
						baseFetch(
							`${baseUrl}?fromAddress=${_fromAddress}&fromAsset=${fCoin}`,
						),
					);
			});
		}

		const responses = await Promise.all(requests);
		// const responses = await throttleAll(
		//   requests.map((r) => () => r),
		//   4,      // concurrency: 2 at a time
		//   100     // delay: 200ms between starts
		// );

		const dataArrays = await Promise.all(
			responses.map(async (res) => {
				if (res && res.status === 200) {
					const json = await res.json();
					// console.log(
					// 	"Fetched data chunk:",
					// 	JSON.stringify(json, null, 2),
					// );
					return json;
				} else {
					console.log("===> Swap data not found or response error");
					return null;
				}
			}),
		);

		const allResults = dataArrays.flat().filter(Boolean);

		console.log(
			`\n\n ====> Fetched ${dataArrays.flat().length} swaps \n\n ========================================================== \n`,
		);

		/* Array of unique SwapData objects based on the oid field.
    		Example:
    	    const swaps: SwapData[] = [
		     { xxxx: 'xxxxx', yyyyy: 'yyyyyy', ddddd: 'ddddd', pppp: 222222 }, 
		     { xxxx: 'xxxxx', yyyyy: 'yyyyyy', ddddd: 'ddddd', pppp: 222222 },
			];
		*/
		const mergedData: SwapData[] = Object.values(
			// dataArrays.flat().reduce((acc, item) => {
			allResults.reduce((acc, item) => {
				acc[item.providerOrderId] = item;
				return acc;
			}, {} as Record<string, SwapData>),
		);

		// console.log("Merged data:", JSON.stringify(mergedData, null, 2));
		const uniqueSwaps = mergedData.filter(
		  (data) => !seenSwaps.has(data.providerOrderId)
		);

		// EXIT 
		if (uniqueSwaps.length === 0) {
		  console.log("\n\n ===> No new swaps found. Exiting recursion. \n\n");
		  // process.exit(1);
		  return true;
		}

		uniqueSwaps.forEach((data) => seenSwaps.add(data.providerOrderId));

		// Add swap data to sheet 2
		console.log(`n\n ====> Writing merged data to sheet, records: ${uniqueSwaps.length}`);
		await swapsRecordWriter(uniqueSwaps);


		// Add addresses to sheet 1 & recursive search
		for (const data of uniqueSwaps) {
			const normFrom = normalizeAddress(data.fromAddress);
			const normTo = normalizeAddress(data.toAddress);

			const newAddresses = [normFrom, normTo];
			const unseen = newAddresses.filter((addr) => !addresses.includes(addr));

			if (unseen.length === 0) {
				continue;
			}

			// Add all unseen addresses
			unseen.forEach((addr) => addresses.push(addr));

			console.log(`New addresses discovered: ${unseen.join(", ")}`);

			// Recusion
			await fetchSwapData(
				data.fromAddress || null,
				data.toAddress || null,
				data.to || null,
				data.from || null,
				addresses,
				seenSwaps
			);
		}

		// return true;
		console.log("\n\n Unique Addresses: ", addresses.length);
		return true;
		// process.exit(1);
	} catch (error: any) {
		console.log("====> Something went wrong with that call", error.message);
		logger.info(error);
		process.exit(1);
		// Retry can be left to HF2
	}
};

export const crawlSwapData = async (
	from?: string,
	to?: string,
	toAsset?: string,
	fromAsset?: string,
) => {
	const addresses: Address[] = [];
  	const seenSwaps: Set<string> = new Set();

	await fetchSwapData(from, to, toAsset, fromAsset, addresses, seenSwaps);
	console.log("\n\n ====> ✅ All recursion complete, writing addresses \n\n");
	await addressRecordWriter([...new Set(addresses)]);
	console.log("\n\n Unique Addresses written: ", addresses.length);
	process.exit(0);
};

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
		process.exit(1);
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
	const allPromises: Promise<void>[] = [];

	try {
		if (csv_file_path !== null) {
			//Iterate csv file of addresses
			const addressesToProcess: string[] = [];

			fs.createReadStream(csv_file_path)
				.pipe(csv())
				.on("data", (row) => {
					addressesToProcess.push(row.ADDRESS);
				})
				.on("end", async () => {
					console.log("\n\n ====> CSV file successfully processed");

					for (const addr of addressesToProcess) {
						console.log("\n\n ==> Searching address: ", addr);
						await crawlSwapData(addr);
					}

					console.log(
						"\n\n ====> ✅ All recursive searches completed.",
					);
				});
		} else {
			await crawlSwapData(
				_fromAddress || undefined,
				_toAddress || undefined,
				_toCurrency || undefined,
				_fromCurrency || undefined,
			);
		}
	} catch (e: any) {
		console.log(`=====> There was an issue with that CSV read: ${e}`);
	}
}

if (require.main === module) {
	main();
}
