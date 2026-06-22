export const EthHistory = (sequelize, DataTypes) => {
  const EthHistory = sequelize.define(
    'EthHistory',
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
      tableName: 'eth_history',
      underscored: true,
      timestamps: false,
    },
  );

  return EthHistory;
}
