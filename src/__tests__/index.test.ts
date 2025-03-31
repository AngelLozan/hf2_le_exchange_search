jest.mock('../fetchSwapData', () => ({
  fetchSwapData: jest.fn(),
}));

jest.mock('../writers', () => ({
  addressRecordWriter: jest.fn(),
}));

// ==================================================================================

import type { SwapData, AmountData, Address } from '../index';
import { baseFetch } from '../index';
import { crawlSwapData } from '../crawlSwapData';
import { fetchSwapData } from '../fetchSwapData';
import { addressRecordWriter, swapsRecordWriter } from '../writers';
import * as swapModule from '../index';
const request = require("supertest");
const path = require("path");

// ==================================================================================

describe('baseFetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should call fetch with the correct URL and headers', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const url = 'https://api.example.com/data';
    const response = await baseFetch(url);

    expect(global.fetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0',
        'App-Name': 'hf2_le_exchange_search',
        'App-Version': '1.0.0',
      },
    });

    expect(response).toBe(mockResponse);
  });

  it('should log and return undefined when fetch throws an error', async () => {
    const error = new Error('Network Error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);

    const response = await baseFetch('https://api.example.com/error');

    expect(global.fetch).toHaveBeenCalled();
    expect(response).toBeUndefined();
  });
});

// ==================================================================================

describe('crawlSwapData', () => {
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    (fetchSwapData as jest.Mock).mockClear();
    (addressRecordWriter as jest.Mock).mockClear();
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('should call fetchSwapData and addressRecordWriter with deduplicated addresses', async () => {
    (fetchSwapData as jest.Mock).mockImplementation(
      async (
        from: string,
        to: string,
        toAsset: string,
        fromAsset: string,
        addresses: string[],
        seenSwaps: Set<string>,
      ) => {
        addresses.push('addr1', 'addr2', 'addr1'); // Duplicate to test deduplication
        seenSwaps.add('swap1');
      },
    );

    try {
      await crawlSwapData('walletA', 'walletB', 'USDT', 'BTC');
    } catch (e: any) {
      if (e.message !== 'process.exit called') throw e;
    }

    expect(fetchSwapData).toHaveBeenCalledWith(
      'walletA',
      'walletB',
      'USDT',
      'BTC',
      expect.any(Array), // addresses
      expect.any(Set), // seenSwaps
    );

    expect(addressRecordWriter).toHaveBeenCalledWith(
      expect.arrayContaining(['addr1', 'addr2']),
    );

    expect(addressRecordWriter).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});

// ==================================================================================

