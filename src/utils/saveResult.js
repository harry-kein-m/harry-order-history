import { BtcHistory as defineBtcHistory } from "../../database/models/btc-history.js";
import { EthHistory as defineEthHistory } from "../../database/models/eth-history.js";
import { SolHistory as defineSolHistory } from "../../database/models/sol-history.js";
import { Sequelize, DataTypes } from "sequelize";
import config from "../../database/config/config.cjs";
const { development: dbConfig } = config;
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);

export async function saveResult(slug, data, clobTokenIds) {
  let History;
  switch (slug.split("-")[0]) {
    case "btc":
      History = defineBtcHistory(sequelize, DataTypes);
      break;
    case "eth":
      History = defineEthHistory(sequelize, DataTypes);
      break;
    case "sol":
      History = defineSolHistory(sequelize, DataTypes);
      break;
    default:
      throw new Error(`Invalid slug: ${slug}`);
  }

  const asks = data.asks ?? [];

  if (asks.length === 0) {
    return;
  }

  const token_type = data.asset_id == clobTokenIds[0] ? "UP" : "DOWN";

  await Promise.all(
    asks.map((buy_order) =>
      History.create({
        slug,
        token_type,
        price: Number(buy_order.price),
        share_size: Number(buy_order.size),
        catch_time: data.timestamp ? new Date(Number(data.timestamp)) : new Date(),
      }),
    ),
  );
}
