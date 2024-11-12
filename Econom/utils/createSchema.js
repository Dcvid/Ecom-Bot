const Balance = require('../schemas/balance'); 


async function initializeNewBalance(userId, guildId) {
    const initialTiers = [
        {
            name: "1st Tier",
            cost: 0,
            maxDeposits: 2000,
            purchased: true
        },
        {
            name: "2nd Tier",
            cost: 5000,
            maxDeposits: 8000,
            purchased: false
        },
        {
            name: "3rd Tier",
            cost: 10000,
            maxDeposits: 15000,
            purchased: false
        },
        {
            name: "4th Tier",
            cost: 20000,
            maxDeposits: 30000,
            purchased: false
        }
    ];

    const newBalance = new Balance({
        userId,
        guildId,
        balanceBronze: 0,
        balanceGold: 0,
        currentBankIndex: 0,
        dailyCollected: false,
        respectValue: 0,
        depositedGold: 0,
        depositedBronze: 0,
        bank: initialTiers
    });

    try {
        const savedBalance = await newBalance.save();
        return savedBalance; 
    } catch (error) {
        console.error('Error saving balance document:', error);
        throw error; 
    }
}

module.exports = initializeNewBalance; 

