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
exports.Search = void 0;
const Search = (_address) => __awaiter(void 0, void 0, void 0, function* () {
    const source = _address;
    if (source === null || source === undefined || !source) {
        return "Not Found";
    }
    else if (/^tz[a-z0-9]{34}$|^o[a-z0-9]{50}$/gi.test(source)) {
        return "xtz";
    }
    else if (/^[A-Z2-7]{58}$/g.test(source)) {
        return "algo";
    }
    else if (/^0x[a-fA-F0-9]{40}$/g.test(source)) {
        try {
            let assets = yield evmFetch();
            console.log(`\n\n ======= \n Assets: \n ${assets} \n ========== \n\n`);
            return assets;
        }
        catch (e) {
            return "Not Found";
        }
    }
    else if (/^T[A-Za-z1-9]{33}$/g.test(source)) {
        return "trx";
    }
    else if (/^r[1-9A-HJ-NP-Za-km-z]{25,33}$|^r[0-9a-zA-Z]{24,34}$/g.test(source)) {
        return "xrp";
    }
    else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/g.test(source)) {
        return "sol";
    }
    else if (/^(cosmos)[a-z0-9]{39}$/g.test(source)) {
        return "atom";
    }
    else if (/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/.test(source)) {
        return "hbar";
    }
    else if (/4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/g.test(source)) {
        return "xmr";
    }
    else if (/^[1-9A-HJ-NP-Za-km-z]{59}$|^(addr1)[a-z0-9]+/g.test(source)) {
        return "ada";
    }
    else if (/^(terra1)[a-z0-9A-Z]{38}$/g.test(source)) {
        return "lunc";
    }
    else if (/^ltc[a-zA-Z0-9]{5,88}$/g.test(source)) {
        return "ltc";
    }
    else if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$|^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(source)) {
        return "xlm";
    }
    else if (/^bc(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})$|^1[a-km-zA-HJ-NP-Z1-9]{25,34}(?!\/)$|^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/g.test(source)) {
        return "btc";
    }
    else if (/^([qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120}|(bitcoincash)?[qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})$/g.test(source)) {
        return "bch";
    }
    else if (/^grs[a-zA-Z0-9]{5,88}$/g.test(source)) {
        return "grs";
    }
    else if (/^X[a-km-zA-HJ-NP-Z1-9]{26,33}$|^7[a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(source)) {
        return "dash";
    }
    else if (/^D[a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(source)) {
        return "doge";
    }
    else if (/^t1[a-zA-Z0-9]{33}$/g.test(source)) {
        return "zec";
    }
    else {
        return "Not Found";
    }
});
exports.Search = Search;
const evmFetch = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("https://exchange.exodus.io/v3/assets", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0",
                "App-Name": "hf2_le_exchange_search",
                "App-Version": "1.0.0",
            },
        });
        if (!response.ok) {
            console.error("Failed to fetch assets. Status:", response.status);
            return null;
        }
        const data = yield response.json();
        const assets = data
            .map((asset) => asset.symbol);
        return assets;
    }
    catch (error) {
        console.error("Something went wrong during EVM fetch:", error);
        return null;
    }
});
//# sourceMappingURL=cryptoregex.js.map