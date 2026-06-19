import { OrderBookHistory as defineOrderBookHistory } from "../../database/models/order-book-history.js";
import { Sequelize, DataTypes } from "sequelize";
import config from "../../database/config/config.cjs";
const { development: dbConfig } = config;
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);
const OrderBookHistory = defineOrderBookHistory(sequelize, DataTypes);

export async function saveResult(slug, data, clobTokenIds) {
  const asks = data.asks ?? [];

  if (asks.length === 0) {
    return;
  }

  const token_type = data.asset_id == clobTokenIds[0] ? "UP" : "DOWN";

  await Promise.all(
    asks.map((buy_order) =>
      OrderBookHistory.create({
        slug,
        token_type,
        price: Number(buy_order.price),
        share_size: Number(buy_order.size),
        catch_time: data.timestamp ? new Date(Number(data.timestamp)) : new Date(),
      }),
    ),
  );
}
