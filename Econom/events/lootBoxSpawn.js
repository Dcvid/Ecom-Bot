const {Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const emojis = require('../utils/emojis');
const initSchema = require('../utils/createSchema');
const balance  = require('../schemas/balance');
const guildSettings = require('../schemas/guildSettings');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        console.log(message.content);

        try {
            const lootBoxChance = 0.05; 
            const lootBoxEmoji = emojis.goldChest;
            const guildSettingsGuild = await guildSettings.findOne({guildId: message.guild.id});            
            
            const embed = new EmbedBuilder()
            .setTitle('Loot Box')
            .setDescription('Hurry up! A loot box has appeared! Who will be the first to claim it?')
            .setColor('LuminousVividPink')
            .setFooter({text: 'Loot Box', iconURL: 'https://cdn.discordapp.com/emojis/1227979779756789860.png?v=1'})
            .setTimestamp();
            
            const claimButton = new ButtonBuilder()
            .setCustomId('claim')
            .setLabel('Claim')
            .setStyle('Primary')
            .setEmoji(lootBoxEmoji);

            const row = new ActionRowBuilder()
            .addComponents(claimButton);

            if (Math.random() < lootBoxChance) {
                if(!guildSettingsGuild) {
                    await guildSettings.create({
                        guildId: message.guild.id,
                        canSummonCreature: true,
                        canWanderingMerchant: true,
                        canFragmentedItem: true,
                        canLootBoxSpawn: true
                    });
                    return;
                }
                if(!guildSettingsGuild.canLootBoxSpawn) return;
                const msg = await message.channel.send({embeds: [embed], components: [row]});
                setTimeout( async () => {         
                    const newButton = new ButtonBuilder()
                    .setCustomId('claim')
                    .setLabel('Claim (Expired)')
                    .setStyle('2')
                    .setEmoji(lootBoxEmoji)
                    .setDisabled(true);
                    const newRow = new ActionRowBuilder().addComponents(newButton);

                    await msg.edit( {components: [newRow]} )         
                }, 10000)

                const filter = i => i.customId === 'claim'
                const collector = message.channel.createMessageComponentCollector({filter, time: 60000});
                collector.on('collect', async i => {
                    i.deferUpdate();
                    const user = i.user;
                    const userBalance = await balance.findOne({userId: user.id});
                    if (!userBalance) {
                        await initSchema(user.id, message.guild.id);
                    }
                    const lootBoxCash = Math.floor(Math.random() * 1000) + 1;

                    const newBalance = userBalance.balanceBronze + lootBoxCash;
                    await balance.findOneAndUpdate({userId: user.id}, {balanceBronze: newBalance});
                    const lootBoxEmbed = new EmbedBuilder()
                    .setTitle('Loot Box')
                    .setDescription(`Congratulations ${user.username}! You have claimed a ${emojis.goldChest} loot box and received ${emojis.currencyBronze} ${lootBoxCash}!`)
                    .setColor('Gold')
                    .setFooter({text: 'Loot Box', iconURL: 'https://cdn.discordapp.com/emojis/1227979779756789860.png?v=1'})
                    .setTimestamp();

                    const newButton = new ButtonBuilder()
                        .setCustomId('claim')
                        .setLabel('Claim (Claimed)')
                        .setStyle('2')
                        .setEmoji(lootBoxEmoji)
                        .setDisabled(true);
                        const newRow = new ActionRowBuilder().addComponents(newButton);
                        await msg.edit( {components: [newRow]} )  
                    
                    const reply = await msg.reply({embeds: [lootBoxEmbed]});
                    setTimeout( async () => {               
                            
                        await msg.delete();
                        await reply.delete();
                    }, 7000)

                    collector.stop();

                });


            }

        } catch (error) {
            console.log(error);
        }

    },

};
