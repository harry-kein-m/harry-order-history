export const OrderBookHistory = (sequelize, DataTypes) => {
  const OrderBookHistory = sequelize.define(
    'OrderBookHistory',
    {
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      share_size: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      catch_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'order_book_history',
      underscored: true,
      timestamps: false,
    },
  );

  return OrderBookHistory;
}
