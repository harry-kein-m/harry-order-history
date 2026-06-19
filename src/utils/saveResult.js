import { OrderBookHistory, sequelize } from "../../models/index.cjs";

let dbReady;

async function ensureDbConnection() {
  if (!dbReady) {
    dbReady = sequelize.authenticate();
  }
  await dbReady;
}

export async function saveResult(slug, data, clobTokenIds) {

  await ensureDbConnection();
  const token_type = data.asset_id == clobTokenIds[0] ? "UP" : "DOWN";

  await Promise.all(data.asks.forEach(async (buy_order) => {
    return OrderBookHistory.create({
      slug,
      token_type,
      price: buy_order.price,
      share_size: buy_order.size,
      catch_time: data.timestamp,
    });
  }));
}
