const csvWriter = require('csv-writer');
const { Search } = require("./cryptoregex");
import path from 'path';
import pino from 'pino';
const logger = pino();


type SwapData = {
  createdAt:string;	
  oid:string;	
  svc:string;	
  pair:string;
  fromAddr:string;	
  from:string;	
  to:string;	
  toAddr:string;	
  fromAmt:string;	
  fromAmtStr:string;	
  fromAmtUSD:string;	
  toAmt:string;	
  toAmtStr:string;	
  toAmtUSD:string;	
  rateId:string;	
  svcResponse:string;	
  fromTx:string;	
  toTx:string;	
  status:string;	
  svcStatus:string;	
  exchangeAddr:string;	
  fromSource:string;	
  refundTx:string;	
  updatedAt:string;
  btn:string;	
  error:string;	
  clientBuild:string;	
  clientVer:string;
};


// Search original address, need to identify sometimes which asset it represents (ie. ETH, BNB, TRX, USDT), use cryptoregex
// Search by address can be done via API but I believe the currency has to be included as well in order to return the results. 
// You can't define a time range via API, it'll just give you all that matches. 
// It has to include the fromAsset or the toAsset. 
// We don’t always receive the asset with the address. This will effect searching for EVM and TRX addresses.
// We’ll get all assets that match the address (ETH, BNB, TRX, USDT). 

const addresses: string[] = []; 

// Put additional addresses from swap pair. Add to sheet 1
const writerAddress = csvWriter.createObjectCsvWriter({
  path: path.resolve(__dirname, 'sheet1.csv'),
  header: [
    { "id": "address", "title": "Address" }
  ],
});

const addressRecordWriter = async (_addresses: string[]) => {
	await writerAddress.writeRecords(_addresses);
	console.log("Done writing Sheet 1 with address data. ✅");
	logger.info("Done writing Sheet 1 with address data.");
	
};

const writerSwap = csvWriter.createObjectCsvWriter({
  path: path.resolve(__dirname, 'sheet2.csv'),
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

const swapsRecordWriter = async (_swaps: SwapData[]) => {
	await writerSwap.writeRecords(_swaps);
	console.log("Done writing Sheet 2 with swap data. ✅");
	logger.info("Done writing Sheet 2 with swap data.");
	
};

const baseFetch = async (_url: string) => {
		let response;
	try {
		response = await fetch(_url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0", 
                "App-Name": "hf2_le_exchange_search",
				"App-Version": "1.0.0"
            }
        });
       return response;
	} catch(error: any){
		console.log("Something went wrong base fetch:", error);
		logger.info(error);
		return response;
	}
}


// Get swap data from api
export const fetchSwapData = async (_toAddress: string = null, _fromAddress: string = null, _toCurrency: string = null, _fromCurrency: string = null) => {
	const baseUrl = 'https://exchange.exodus.io/v3/orders';
	let toCurrency: string[] = [];
	let fromCurrency: string[] = [];

	// let evmCurrencies: string[] = [];

	// If currency is null, then need to use cryptoregex to determine based on address
	if(_toCurrency === null && _toAddress !== null){
		const toCoin = await Search(_toAddress);
		toCurrency.push(coin);
	} else {
		toCurrency.push(_toCurrency);
	}

	if(_fromCurrency === null && _fromAddress !== null){
		const fromCoin = await Search(_fromAddress);
		fromCurrency.push(fromCoin);
	} else {
		fromCurrency.push(_fromCurrency);
	}

	let addresses: string[] = [];
	let requests: JSON[] = [];

	try {
		/*
			Request url examples:
			https://exchange.exodus.io/v3/orders?toAddress=31muhDdxQEE7E2MUUF3qunAKr4NR4Tn1Qy&toAsset=BTC
			https://exchange.exodus.io/v3/orders?fromAddress=addr1q84x3qh7e0q6fldmj5mnk89vjlvgncsw5g9dmxmel4qt00j04mm39fw8l4pewc59xl59v7zszwye9vhuh3zwft8e5j9sslflq0&fromAsset=ADA
		*/

		if(toCurrency.length === 1 && fromCurrency.length === 1 ){
			if (fromAddr) requests.push(baseFetch(`${baseUrl}?fromAddr=${_fromAddr}&fromAsset=${_fromCurrency}`));
    		if (toAddr) requests.push(baseFetch(`${baseUrl}?toAddr=${_toAddr}&toAsset=${_toCurrency}`));
		} else {
			//Handle multiple currencies with multiple requests
			toCurrency.forEach((tCoin) => {
				if(tCoin !== "Not Found") requests.push(baseFetch(`${baseUrl}?toAddr=${_toAddr}&toAsset=${tCoin}`));
			});

			fromCurrency.forEach((fCoin) => {
				if(fCoin !== "Not Found") requests.push(baseFetch(`${baseUrl}?fromAddr=${_fromAddr}&fromAsset=${fCoin}`));
			});
		}
        

    	const responses = await Promise.all(requests);
    	const dataArrays = await Promise.all(responses.map(res => res.status === 200 ? res.json() : console.log("\n\n Swap data not found. \n\n")));

    	/* Array of unique SwapData objects based on the oid field.
    		Example:
    	    const swaps: SwapData[] = [
		     { xxxx: 'xxxxx', yyyyy: 'yyyyyy', ddddd: 'ddddd', pppp: 222222 }, 
		     { xxxx: 'xxxxx', yyyyy: 'yyyyyy', ddddd: 'ddddd', pppp: 222222 },
			];
		*/
    	const mergedData = Object.values(
	        dataArrays.flat().reduce((acc, item) => {
	            acc[item.oid] = item;
	            return acc;
	        }, {})
	    );

    	// Add swap data to sheet 2
	    await swapsRecordWriter(mergedData);

	    // Add addresses to sheet 1 & recursive search
    	mergedData.forEach((data) => {
    		// If address exists in each data hash, push it to the sheet
    		if(data.!toAddr !== null && data!.toAddr !== '' && data!.toAddr !== undefined && !addresses.includes(data!.toAddr)){
				addresses.push[data.toAddr];
	     	}
	     	if(data.!fromAddr !== null && data!.fromAddr !== '' && data!.fromAddr !== undefined && !addresses.includes(data!.fromAddr)){
	     		addresses.push[data.fromAddr]
	     	}
	
			// Figure out recursion. 
	     	if (data.toAddr && data.fromAddr){
	        	await fetchSwapData(data.toAddr, data.fromAddr, data.to, data.from);
	        } else if (data.toAddr && !data.fromAddr){
				await fetchSwapData(data.toAddr, null, data.to, null);
	        } else if (!data.toAddr && data.fromAddr){
				await fetchSwapData(null, data.fromAddr, null, data.from);
	        } else {
	        	// Write addresses if no more pairs found
	        	console.log("No more remaining pairs");
	        	logger.info("No more remaining pairs");
	        	await addressRecordWriter(addresses);
	        }
    	});

    } catch (error: any) {
        console.log("Something went wrong with that call", error.message);
        logger.info(error);
        // Retry can be left to HF2
    }
};

async function main() {
    const args = process.argv.slice(2); // Remove first two elements (node path and script path)

    if (args.length < 4) {
        console.error("Usage: node dist/index.js <toAddress> <fromAddress> <toCurrency> <fromCurrency>");
        process.exit(1);
    }

    const [_toAddress, _fromAddress, _toCurrency, _fromCurrency] = args;

    await fetchSwapData(_toAddress, _fromAddress, _toCurrency, _fromCurrency);
}

if (require.main === module) {
    main();
}


