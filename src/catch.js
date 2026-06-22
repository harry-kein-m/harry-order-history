import cron from "node-cron";
import { makeCryptoUpDownSlug } from "./utils/index.js";
import { getMarketBySlug } from "./poly-utils/gama-client.js";
import { saveResult } from "./utils/saveResult.js";

const main = async () => {
  const slug = makeCryptoUpDownSlug();
  console.log(`-----------------------------------------------`);
  console.log(`| Subscribing to market with slug: ${slug.btc}|`);
  console.log(`|                                  ${slug.eth}|`);
  console.log(`|                                  ${slug.sol}|`);
  console.log(`-----------------------------------------------`);

  const marketDetail = await getMarketBySlug(slug);
  const btcClobTokenIds = JSON.parse(marketDetail.btc.clobTokenIds);
  const ethClobTokenIds = JSON.parse(marketDetail.eth.clobTokenIds);
  const solClobTokenIds = JSON.parse(marketDetail.sol.clobTokenIds);

  const ws = new WebSocket(
    "wss://ws-subscriptions-clob.polymarket.com/ws/market",
  );

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "market",
        assets_ids: btcClobTokenIds,
        custom_feature_enabled: true, // enables best_bid_ask, new_market, market_resolved events
      }),
    );
    ws.send(
      JSON.stringify({
        type: "market",
        assets_ids: ethClobTokenIds,
        custom_feature_enabled: true, // enables best_bid_ask, new_market, market_resolved events
      }),
    );
    ws.send(
      JSON.stringify({
        type: "market",
        assets_ids: solClobTokenIds,
        custom_feature_enabled: true, // enables best_bid_ask, new_market, market_resolved events
      }),
    );
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.event_type === "book") {
      switch (data.slug) {
        case slug.btc:
          await saveResult(data.slug, data, btcClobTokenIds);
          break;
        case slug.eth:
          await saveResult(data.slug, data, ethClobTokenIds);
          break;
        case slug.sol:
          await saveResult(data.slug, data, solClobTokenIds);
          break;
      }
    }
  };
};

const cronJob = cron.schedule("*/5 * * * *", main);
cronJob.start();
console.log("Cron job started");
