"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../fetchSwapData', () => ({
    fetchSwapData: jest.fn(),
}));
jest.mock('../writers', () => ({
    addressRecordWriter: jest.fn(),
}));
const index_1 = require("../index");
const crawlSwapData_1 = require("../crawlSwapData");
const fetchSwapData_1 = require("../fetchSwapData");
const writers_1 = require("../writers");
const request = require("supertest");
const path = require("path");
describe('baseFetch', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });
    it('should call fetch with the correct URL and headers', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockResponse = new Response(JSON.stringify({ data: 'ok' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
        global.fetch.mockResolvedValueOnce(mockResponse);
        const url = 'https://api.example.com/data';
        const response = yield (0, index_1.baseFetch)(url);
        expect(global.fetch).toHaveBeenCalledWith(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0',
                'App-Name': 'hf2_le_exchange_search',
                'App-Version': '1.0.0',
            },
        });
        expect(response).toBe(mockResponse);
    }));
    it('should log and return undefined when fetch throws an error', () => __awaiter(void 0, void 0, void 0, function* () {
        const error = new Error('Network Error');
        global.fetch.mockRejectedValueOnce(error);
        const response = yield (0, index_1.baseFetch)('https://api.example.com/error');
        expect(global.fetch).toHaveBeenCalled();
        expect(response).toBeUndefined();
    }));
});
describe('crawlSwapData', () => {
    let exitSpy;
    beforeEach(() => {
        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('process.exit called');
        });
        fetchSwapData_1.fetchSwapData.mockClear();
        writers_1.addressRecordWriter.mockClear();
    });
    afterEach(() => {
        exitSpy.mockRestore();
    });
    it('should call fetchSwapData and addressRecordWriter with deduplicated addresses', () => __awaiter(void 0, void 0, void 0, function* () {
        fetchSwapData_1.fetchSwapData.mockImplementation((from, to, toAsset, fromAsset, addresses, seenSwaps) => __awaiter(void 0, void 0, void 0, function* () {
            addresses.push('addr1', 'addr2', 'addr1');
            seenSwaps.add('swap1');
        }));
        try {
            yield (0, crawlSwapData_1.crawlSwapData)('walletA', 'walletB', 'USDT', 'BTC');
        }
        catch (e) {
            if (e.message !== 'process.exit called')
                throw e;
        }
        expect(fetchSwapData_1.fetchSwapData).toHaveBeenCalledWith('walletA', 'walletB', 'USDT', 'BTC', expect.any(Array), expect.any(Set));
        expect(writers_1.addressRecordWriter).toHaveBeenCalledWith(expect.arrayContaining(['addr1', 'addr2']));
        expect(writers_1.addressRecordWriter).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledWith(0);
    }));
});
//# sourceMappingURL=index.test.js.map