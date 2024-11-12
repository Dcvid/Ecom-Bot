const { Events } = require('discord.js');
const colors = require('colors');
const Balance = require('../schemas/balance'); 
const ExchangeRates = require('../schemas/exchangeRates'); 

module.exports = {
    name: Events.ClientReady,
    once: false,
    async execute(client) {
        console.log(colors.blue(`\n${client.user.tag} is now online!\n\n/---------------------------------/\n`));
        console.log(colors.white(`Bot is now online!`));
        console.log(colors.white(`Server Count: `) + colors.green(`${client.guilds.cache.size}.`));
        console.log(colors.white(`Member Count: `) + colors.green(`${client.users.cache.size}.`));
        console.log(colors.magenta(`Bot version: 0.0.1`) + colors.red(` | (UNDER HEAVY DEVELOPMENT)\n`));

        try {
            const previousData = await ExchangeRates.findOne({ clientID: client.user.id });
            const thresholdForChange = 1000; 

            const balances = await Balance.find();
            if (!previousData) {
                await ExchangeRates.create({
                    clientID: client.user.id,
                    totalBronzeBalance: 0,
                    totalGoldBalance: 0,
                    inflation: 0,
                    bronzeToGold: 0,
                });
            }

            let currentTotalBronzeBalance = 0;
            let currentTotalGoldBalance = 0;
            balances.forEach(balance => {
                currentTotalBronzeBalance += balance.balanceBronze;
                currentTotalGoldBalance += balance.balanceGold;
            });

            if (currentTotalBronzeBalance === 0) {
                currentTotalBronzeBalance = 1;
            }
            if (currentTotalGoldBalance === 0) {
                currentTotalGoldBalance = 1;
            }

            const bronzeToGoldRatio = currentTotalBronzeBalance / currentTotalGoldBalance;

            let newInflation = previousData.inflation;
            if (Math.abs(currentTotalBronzeBalance - previousData.totalBronzeBalance) > thresholdForChange || 
                Math.abs(currentTotalGoldBalance - previousData.totalGoldBalance) > thresholdForChange) {
                newInflation += (bronzeToGoldRatio > 7 ? 0.5 : (bronzeToGoldRatio < 5 ? -0.3 : 0));
            }
            console.log(colors.white(`Bronze to Gold ratio: `) + colors.green(`${bronzeToGoldRatio.toFixed(2)}.`, colors.white(` Inflation: `) + colors.green(`${newInflation.toFixed(2)}.`)));

            newInflation = Math.min(Math.max(newInflation, 0), 10);
            
            await ExchangeRates.updateOne({ clientID: client.user.id }, { 
                $set: { 
                    totalBronzeBalance: currentTotalBronzeBalance,
                    totalGoldBalance: currentTotalGoldBalance,
                    inflation: newInflation
                } 
            });

        } catch (error) {
            console.error('Error executing ClientReady event:', error);
        }
    },
};
