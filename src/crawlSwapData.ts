import { fetchSwapData } from './fetchSwapData';
import { addressRecordWriter } from './writers';

export const crawlSwapData = async (
	from?: string,
	to?: string,
	toAsset?: string,
	fromAsset?: string,
) => {
	const addresses: string[] = [];
	const seenSwaps: Set<string> = new Set();

	await fetchSwapData(from, to, toAsset, fromAsset, addresses, seenSwaps);
	console.log("\n\n ====> ✅ All recursion complete, writing addresses \n\n");
	await addressRecordWriter([...new Set(addresses)]);
	console.log("\n\n Unique Addresses written: ", addresses.length);
	process.exit(0);
};
