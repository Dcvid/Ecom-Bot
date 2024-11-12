const { Schema, model } = require('mongoose');

const tierSchema = Schema({
    name: String,
    cost: Number,
    maxDeposits: Number,
    purchased: Boolean
});

const balanceSchema = Schema({
    userId: String,
    guildId: String,
    balanceBronze: Number,
    balanceGold: Number,
    currentBankIndex: Number,
    dailyCollected: Boolean,
    respectValue: Number,
    depositedGold: Number,  
    depositedBronze: Number,  
    bank: [tierSchema] 
});

module.exports = model('balance', balanceSchema);
