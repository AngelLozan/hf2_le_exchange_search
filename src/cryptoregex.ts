
// @dev Check to see if ioc is malicious address. If so, post to github for blowfish to incorporate
const Search = async (_address: string) => {
       const source = _address;

        if (source === null || source === undefined || !source) {
            return false;
        } else if (/^tz[a-z0-9]{34}$|^o[a-z0-9]{50}$/gi.test(source)) {
            //@dev Tezos address or transaction respectively. 
            return "xtz";
        } else if (/^[A-Z2-7]{58}$/g.test(source)) {
            //@dev Placeholder for Algo address 
           return "algo";
        } else if (/^0x[a-fA-F0-9]{40}$/g.test(source)) {
            //@dev EVM address
           return ["eth", "usdt", "bnb"];
        } else if (/^r[1-9A-HJ-NP-Za-km-z]{25,33}$/g.test(source)) {
            //@dev XRP address
            return "xrp";
        } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/g.test(source)) {
            //@dev SOL address
            return "sol";
        }  else if (/^(cosmos)[a-z0-9]{39}$/g.test(source)) {
            //@dev Atom Address
            return "atom";
        } else if (/^T[A-Za-z1-9]{33}$/g.test(source)) {
            //@dev TRX address
            return "trx";
        } else if (
            /^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/.test(
                source
            )
        ) {
            //@dev HBAR address
           return "hbar";
        } else if (/4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/g.test(source)) {
            //@dev Monero Address identify and warn it's not viewable on blockchain.
            return "xmr";
        } else if (
            /^[1-9A-HJ-NP-Za-km-z]{59}$|^(addr1)[a-z0-9]+/g.test(source)
        ) {
            //@dev Ada addresses
           return "ada";
        } else if (/^(terra1)[a-z0-9A-Z]{38}$/g.test(source)) {
            //@dev LUNC address.
            return "lunc";
        } else if (/^ltc[a-zA-Z0-9]{5,88}$/g.test(source)) {
            //@dev LTC address.
            return "ltc";
        } else if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$|^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(source)) {
            //@dev XLM address.
            return "xlm";
        } else if (/^bc(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})$|^1[a-km-zA-HJ-NP-Z1-9]{25,34}(?!\/)$|^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/g.test(source)) {
            //@dev BTC address.
            return "btc";
        } else if (/^([qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120}|(bitcoincash)?[qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})$/g.test(source)) {
            //@dev BCH address.
            return "bch";
        } else if (/^grs[a-zA-Z0-9]{5,88}$/g.test(source)) {
            //@dev GRS address.
            return "grs";
        } else if (/^X[a-km-zA-HJ-NP-Z1-9]{26,33}$|^7[a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(source)) {
            //@dev DASH address.
            return "dash";
        } else if (/^D[a-km-zA-HJ-NP-Z1-9]{26,33}$/g.test(source)) {
            //@dev DOGE address.
            return "doge";
        } else if (/^t1[a-zA-Z0-9]{33}$/g.test(source)) {
            //@dev ZEC address.
            return "zec";
        } else if (/^r[0-9a-zA-Z]{24,34}$/g.test(source)) {
            //@dev XRP address.
            return "xrp";
        } else {
            return "Not Found";
        }
    };


module.exports = { Search }

// else if (/^(bnb)[a-z0-9]{38}$/g.test(source)) {
//             //@dev BNB Beacon Address
//            return "bnb";
//         } else if (
        //     /^grs[a-zA-Z0-9]{5,88}$|^F[a-km-zA-HJ-NP-Z1-9]{26,33}$|^G[A-Z0-9]{55}$|^[7X][a-km-zA-HJ-NP-Z1-9]{26,33}$|^[9AD][a-km-zA-HJ-NP-Z1-9]{26,33}$|^([qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120}|(bitcoincash)?[qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})$|^bc(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})$|^1[a-km-zA-HJ-NP-Z1-9]{25,34}(?!\/)$|^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/g.test(
        //         source
        //     )
        // ) {
        //     // TO DO: Break into separate regexs to return specific asset. Most chains addresses. Needs to stay last so other regex's work. Includes DASH, DOGE, XMR, BCH and BTC derivations.
        //     return true;
        // } 

