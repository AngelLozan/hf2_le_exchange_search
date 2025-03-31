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
jest.mock('../index', () => ({
    baseFetch: jest.fn(),
    throttleAll: jest.fn(),
    normalizeAddress: jest.fn((addr) => addr.toLowerCase()),
}));
jest.mock('csv-writer', () => ({
    createObjectCsvWriter: jest.fn(() => ({
        writeRecords: jest.fn(),
    })),
}));
jest.mock('../cryptoregex', () => ({
    Search: jest.fn(),
}));
const index_1 = require("../index");
const fetchSwapData_1 = require("../fetchSwapData");
const cryptoregex_1 = require("../cryptoregex");
const writers = __importStar(require("../writers"));
const request = require("supertest");
const path = require("path");
jest.spyOn(writers, 'addressRecordWriter');
jest.spyOn(writers, 'swapsRecordWriter');
describe('fetchSwapData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        cryptoregex_1.Search.mockResolvedValueOnce(['btc'])
            .mockResolvedValueOnce(['eth']);
        index_1.baseFetch.mockImplementation((url) => {
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
        index_1.throttleAll.mockImplementation((requests) => __awaiter(void 0, void 0, void 0, function* () {
            return Promise.all(requests.map((fn) => fn()));
        }));
    });
    it('should handle multiple currencies from Search and return merged swaps', () => __awaiter(void 0, void 0, void 0, function* () {
        const addresses = [];
        const seenSwaps = new Set();
        const result = yield (0, fetchSwapData_1.fetchSwapData)('ADDR1', 'ADDR2', null, null, addresses, seenSwaps);
        expect(result).toBe(true);
        expect(index_1.baseFetch).toHaveBeenCalled();
        expect(writers.swapsRecordWriter).toHaveBeenCalledWith([
            expect.objectContaining({
                providerOrderId: 'multi123',
                svc: 'mockService',
            }),
        ]);
    }));
});
//# sourceMappingURL=fetchSwapData.test.js.map