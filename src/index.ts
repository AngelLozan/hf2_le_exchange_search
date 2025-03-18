// import cors from "cors";
// import fs from "fs";
// import { createObjectCsvStringifier } from 'csv-writer';
// import * as path from 'path';
const csvWriter = require('csv-writer');
const { Search } = require("./cryptoregex");
import path from 'path';
// import { Readable } from 'stream';
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

const addressRecordWriter = async (event: any, _addresses: string[]) => {
	await writerAddress.writeRecords(_addresses);
	console.log("Done writing Sheet 1 with address data. ✅");
	logger.info("Done writing Sheet 1 with address data.");
	
};

const swaps: SwapData[] = [
  // { xxxx: 'xxxxx', yyyyy: 'yyyyyy', ddddd: 'ddddd', pppp: 222222 }, Example, array of hashes
];


// Get swap data from api
const fetchSwapData = async (_address: string, _currency: string) => {
	// https://exchange.exodus.io/v3/orders?toAddress=31muhDdxQEE7E2MUUF3qunAKr4NR4Tn1Qy&toAsset=BTC
	// https://exchange.exodus.io/v3/orders?fromAddress=addr1q84x3qh7e0q6fldmj5mnk89vjlvgncsw5g9dmxmel4qt00j04mm39fw8l4pewc59xl59v7zszwye9vhuh3zwft8e5j9sslflq0&fromAsset=ADA

	// How to decide if it's to or from? 
	try {
        let response = await fetch("https://api.zerofox.com/2.0/threat_submit/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0", 
                "App-Name": "hf2_le_exchange_search",
				"App-Version": "1.0.0"
            }
        });

        if(response.status !== 200){
        	console.log("Swap or data not found");
        	logger.info("Swap or data not found");
        } else {
	 		let data = await response.json()
        	console.log(data);
	        logger.info(data as JSON);
	        swaps.push(data);
        }
    } catch (error: any) {
        console.log("Something went wrong with that call", error.message);
        logger.info(error.message);
    }
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

const swapsRecordWriter = async (event: any, _swaps: SwapData[]) => {
	await writerSwap.writeRecords(_swaps);
	console.log("Done writing Sheet 2 with swap data. ✅");
	logger.info("Done writing Sheet 2 with swap data.");
	
};

// TO DO: Recursion


