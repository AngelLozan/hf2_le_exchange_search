"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
jest.mock('csv-writer', () => ({
    createObjectCsvWriter: jest.fn(() => ({
        writeRecords: jest.fn(),
    })),
}));
const index_1 = require("../index");
const crawlSwapData_1 = require("../crawlSwapData");
const fetchSwapData_1 = require("../fetchSwapData");
const writers = __importStar(require("../writers"));
const csv_writer_1 = require("csv-writer");
const request = require("supertest");
const path = require("path");
jest.spyOn(writers, 'addressRecordWriter');
jest.spyOn(writers, 'swapsRecordWriter');
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
        expect(writers.addressRecordWriter).toHaveBeenCalledWith(expect.arrayContaining(['addr1', 'addr2']));
        expect(writers.addressRecordWriter).toHaveBeenCalledTimes(1);
    }));
});
describe('swapsRecordWriter', () => {
    const mockWriteRecords = jest.fn();
    beforeEach(() => {
        csv_writer_1.createObjectCsvWriter.mockReturnValue({
            writeRecords: mockWriteRecords,
        });
        mockWriteRecords.mockClear();
    });
    it('should format and write swap data with derived amount fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockSwap = {
            amount: { assetId: 'BTC', value: '0.5' },
            toAmount: { assetId: 'USDT', value: '25000' },
            createdAt: '2025-01-01T00:00:00Z',
            providerOrderId: 'abc123',
            pairId: 'BTC_USDT',
            fromAddress: 'walletA',
            fromTransactionId: 'tx1',
            toAddress: 'walletB',
            toTransactionId: 'tx2',
            id: 'swap1',
            message: '',
            payInAddress: 'payin123',
            rateId: 'rate123',
            updatedAt: '2025-01-01T01:00:00Z',
            status: 'complete',
            svc: 'mockService',
            svcStatus: 'success',
        };
        yield writers.swapsRecordWriter([mockSwap]);
        expect(writers.swapsRecordWriter).toHaveBeenCalledWith([
            {
                amount: { assetId: 'BTC', value: '0.5' },
                toAmount: { assetId: 'USDT', value: '25000' },
                createdAt: '2025-01-01T00:00:00Z',
                providerOrderId: 'abc123',
                pairId: 'BTC_USDT',
                fromAddress: 'walletA',
                fromTransactionId: 'tx1',
                id: 'swap1',
                message: '',
                payInAddress: 'payin123',
                rateId: 'rate123',
                toAddress: 'walletB',
                toTransactionId: 'tx2',
                updatedAt: '2025-01-01T01:00:00Z',
                status: 'complete',
                svc: 'mockService',
                svcStatus: 'success',
            },
        ]);
    }));
});
//# sourceMappingURL=index.test.js.map