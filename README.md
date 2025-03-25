# HF2 LE Exchange Search

A little automation for the Hack Force II team.

![image](./assets/hf2_recursive_exchange_search.png)

## Basic info and Scope
- Search by address can be done via API but I believe the currency has to be included as well in order to return the results. 
- You can't define a time range via API, it'll just give you all that matches. 
- It has to include the fromAsset or the toAsset. 
- We don’t always receive the asset with the address. This will effect searching for EVM and TRX addresses. We’ll get all assets that match the address (ETH, BNB, TRX, USDT). 

- Match `TO ADDRESS` to `TO CURRENCY` & `FROM ADDRESS` to `FROM CURRENCY`

https://exchange.exodus.io/v3/orders?toAddress=31muhDdxQEE7E2MUUF3qunAKr4NR4Tn1Qy&toAsset=BTC

https://exchange.exodus.io/v3/orders?fromAddress=addr1q84x3qh7e0q6fldmj5mnk89vjlvgncsw5g9dmxmel4qt00j04mm39fw8l4pewc59xl59v7zszwye9vhuh3zwft8e5j9sslflq0&fromAsset=ADA

```curl

curl --user-agent "Mozilla/5.0 (X11; Linux x86\_64; rv:60.0) Gecko/20100101 Firefox/81.0" --location 'https://exchange.exodus.io/v3/orders?toAddress=TWZ5fhmREyszAwyfFESHcBanMwY42LEiuP&toAsset=TRX' \
--header 'App-Name: hf2_le_exchange_search' \
--header 'App-Version: 1.0.0' | fx .
```

```curl
curl --user-agent "Mozilla/5.0 (X11; Linux x86\_64; rv:60.0) Gecko/20100101 Firefox/81.0" --location 'https://exchange.exodus.io/v3/orders?fromAddress=TWZ5fhmREyszAwyfFESHcBanMwY42LEiuP&fromAsset=TRX' \
--header 'App-Name: hf2_le_exchange_search' \
--header 'App-Version: 1.0.0' | fx .

```

Get Assets: 

```curl
curl --user-agent "Mozilla/5.0 (X11; Linux x86\_64; rv:60.0) Gecko/20100101 Firefox/81.0" --location 'https://exchange.exodus.io/v3/assets' \
--header 'App-Name: hf2_le_exchange_search' \
--header 'App-Version: 1.0.0' | fx .

```

Response example:

```json
[
  {
    "id": "USDTTRX",
    "name": "Tether USD",
    "network": "tronmainnet",
    "decimals": 6,
    "symbol": "USDT",
    "meta": {
      "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    },
    "tronmainnet": {
      "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    }
  },
  {
    "id": "USDTTEZOS",
    "name": "Tether USD",
    "network": "tezos",
    "decimals": 6,
    "symbol": "USDT"
  },
  {
    "id": "USDTbscDDEDF0F8",
    "name": "Tether USD",
    "network": "bsc",
    "decimals": 18,
    "symbol": "USDT",
    "meta": {
      "contractAddress": "0x55d398326f99059fF775485246999027B3197955"
    },
    "bsc": {
      "contractAddress": "0x55d398326f99059fF775485246999027B3197955"
    }
  }
 ]
```

## 📦 Requirements

Before installing, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version >= 22.0.0)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [TypeScript](https://www.typescriptlang.org/) (installed automatically via `devDependencies`)
- [Git](https://git-scm.com/)

## 🚀 Getting Started


### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hf2_law_enforcement_search.git
cd hf2_law_enforcement_search
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the Project

```bash
tsc
```


### 4. Usage:

- Order of arguments is important. If you have one argument and not the other separating two, then use a space and an empty string `''`
- Structure the CSV, if path passed, to have one header value named `Address` under which all addresses you wish to check are located. *`Address` is case sensitive*
  
- You do not need to include the asset on the csv, just one column, the `Address`. Assets are determined initially, where unavailable from the API call, in the `./src/cryptoregex.ts`. 

ex: 

```csv
Address
0x.......
TR.....
bc1......

```


Full implementation with all parameters possible in the designated order:

```zsh
npm run search '<path_to_csv_of_addresses>' '<fromAddress>' '<toAddress>' '<toCurrency>' '<fromCurrency>'
```


Search based on CSV of addresses:

```zsh
npm run search '<path_to_csv_of_addresses>'
```

Example where you have no CSV but you have a `fromAddress` and nothing else (ie. the other parameters will be `null`):

```zsh
npm run search '' '<fromAddress>' 
```


With only single addresses and currencies:

```zsh
npm run search '' '<fromAddress>' '<toAddress>' '<toCurrency>' '<fromCurrency>'
```



### 5. Contributions & Maintenance:

- For all HF2 Members, or anyone, you are welcome to contribute code. Except for Jason. Jason, ur a naughty boi 🫵 . Everyone else, clone the repo, add your contribution and make a PR. 
  
  
