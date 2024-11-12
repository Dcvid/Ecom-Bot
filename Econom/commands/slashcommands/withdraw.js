const { SlashCommandBuilder } = require('discord.js');
const bal = require('../../schemas/balance');
const generate = require('../../utils/createEmbed');
const emojis = require('../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw money from your bank')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of money to withdraw')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('currency')
                .setDescription('The currency to withdraw (Bronze or Gold)')
                .setRequired(true)
                .addChoices({ name: 'Bronze', value: 'bronze' }, { name: 'Gold', value: 'gold' })
        ),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const currency = interaction.options.getString('currency');
        const formattedCurrency = currency.charAt(0).toUpperCase() + currency.slice(1);

        if (amount <= 0) {
            const errorEmbed = await generate.generateEmbed('Error', 'Amount must be at least `1`.', 'Red');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const userBalance = await bal.findOne({ userId: interaction.user.id });
        if (!userBalance || userBalance[`balance${formattedCurrency}`] < amount) {
            const errorEmbed = await generate.generateEmbed('Error', 'You do not have enough money to withdraw.', 'Red');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const newBalance = userBalance[`balance${formattedCurrency}`] + amount;
        const withdrawnField = `withdrawn${formattedCurrency}`;
        const newWithdrawnAmount = (userBalance[withdrawnField] || 0) + amount;
        const updateData = {
            [`balance${formattedCurrency}`]: newBalance,
            [withdrawnField]: newWithdrawnAmount
        };

        await bal.findOneAndUpdate({ userId: interaction.user.id }, updateData);

        const successEmbed = await generate.generateEmbed('Withdrawal Successful', `You have withdrawn ${emojis[`currency${formattedCurrency}`]} ${amount} from your bank.`, 'Green');
        return interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
