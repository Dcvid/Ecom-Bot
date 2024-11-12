const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const init = require('../../utils/createSchema');
const emojis = require('../../utils/emojis');
const bal = require('../../schemas/balance');
const embeds = require('../../utils/createEmbed');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-monies')
        .setDescription('Give money to someone')
        .addUserOption(option => option.setName('user').setDescription('The user you want to give money to').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of money you want to give').setRequired(true))
        .addStringOption(option => option.setName('currency').setDescription('The currency you want to give').setRequired(true).addChoices({name: "Bronze", value: "Bronze"}, {name: "Gold", value: "Gold"})),
                
    async execute(interaction) {
        try {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const currency = interaction.options.getString('currency');

        const balance = await bal.findOne({ userId: interaction.user.id });
        const userBalance = await bal.findOne({ userId: user.id });
        cur = `balance${currency}`

        if (!balance) await init(interaction.user.id, interaction.guild.id);
        if (!userBalance) await init(user.id, interaction.guild.id);
        if (balance[cur] < amount) return interaction.reply({ content: `You don't have enough ${currency} to give!`, ephemeral: true });
        if (amount < 1) return interaction.reply({ content: `You can't give less than 1 ${currency}!`, ephemeral: true });
        if (balance[cur] == amount ) return interaction.reply({ content: `You can't give all of your ${currency}!`, ephemeral: true });
        if (user.id == interaction.user.id) return interaction.reply({ content: `You can't give money to yourself!`, ephemeral: true });

        await balance.updateOne({ $inc: { [cur]: -amount } });
        await userBalance.updateOne({ $inc: { [cur]: amount } });
 
        let emoji = `currency${currency}`

        const embed = await embeds.generateEmbed(
            `${emojis.success} Success!`,
            `You gave ${user} ${emojis[emoji]} \`${amount}\`!\n`,
            'Green',
            '',
            [
                { name: 'New Balance', value: `You now have \`${balance[cur] - amount}\` ${emojis[emoji]}` }
            ]
        );
         
        interaction.reply({ embeds: [embed], ephemeral: false });
        } catch (err) {
            const errorEmbed = await embeds.generateErrorEmbed(err)
            console.log(err)
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }


        

    },


}


