import cron from "node-cron";
import { makeCryptoUpDownSlug } from "./utils/index.js";
import { getMarketBySlug } from "./poly-utils/gama-client.js";
import { saveResult } from "./utils/saveResult.js";

const main = async () => {
  const slug = makeCryptoUpDownSlug();
  console.log(`Subscribing to market with slug: ${slug}`);

  const marketDetail = await getMarketBySlug(slug);
  const clobTokenIds = JSON.parse(marketDetail.clobTokenIds);

  const ws = new WebSocket(
    "wss://ws-subscriptions-clob.polymarket.com/ws/market",
  );

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "market",
        assets_ids: clobTokenIds,
        custom_feature_enabled: true, // enables best_bid_ask, new_market, market_resolved events
      }),
    );
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.event_type) {
      case "book": // full orderbook snapshot
        try {
          await saveResult(slug, data, clobTokenIds);
        } catch (error) {
          console.error("Failed to save order book:", error.message);
        }
        break;
    }
  };
};

const cronJob = cron.schedule("*/5 * * * * *", main);
cronJob.start();
console.log("Cron job started");
