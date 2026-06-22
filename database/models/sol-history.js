export const SolHistory = (sequelize, DataTypes) => {
  const SolHistory = sequelize.define(
    'SolHistory',
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
      tableName: 'sol_history',
      underscored: true,
      timestamps: false,
    },
  );

  return SolHistory;
}
