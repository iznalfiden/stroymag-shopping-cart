module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define('cart', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        quantity: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.DECIMAL,
            allowNull: false
        },
    }, {
        timestamps: false
    })
    return Cart
}