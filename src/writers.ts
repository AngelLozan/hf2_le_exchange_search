import type { SwapData } from './index';
const csvWriter = require("csv-writer");
import path from "path";

const writerAddress = csvWriter.createObjectCsvWriter({
	path: path.resolve(__dirname, "sheet1.csv"),
	header: [{ id: "address", title: "Address" }],
});

export const addressRecordWriter = async (_addresses: string[]) => {
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
		{ id: "svc", title: "Provider" },
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

export const swapsRecordWriter = async (_swaps: SwapData[]) => {
	const formatted = _swaps.map((swap) => ({
		...swap,
		from: swap.amount?.assetId,
		to: swap.toAmount?.assetId,
		fromAmt: swap.amount?.value,
		fromAmtStr: swap.amount?.value,
		fromAmtUSD: swap.amount?.value,
		toAmt: swap.toAmount?.value,
		toAmtStr: swap.toAmount?.value,
		toAmtUSD: swap.toAmount?.value,
		amount: `${swap.amount?.value} ${swap.amount?.assetId}`,
		toAmount: `${swap.toAmount?.value} ${swap.toAmount?.assetId}`,
	}));
	await writerSwap.writeRecords(formatted);
};
