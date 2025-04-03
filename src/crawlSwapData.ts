import { fetchSwapData } from './fetchSwapData';
import { addressRecordWriter } from './writers';
import type { Address } from './index';

export const crawlSwapData = async (
	from?: string | null,
	to?: string | null,
	toAsset?: string | null,
	fromAsset?: string | null,
) => {
	let addresses: Address[] = [];
  	let seenSwaps: Set<string> = new Set();

	const [discovered1, seen1] = await fetchSwapData(from, to, toAsset, fromAsset, addresses, seenSwaps);
	addresses = [...new Set([...addresses, ...discovered1])];
	seenSwaps = seen1;
	// Then run search again with the initial address (from) as the to address
	console.log("\n ==================================== \n ==================================== \n Second fetch swap \n ==================================== \n ==================================== \n")
	const [discovered2, seen2] = await fetchSwapData(null, from, toAsset, fromAsset, addresses, seenSwaps);
	addresses = [...new Set([...addresses, ...discovered2])];
	seenSwaps = seen2;
	
	console.log("\n\n ====> ✅ All recursion complete, writing addresses \n\n");
	await addressRecordWriter([...new Set(addresses)]);
	console.log("\n\n Unique Addresses written: ", addresses.length);
	return true; // Allow continue if multiple addresses. Exit to main.
};