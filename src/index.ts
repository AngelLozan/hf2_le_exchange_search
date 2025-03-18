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

// Search original address

// Put additional addresses from swap pair. Add to sheet 1

// Get swap data from api 👇🏿


const swaps: SwapData[] = [
  // { xxxx: 'xxxxx', yyyyy: 'yyyyyy', ddddd: 'ddddd', pppp: 222222 }, Example, array of hashes
];

const writer = csvWriter.createObjectCsvWriter({
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

const recordWriter = async (event: any, _swaps: SwapData[]) => {
	await writer.writeRecords(_swaps);
	console.log("Done writing Sheet 2 with swap data. ✅");
	logger.info("Done writing Sheet 2 with swap data.");
	
};




