const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const balance = require('../../schemas/balance');
const initlizeBalance = require('../../utils/createSchema');
const emojis = require('../../utils/emojis');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Get your daily reward!'),
    async execute(interaction) {
        const user = interaction.user;
        const bal = await balance.findOne({userId: user.id});
        if(!bal) await initlizeBalance(user.id, interaction.guild.id);
        if (bal.dailyCollected) return interaction.reply({content: 'You have already claimed your daily reward!', ephemeral: true});


        const daily = Math.floor(Math.random() * 500) + 1;
        const newBal = bal.balanceBronze + daily;
        await balance.findOneAndUpdate({userId: user.id}, {balanceBronze: newBal});
        const embed = new EmbedBuilder()
            .setTitle('Daily Reward')
            .setDescription(`You have been given ${emojis.currencyBronze} ${daily} coins!`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({text: 'Daily Reward'});
        await interaction.reply({embeds: [embed], ephemeral: false});
        await balance.findOneAndUpdate({userId: user.id}, {dailyCollected: true});
        setTimeout(async () => {
            await balance.findOneAndUpdate({userId: user.id}, {dailyCollected: false});
        }, 86400000)

    },

    
};
