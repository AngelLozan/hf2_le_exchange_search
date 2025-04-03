jest.mock('../index', () => ({
  // ...jest.requireActual('../index'),
  baseFetch: jest.fn(),
  throttleAll: jest.fn(),
  // normalizeAddress: jest.fn((addr: string) => addr.toLowerCase()),
}));


jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(() => ({
    writeRecords: jest.fn(), 
  })),
}));

jest.mock('../cryptoregex', () => ({
  Search: jest.fn(),
}));



// ==================================================================================

import type { SwapData, AmountData, Address } from '../index';
import { baseFetch, throttleAll } from '../index';
import { crawlSwapData } from '../crawlSwapData';
import { fetchSwapData } from '../fetchSwapData';
import { Search } from '../cryptoregex';
// import { addressRecordWriter, swapsRecordWriter } from '../writers';
import * as writers from '../writers';
import { createObjectCsvWriter } from 'csv-writer';
import * as swapModule from '../index';
const request = require("supertest");
const path = require("path");

jest.spyOn(writers, 'addressRecordWriter');
jest.spyOn(writers, 'swapsRecordWriter');

// ==================================================================================


describe('fetchSwapData', () => {
  beforeEach(() => {
	  jest.clearAllMocks();

	  // 1. Mock Search to return arrays of tickers (triggers multi-currency branch)
	  (Search as jest.Mock).mockResolvedValueOnce(['btc'])  // for _toAddress
	                       .mockResolvedValueOnce(['eth']); // for _fromAddress

	  // 2. Mock baseFetch to return valid responses
	  (baseFetch as jest.Mock).mockImplementation((url: string) => {
	    if (url.includes('/provider-orders/')) {
	      return Promise.resolve({
	        json: () => Promise.resolve({ provider: { slug: 'mockService' } }),
	        status: 200,
	      });
	    }
	    return Promise.resolve({
	      json: () => Promise.resolve([{
	        providerOrderId: 'multi123',
	        fromAddress: 'ADDR1',
	        toAddress: 'ADDR2',
	        amount: { assetId: 'ETH', value: '1.0' },
	        toAmount: { assetId: 'BTC', value: '30000' },
	      }]),
	      status: 200,
	    });
	  });

	  // 3. Mock throttleAll to just run all requests immediately
	  (throttleAll as jest.Mock).mockImplementation(
	    async (requests: (() => Promise<any>)[]) => {
	      return Promise.all(requests.map((fn) => fn()));
	    }
	  );
	});


  it('should handle multiple currencies from Search and return merged swaps', async () => {
	  const addresses: string[] = [];
	  const seenSwaps: Set<string> = new Set();

	  const result = await fetchSwapData(
	    'ADDR1',
	    'ADDR2',
	    null,
	    null,
	    addresses,
	    seenSwaps
	  );

		expect(Array.isArray(result)).toBe(true);
	  expect(result).toHaveLength(2);
	  // expect(result[0]).toBeInstanceOf(Array); // addresses
	  // expect(result[1]).toBeInstanceOf(Set);   // seenSwaps
	  expect(baseFetch).toHaveBeenCalled();
	  expect(writers.swapsRecordWriter).toHaveBeenCalledWith([
	    expect.objectContaining({
	      providerOrderId: 'multi123',
	      svc: 'mockService',
	    }),
	  ]);
	});

});

// ==================================================================================