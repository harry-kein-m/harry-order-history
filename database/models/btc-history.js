export const BtcHistory = (sequelize, DataTypes) => {
  const BtcHistory = sequelize.define(
    'BtcHistory',
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
      tableName: 'btc_history',
      underscored: true,
      timestamps: false,
    },
  );

  return BtcHistory;
}
