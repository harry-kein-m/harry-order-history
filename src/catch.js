import cron from "node-cron";
import { makeCryptoUpDownSlug } from "./utils/index.js";
import { getMarketBySlug } from "./poly-utils/gama-client.js";
import { saveResult } from "./utils/saveResult.js";

let ws = null;
let pingInterval = null;
let activeSlugKey = null;
let subscriptionContext = null;

function slugKey(slug) {
  return `${slug.btc}|${slug.eth}|${slug.sol}`;
}

function closeConnection() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
  if (ws) {
    ws.close();
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

  const marketDetail = await getMarketBySlug(slug);
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

  ws = new WebSocket(
    "wss://ws-subscriptions-clob.polymarket.com/ws/market",
  );

  ws.onopen = () => {
    ws.send(
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

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("PING");
      }
    }, 10_000);
  };

  ws.onmessage = async (event) => {
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

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    ws = null;
    activeSlugKey = null;
    subscriptionContext = null;
  };
};

const cronJob = cron.schedule("*/5 * * * * *", main);
cronJob.start();
console.log("Cron job started");
