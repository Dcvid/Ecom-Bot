

const mongoose = require('mongoose');


const exchangeRateSchema = new mongoose.Schema({
    clientID: {
        type: String,
        required: true,
    },

    bronzeToGold: {
        type: Number,
        required: true,
        default: 100 
    },
    inflation: {
        type: Number,
        required: true,
        default: 0 
    },
    lastUpdated: {
        type: Date,
        default: Date.now()
    },
    totalBronzeBalance: {
        type: Number,
        required: true,
        default: 0
    },
    totalGoldBalance: {
        type: Number,
        required: true,
        default: 0
    }
});


const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

module.exports = ExchangeRate;
