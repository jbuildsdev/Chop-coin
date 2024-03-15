import {
  ARKHIA_API_KEY,
  TOKEN_ID,
  DECIMAL_PRECISION,
  MIN_BALANCE,
  SUPABASE_SERVICE_KEY,
  SUPABASE_URL,
} from "./config.js";

import { createClient } from "@supabase/supabase-js";

const decimals = 10 ** DECIMAL_PRECISION;
const balance = MIN_BALANCE * decimals;

var myHeaders = new Headers();
myHeaders.append("x-api-key", ARKHIA_API_KEY);

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
  timeout: 100000,
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Fetch and paginate all balances over the minimum balance defined in env
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

// Store balances in Supabase
async function storeBalances(balances) {
  for (const item of balances) {
    const { data, error } = await supabase
      .from("balances")
      .insert([{ account: item.account, balance: item.balance }]);

    if (error) {
      console.error("Error inserting balance:", error);
    }
  }
}

// fetchAllBalances(
//   `https://pool.arkhia.io/hedera/mainnet/api/v1/tokens/${TOKEN_ID}/balances?account.balance=gt:${balance}`,
//   requestOptions
// )
//   .then((results) => {
//     storeBalances(results);
//   })
//   .catch((error) => console.log("error", error));

//console log balances
/*
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
  */

async function fetchAndLogBalances() {
  const { data: balances, error } = await supabase.from("balances").select("*");

  if (error) {
    console.error("Error fetching balances:", error);
    return;
  }

  for (const balance of balances) {
    console.log(`Account: ${balance.account}, Balance: ${balance.balance}`);
  }
}
async function fetchAndCompareBalances() {
  // Fetch old balances from Supabase
  const { data: oldBalances, error: oldBalancesError } = await supabase
    .from("balances")
    .select("*");

  if (oldBalancesError) {
    console.error("Error fetching old balances:", oldBalancesError);
    return;
  }

  // Fetch new balances from API
  const newBalances = await fetchAllBalances(
    `https://pool.arkhia.io/hedera/mainnet/api/v1/tokens/${TOKEN_ID}/balances?account.balance=gt:${balance}`,
    requestOptions
  );

  // Compare balances and log account IDs with increased balance
  for (const newBalance of newBalances) {
    const oldBalance = oldBalances.find(
      (balance) => balance.account === newBalance.account
    );

    if (oldBalance) {
      const balanceChange =
        (newBalance.balance - oldBalance.balance) / DECIMAL_PRECISION;
      if (balanceChange >= 1) {
        console.log(
          `Account: ${newBalance.account}, Balance increased by: ${balanceChange}`
        );
      }
    }
  }
}

fetchAndCompareBalances();
