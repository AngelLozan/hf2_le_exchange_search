type Asset = {
    symbol: string;
    meta?: {
        contractAddress?: string;
    };
};


const Search = async (_address: string) => {
    const source = _address;

    if (source === null || source === undefined || !source) {
        return "Not Found";
    } else if (/^tz[a-z0-9]{34}$|^o[a-z0-9]{50}$/gi.test(source)) {
        //@dev Tezos address or transaction respectively.
        return "xtz";
    } else if (/^[A-Z2-7]{58}$/g.test(source)) {
        //@dev Placeholder for Algo address
        return "algo";
    } else if (/^0x[a-fA-F0-9]{40}$/g.test(source)) {
        //@dev EVM address
        try{
            let assets: string[] | null = await evmFetch();
            return assets;
        } catch(e:any){
            return "Not Found"
        }
        // return ["eth", "usdt", "bnb"]; // For testing
    } else if (/^T[A-Za-z1-9]{33}$/g.test(source)) {
        //@dev TRX address
        return "trx";
    } else if (
        /^r[1-9A-HJ-NP-Za-km-z]{25,33}$|^r[0-9a-zA-Z]{24,34}$/g.test(source)
    ) {
        //@dev XRP address
        return "xrp";
    } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/g.test(source)) {
        //@dev SOL address
        return "sol";
    } else if (/^(cosmos)[a-z0-9]{39}$/g.test(source)) {
        //@dev Atom Address
        return "atom";
    } else if (
        /^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/.test(
            source,
        )
    ) {
        //@dev HBAR address
        return "hbar";
    } else if (/4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/g.test(source)) {
        //@dev Monero Address identify and warn it's not viewable on blockchain.
        return "xmr";
    } else if (/^[1-9A-HJ-NP-Za-km-z]{59}$|^(addr1)[a-z0-9]+/g.test(source)) {
        //@dev Ada addresses
        return "ada";
    } else if (/^(terra1)[a-z0-9A-Z]{38}$/g.test(source)) {
        //@dev LUNC address.
        return "lunc";
    } else if (/^ltc[a-zA-Z0-9]{5,88}$/g.test(source)) {
        //@dev LTC address.
        return "ltc";
    } else if (
        /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$|^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(
            source,
        )
    ) {
        //@dev XLM address.
        return "xlm";
    } else if (
        /^bc(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})$|^1[a-km-zA-HJ-NP-Z1-9]{25,34}(?!\/)$|^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/g.test(
            source,
        )
    ) {
        //@dev BTC address.
        return "btc";
    } else if (
        /^([qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120}|(bitcoincash)?[qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})$/g.test(
            source,
        )
    ) {
        //@dev BCH address.
        return "bch";
    } else if (/^grs[a-zA-Z0-9]{5,88}$/g.test(source)) {
        //@dev GRS address.
        return "grs";
    } else if (
        /^X[a-km-zA-HJ-NP-Z1-9]{26,33}$|^7[a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(
            source,
        )
    ) {
        //@dev DASH address.
        return "dash";
    } else if (/^D[a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(source)) {
        //@dev DOGE address.
        return "doge";
    } else if (/^t1[a-zA-Z0-9]{33}$/g.test(source)) {
        //@dev ZEC address.
        return "zec";
    } else {
        return "Not Found";
    }
};

const evmFetch = async (): Promise<string[] | null> => {
    try {
        const response = await fetch("https://exchange.exodus.io/v3/assets", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0",
                "App-Name": "hf2_le_exchange_search",
                "App-Version": "1.0.0",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch assets. Status:", response.status);
            return null;
        }

        const data = await response.json();
        // [{...}, {...}]

        // TO DO: Filter for EVM assets.
        // Ex: Returns the `symbol` of all assets:
        const assets: string[] = (data as Asset[])
            .filter((asset: any) => asset.meta?.contractAddress && /^0x[a-fA-F0-9]{40}$/g.test(asset.meta.contractAddress)) 
            .map((asset: any) => asset.symbol);
        // console.log("\n\n Assets: ", assets);
        return assets;
    } catch (error: any) {
        console.error("Something went wrong during EVM fetch:", error);
        return null;
    }
};

module.exports = { Search };


