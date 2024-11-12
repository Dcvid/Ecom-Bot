const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExchangeRates = require('../../schemas/exchangeRates');
const balances = require('../../schemas/balance');
const initlizeBalance = require('../../utils/createSchema');
const emojis = require('../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exchange')
        .setDescription('Exchange currencies between gold and bronze.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('convert')
                .setDescription('Convert currencies.')
                .addStringOption(option =>
                    option.setName('direction')
                        .setDescription('Choose the direction of exchange.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Gold to Bronze', value: 'gold_to_bronze' },
                            { name: 'Bronze to Gold', value: 'bronze_to_gold' }
                        ))
                .addIntegerOption(option => option.setName('amount').setDescription('Amount to exchange').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rates')
                .setDescription('View current exchange rates.')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'convert': {
                    
                const direction = interaction.options.getString('direction');
                const amount = interaction.options.getInteger('amount');
                let exchangeRateData = await ExchangeRates.findOne({ clientID: interaction.client.user.id });
                
                if (!exchangeRateData) {
                    return interaction.reply('Exchange rates are not available at the moment.');
                }
                
                let minAmount;
                let resultAmount;
                const balanceData = await balances.findOne({ userId: interaction.user.id });
                
                if (!balanceData) {
                    await initlizeBalance(interaction.user.id, interaction.guild.id);
                }
                
                const inflation = exchangeRateData.inflation > 0 ? exchangeRateData.inflation : 1;
                const totalBronze = balanceData.balanceBronze;
                const totalGold = balanceData.balanceGold;
                const bronzeToGoldRatio = totalGold === 0 ? 0 : totalBronze / totalGold;

                if (direction === 'gold_to_bronze') {
                    // Adjust exchange rate based on scarcity
                    resultAmount = amount * bronzeToGoldRatio * inflation;
                    minAmount = 100 / (bronzeToGoldRatio * inflation);
                    
                    if (amount < minAmount) {
                        return interaction.reply({ content: `You must exchange at least ${minAmount.toFixed(2)} gold.`, ephemeral: true });
                    }
                    if (totalGold < amount) {
                        return interaction.reply({ content: 'You do not have enough gold to exchange.', ephemeral: true });
                    }
                    
                    const embed = new EmbedBuilder()
                        .setTitle('Exchanged')
                        .setDescription(`You have exchanged ${emojis.currencyGold} ${amount} gold for ${emojis.currencyBronze} ${resultAmount.toFixed(2)} bronze.`)
                        .setColor('Green')
                        .setTimestamp();
        

                    interaction.reply({ embeds: [embed] });
                    await balances.findOneAndUpdate({ userId: interaction.user.id }, { $inc: { balanceGold: -amount, balanceBronze: resultAmount } });
                } else if (direction === 'bronze_to_gold') {
                    resultAmount = amount / (bronzeToGoldRatio * inflation);
                    minAmount = 100 * inflation;
                    
                    if (amount < minAmount) {
                        return interaction.reply({ content: `You must exchange at least ${minAmount.toFixed(2)} bronze.`, ephemeral: true });
                    }
                    if (totalBronze < amount) {
                        return interaction.reply({ content: 'You do not have enough bronze to exchange.', ephemeral: true });
                    }
                    
                    const embed = new EmbedBuilder()
                        .setTitle('Exchanged')
                        .setDescription(`You have exchanged ${emojis.currencyBronze} ${amount} bronze for ${emojis.currencyGold} ${resultAmount.toFixed(2)} gold.`)
                        .setColor('Green')
                        .setTimestamp();
                    
                    interaction.reply({ embeds: [embed] });
                    await balances.findOneAndUpdate({ userId: interaction.user.id}, { $inc: { balanceGold: resultAmount, balanceBronze: -amount } });
                } else {
                    interaction.reply('Invalid exchange direction.');
                }
            } 
            break;
            case 'rates': {
                let exchangeRateData = await ExchangeRates.findOne({ clientID: interaction.client.user.id });
                if (!exchangeRateData) {
                    return interaction.reply('Exchange rates are not available at the moment.');
                }
                const bronzeToGoldRatio = exchangeRateData.bronzeToGold * exchangeRateData.inflation === 0 ? 1 : exchangeRateData.bronzeToGold * exchangeRateData.inflation;
                const embed = new EmbedBuilder()
                    .setTitle('Exchange Rates')
                    .setDescription('Current exchange rates.\n')
                    .addFields({ name: 'Gold to Bronze', value: `1 ${emojis.currencyGold} = ${bronzeToGoldRatio.toFixed(2)} ${emojis.currencyBronze}`, inline: true }, { name: 'Bronze to Gold', value: `1 ${emojis.currencyBronze} = ${(1 / bronzeToGoldRatio).toFixed(2)} ${emojis.currencyGold}`, inline: true })
                    .setColor('Blurple')
                    .setFooter({text: `Last updated: ${exchangeRateData.lastUpdated.toUTCString()} `})   
                    .setTimestamp();
                interaction.reply({ embeds: [embed] });
            }
        }
    },
};
