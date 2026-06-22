import cron from "node-cron";
import { makeCryptoUpDownSlug } from "./utils/index.js";
import { getMarketBySlug } from "./poly-utils/gama-client.js";
import { saveResult } from "./utils/saveResult.js";

let ws = null;
let pingInterval = null;
let activeSlugKey = null;
let subscriptionContext = null;
let connectionId = 0;

function slugKey(slug) {
  return `${slug.btc}|${slug.eth}|${slug.sol}`;
}

function closeConnection() {
  connectionId += 1;

  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
  if (ws) {
    const closing = ws;
    closing.onopen = null;
    closing.onmessage = null;
    closing.onerror = null;
    closing.onclose = null;
    closing.close();
    ws = null;
  }
  activeSlugKey = null;
  subscriptionContext = null;
}

function slugForAssetId(assetId) {
  const { slug, btcClobTokenIds, ethClobTokenIds, solClobTokenIds } =
    subscriptionContext;
  if (btcClobTokenIds.includes(assetId)) return slug.btc;
  if (ethClobTokenIds.includes(assetId)) return slug.eth;
  if (solClobTokenIds.includes(assetId)) return slug.sol;
  return null;
}

function clobTokenIdsForSlug(marketSlug) {
  const { slug, btcClobTokenIds, ethClobTokenIds, solClobTokenIds } =
    subscriptionContext;
  if (marketSlug === slug.btc) return btcClobTokenIds;
  if (marketSlug === slug.eth) return ethClobTokenIds;
  if (marketSlug === slug.sol) return solClobTokenIds;
  return [];
}

async function handleBookEvent(book) {
  const marketSlug = slugForAssetId(book.asset_id);
  if (!marketSlug) return;
  await saveResult(marketSlug, book, clobTokenIdsForSlug(marketSlug));
}

const main = async () => {
  const slug = makeCryptoUpDownSlug();
  const key = slugKey(slug);

  if (ws && activeSlugKey === key) {
    return;
  }

  closeConnection();

  console.log(`-----------------------------------------------`);
  console.log(`| Subscribing to market with slug: ${slug.btc}|`);
  console.log(`|                                  ${slug.eth}|`);
  console.log(`|                                  ${slug.sol}|`);
  console.log(`-----------------------------------------------`);

  let marketDetail;
  try {
    marketDetail = await getMarketBySlug(slug);
  } catch (error) {
    console.error("Failed to fetch market details:", error.message);
    return;
  }

  const btcClobTokenIds = JSON.parse(marketDetail.btc.clobTokenIds);
  const ethClobTokenIds = JSON.parse(marketDetail.eth.clobTokenIds);
  const solClobTokenIds = JSON.parse(marketDetail.sol.clobTokenIds);

  subscriptionContext = {
    slug,
    btcClobTokenIds,
    ethClobTokenIds,
    solClobTokenIds,
  };
  activeSlugKey = key;

  const connId = connectionId;
  const socket = new WebSocket(
    "wss://ws-subscriptions-clob.polymarket.com/ws/market",
  );
  ws = socket;

  socket.onopen = () => {
    if (connId !== connectionId || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      socket.send(
        JSON.stringify({
          type: "market",
          assets_ids: [
            ...btcClobTokenIds,
            ...ethClobTokenIds,
            ...solClobTokenIds,
          ],
          custom_feature_enabled: true,
        }),
      );
    } catch (error) {
      console.error("Failed to subscribe:", error.message);
      return;
    }

    pingInterval = setInterval(() => {
      if (connId !== connectionId || socket.readyState !== WebSocket.OPEN) {
        return;
      }
      socket.send("PING");
    }, 10_000);
  };

  socket.onmessage = async (event) => {
    if (connId !== connectionId) {
      return;
    }
    const raw = event.data;
    if (typeof raw !== "string") {
      return;
    }

    if (raw === "PONG") {
      return;
    }

    if (raw === "INVALID OPERATION") {
      console.error("WebSocket server rejected operation:", raw);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", raw);
      return;
    }

    const messages = Array.isArray(parsed) ? parsed : [parsed];
    for (const data of messages) {
      if (data.event_type === "book") {
        await handleBookEvent(data);
      }
    }
  };

  socket.onerror = (error) => {
    if (connId !== connectionId) {
      return;
    }
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    if (connId !== connectionId) {
      return;
    }
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    ws = null;
    activeSlugKey = null;
    subscriptionContext = null;
  };
};

const cronJob = cron.schedule("*/5 * * * *", async () => {
  try {
    await main();
  } catch (error) {
    console.error("Error in main:", error);
  }
});
cronJob.start();
console.log("Cron job started");
