const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const data  = require('../../schemas/balance');
const initializeNewBalance  = require('../../utils/createSchema');
const emojis = require('../../utils/emojis');

module.exports = {
    cooldown: 300,
    data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg for money'),
    async execute(interaction) {
        const chancesForCurrencies = Math.floor(Math.random() * 10);
        const chance = Math.floor(Math.random() * 10);
        
        const amount = Math.floor(Math.random() * 50) + 1;

        await interaction.deferReply();
        const user = interaction.user;
        const balance = await data.findOne({userId: user.id});
        newRespect = 5 ;


        if(!balance) {
            await initializeNewBalance(user.id, interaction.guild.id);
            const embed = new EmbedBuilder()
            .setTitle('Beg')
            .setDescription(`You begged and got nothing`)
            .setColor('Red')
            .setFooter({text: 'Get shammed.' })            
            return await interaction.followUp({embeds: [embed]});
        }


        
        if(chance >= 4) {
            
            await data.findOneAndUpdate({userId: user.id}, {$inc: {balanceBronze: amount, respectValue: -newRespect}});
            if (chancesForCurrencies < 8) {
                const embed = new EmbedBuilder()
                    .setTitle('Beg')
                    .setDescription(`You begged and got ${emojis.currencyBronze} ${amount} coins.`)
                    .setColor('Green')
                    .setFooter({text: 'Not the best way to earn money.' })
                    await interaction.followUp({embeds: [embed]});
                    await data.findOneAndUpdate({userId: user.id}, {$inc: {balanceBronze: amount}});

            }
            if (chancesForCurrencies >= 8 && chancesForCurrencies < 10) {
                const embed = new EmbedBuilder()
                    .setTitle('Beg')
                    .setDescription(`You begged and got lucky! You got ${emojis.currencyGold} ${amount} coins.`)
                    .setColor('Green')
                    .setFooter({text: 'Maybe this is the best way to earn money.' })
               await interaction.followUp({embeds: [embed]});
               await data.findOneAndUpdate({userId: user.id}, {$inc: {balanceGold: amount, respectValue: -newRespect}});

            }
            

        }
        if (chance < 4 && chance >= 2) { 
            
            const embed = new EmbedBuilder()
            .setTitle('Beg')
            .setDescription(`You begged and got nothing`)
            .setColor('Red')
            .setFooter({text: 'Get shammed.' })
            await interaction.followUp({embeds: [embed]});
        }
        if (chance < 2) {
            
            const embed = new EmbedBuilder()
            .setTitle('Beg')
            .setDescription(`You begged and got robbed of ${emojis.currencyBronze} ${amount} coins.`)
            .setColor('Red')
            .setFooter({text: 'Not the best way to earn money.' })
            await interaction.followUp({embeds: [embed]});
            await data.findOneAndUpdate({userId: user.id}, {$inc: {balanceBronze: -amount, respectValue: -newRespect}});

        }



    }


}
