const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const bal = require('../../schemas/balance');
const initializeNewBalance = require('../../utils/createSchema');
const emojis = require('../../utils/emojis');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Rob a user')
        .addUserOption(option => option.setName('user').setDescription('The user you want to rob').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser('user');
        if (user.bot) return interaction.followUp({content: 'You can\'t rob bots', ephemeral: true})
        const author = interaction.user;
        const authorData = await bal.findOne({userId: author.id});

        if (user.id === author.id) return interaction.reply({content: 'You can\'t rob yourself', ephemeral: true});

        if (!authorData) {
            await initializeNewBalance(author.id, interaction.guild.id);
            return interaction.followUp({content: 'Robbery failed, please try again', ephemeral: true});
        }
       
        const randomAmt = Math.floor(Math.random() * 100) + 1;
        const chance = Math.floor(Math.random() * 100) + 1;
        const currencyChances = Math.floor(Math.random() * 10);

        if (chance > 50) {
            const userBal = await bal.findOne({userId: user.id});
            if (!userBal) {
                await initializeNewBalance(user.id, interaction.guild.id);
                return interaction.followUp({content: 'Robbery failed, please try again', ephemeral: true});
            }
            if (userBal.balance < randomAmt) {
                return interaction.followUp({content: 'Robbery failed, please try again', ephemeral: true});

            }
            if (currencyChances <= 5) {
                await bal.findOneAndUpdate({userId: user.id}, {$inc: {balanceBronze: -randomAmt}});
                await bal.findOneAndUpdate({userId: author.id}, {$inc: {balanceBronze: randomAmt, respectValue: -5}});
                const embed = new EmbedBuilder()
                    .setTitle('Robbery')
                    .setDescription(`You robbed ${user.username} and got ${emojis.currencyBronze} ${randomAmt} coins`)
                    .setColor('Green')
                    .setTimestamp();
                return interaction.followUp({embeds: [embed], ephemeral: true});
            }
            if (currencyChances > 5 && currencyChances <= 10) {
                await bal.findOneAndUpdate({userId: user.id}, {$inc: {balanceGold: -randomAmt}});
                await bal.findOneAndUpdate({userId: author.id}, {$inc: {balanceGold: randomAmt, respectValue: -10}});
                const embed = new EmbedBuilder()
                    .setTitle('Robbery')
                    .setDescription(`You robbed ${user.username} and got ${emojis.currencyGold} ${randomAmt} coins.`)
                    .setColor('Green')
                    .setTimestamp();
                return interaction.followUp({embeds: [embed], ephemeral: true});
            }

            

        }
        if (chance < 50) {
            const userBal = await bal.findOne({userId: author.id});
            if (!userBal) {
                await initializeNewBalance(author.id, interaction.guild.id);
                return interaction.followUp({content: 'Robbery failed, please try again', ephemeral: true});
            }
            if (userBal.balance < randomAmt) {
                return interaction.followUp({content: 'Robbery failed, please try again', ephemeral: true});

            }
            await bal.findOneAndUpdate({userId: user.id}, {$inc: {balanceBronze: randomAmt}});
            await bal.findOneAndUpdate({userId: author.id}, {$inc: {balanceBronze: -randomAmt, respectValue: -15}});
            const embed = new EmbedBuilder()
                .setTitle('Robbery')
                .setDescription(`You got caught trying to rob ${user.username} and lost ${emojis.currencyBronze} ${randomAmt} coins.`)
                .setColor('Red')
                .setTimestamp();
            return interaction.followUp({embeds: [embed], ephemeral: true});


        } 
         if (chance === 50) {
            const userBal = await bal.findOne({userId: author.id});
            if (!userBal) {
                await initializeNewBalance(author.id, interaction.guild.id);
                return interaction.followUp({content: 'Robbery failed, please try again', ephemeral: true});
            }
            if (userBal.balance < randomAmt) {
                return interaction.followUp({content: 'Robbery failed, please try again', ephemeral: true});
            }
            if (userBal.balance > randomAmt) {

                const embed = new EmbedBuilder()
                    .setTitle('Robbery')
                    .setDescription(`You got caught trying to rob ${user.username} and lost ${emojis.currencyBronze} ${randomAmt} coins.`)
                    .setColor('Red')
                    .setTimestamp();
                return interaction.followUp({embeds: [embed], ephemeral: true});

            }

        }

    },


};
