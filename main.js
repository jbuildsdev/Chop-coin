import {
  ARKHIA_API_KEY,
  TOKEN_ID,
  DECIMAL_PRECISION,
  MIN_BALANCE,
} from "./config.js";

const decimals = 10 ** DECIMAL_PRECISION;
const balance = MIN_BALANCE * decimals;

var myHeaders = new Headers();
myHeaders.append("x-api-key", ARKHIA_API_KEY);

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};
async function fetchAllBalances(url, requestOptions) {
  let results = [];
  while (url) {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    results = results.concat(data.balances);
    url = data.links.next
      ? `https://pool.arkhia.io/hedera/mainnet${data.links.next}`
      : null;
  }
  return results;
}

fetchAllBalances(
  `https://pool.arkhia.io/hedera/mainnet/api/v1/tokens/${TOKEN_ID}/balances?account.balance=gt:${balance}`,
  requestOptions
)
  .then((results) => {
    results.forEach((item, index) => {
      console.log(
        `Item ${index + 1}: Account ID = ${item.account}, Balance = ${
          item.balance
        }`
      );
    });
  })
  .catch((error) => console.log("error", error));
