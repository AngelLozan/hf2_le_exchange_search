import type { SwapData, Address } from './index';
const { Search } = require("./cryptoregex");
import { addressRecordWriter, swapsRecordWriter } from './writers';
import { baseFetch, normalizeAddress, throttleAll } from './index';
import pino from "pino";
const logger = pino();



export const fetchSwapData = async (
	_fromAddress: string | null = null,
	_toAddress: string | null = null,
	_toCurrency: string | null = null,
	_fromCurrency: string | null = null,
	addresses: Address[],
	seenSwaps: Set<string>
) => {
	const baseUrl =
		process.env.NODE_ENV === 'test'
			? 'https://exchange-s.exodus.io/v3/orders' // Dev for test
			: 'https://exchange.exodus.io/v3/orders';  // Prod by default

	const providerDataUrl = 'https://exchange.exodus.io/v3/provider-orders';
	let toCurrency: string[] = [];
	let fromCurrency: string[] = [];


	if (
		_fromAddress !== null &&
		!addresses.includes(normalizeAddress(_fromAddress))
	)
		addresses.push(normalizeAddress(_fromAddress));
	if (
		_toAddress !== null &&
		!addresses.includes(normalizeAddress(_toAddress))
	)
		addresses.push(normalizeAddress(_toAddress));
	
	// If no toAddress (singular address provided), use fromAddress as toAddress also. 
	if (_toAddress == null) {
	  _toAddress = _fromAddress;
	}


	// If currency is null, then need to use cryptoregex to determine based on address
	if (_toCurrency === null && _toAddress !== null) {
		const toCoin = await Search(_toAddress);

		if (typeof toCoin === 'object') {
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

		if (typeof fromCoin === 'object') {
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

		// const responses = await Promise.all(requests);
		
		// Throttling with limited concurrency and delays

		const responses = await throttleAll(
		  requests.map((r) => () => r),
		  6,      // concurrency: 6 at a time
		  50     // delay: 50ms between starts
		);

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
			`\n\n ====> Fetched ${dataArrays.flat().length} swaps \n\n`,
		);

		/* 
			Organize swap data pulled and filter for unique.
			Array of unique SwapData objects based on the oid field.
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

		// Add SVC to swap data
		await Promise.all(
		  mergedData.map(async (swap) => {
		    const providerOrderId = swap.providerOrderId;
		    const svcRes = await baseFetch(`${providerDataUrl}/${providerOrderId}`);
		    const svcResJson = await svcRes?.json();

		    if(svcResJson.status !== 404) { 
		    	swap.svc = svcResJson.provider.slug; 
		    } else {
		    	swap.svc = 'Not Found';
		    }
		  })
		);

		// console.log("Merged data:", JSON.stringify(mergedData, null, 2));
		const uniqueSwaps = mergedData.filter(
		  (data) => !seenSwaps.has(data.providerOrderId)
		);

		// Exit loop into the crawl swap data which exits to main. 
		if (uniqueSwaps.length === 0) {
		  console.log("\n\n ===> No new swaps found. Checking for more swaps from new address, if any ...\n\n ========================================================== \n");
		  return true;
		} 

		uniqueSwaps.forEach((data) => seenSwaps.add(data.providerOrderId));

		// Add swap data to sheet 2
		console.log(`n\n ====> Writing merged data to sheet, records: ${uniqueSwaps.length}`);
		await swapsRecordWriter(uniqueSwaps);


		/* 
			Review unique swap data, pull out address.
			Pull out unique addresses found.
			Add unique addresses to the higher level address state array.
			Carry over unique swaps in higher level swap data state array.
			Get more data for each unique address if any. 
		*/

		for (const data of uniqueSwaps) {
			const normalizedFrom = normalizeAddress(data.fromAddress);
			const normalizedTo = normalizeAddress(data.toAddress);

			const newAddresses = [normalizedFrom, normalizedTo];
			const unseen = newAddresses.filter((addr) => !addresses.includes(addr));

			if (unseen.length === 0) {
				continue; // Exit to uniqueSwaps loop
			}

			// Add all unseen addresses
			unseen.forEach((addr) => addresses.push(addr));

			console.log(`====> New addresses discovered: ${unseen.join(", ")} \n`); 

			// Recusion
			await fetchSwapData(
				data.fromAddress || null,
				data.toAddress || null,
				data.toAmount?.assetId || null,
				data.amount?.assetId || null,
				addresses,
				seenSwaps
			);
		}

		console.log("\n\n Unique Addresses: ", addresses.length);
		return true; // Exit to crawlSwapData which exits to main.
	} catch (error: any) {
		console.log("====> Something went wrong with that call", error.message);
		logger.info(error);
		process.exit(1);
		// Retry can be left to HF2
	}
};
