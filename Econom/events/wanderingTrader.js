const {Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const emojis = require('../utils/emojis');
const initSchema = require('../utils/createSchema');
const userItems = require('../schemas/userItems');
const balance  = require('../schemas/balance');
const guildSettings = require('../schemas/guildSettings');

const { ModalBuilder } = require('@discordjs/builders');
const fs = require('fs');
const ie = require('../utils/itemsWanderer');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if(message.author.bot) return;

        const guildSettingsGuild = await guildSettings.findOne({guildID: message.guild.id});
        if(!guildSettingsGuild) {
            await guildSettings.create({
                guildID: message.guild.id,
                canWanderingMerchant: true,
                canWanderingMerchant: true,
                canFragmentedItem: true,
                canLootBoxSpawn: true
            });
            return;            

        }
        if(!guildSettingsGuild.canWanderingMerchant) return;


        const chnaceOfEvent = 100;
        if (chnaceOfEvent > 0) {
            const embed = new EmbedBuilder()
            .setTitle('Wandering Trader')
            .setDescription('A wandering trader has appeared in the server!\nThey are selling rare items for a limited time!\n\nClick the button **below** to view the items!')
            .setColor('Gold')

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('view')
                .setLabel('View Items')
                .setStyle('1')
                
            )
            const theTraderMessage = await message.channel.send({embeds: [embed], components: [row]});
            const filter = i => i.customId === 'view';
            const collector = message.channel.createMessageComponentCollector({filter, time: 60000});
            collector.on('collect', async i => {
                if(i.customId === 'view') {
                    const fields = ie;

                    const embed = new EmbedBuilder()
                    .setTitle('Wandering Trader')
                    .setColor('Gold')


                    for (const field of fields) {
                        if (!guildSettings.canFragmentedItem && field.name.includes('Fragment')) continue;

                        embed.addFields({name: field.name, value: field.value, inline: false})
                    }

                    
                    const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('buy')
                        .setLabel('Purhcase')
                        .setStyle('1')
                        .setEmoji(emojis.currencyGold)

                    )
                    const viewMSG = await i.reply({embeds: [embed], components: [row], ephemeral: true});
                    const filter = i => i.customId === 'buy';
                    const collector = i.channel.createMessageComponentCollector({filter, time: 1200000});
                    collector.on('collect', async i => {
                        if(i.customId === 'buy') {
                            const modal = new ModalBuilder()
                            .setTitle('Purchase')
                            .setCustomId('purchase')

                            const itemNameField = new TextInputBuilder()
                            .setCustomId('itemName')
                            .setPlaceholder('Enter the name of the item you want to purchase')
                            .setMinLength(1)
                            .setMaxLength(100)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                            .setLabel('Item Name')
                            
                            const row = new ActionRowBuilder()
                            .addComponents(itemNameField)

                            modal.addComponents(row);

                            await i.showModal(modal);

                        }
                        i.awaitModalSubmit({time: 12000000}).then(async i => {
                            if(i.customId === 'purchase') {
                                const itemName = i.fields.getTextInputValue('itemName');
                                bal = await balance.findOne({userId: i.user.id});
                                let templateEmbed = new EmbedBuilder()
                                .setTitle('Purchase')
                                .setColor('Gold')

                                if(!bal) {
                                    bal = await initSchema(i.user.id, i.guild.id);                                    

                                }
                                if(itemName === 'Eye of Cthulhu') {
                                    if(bal.coins < 1200) {
                                        templateEmbed.setDescription('You do not have enough coins to purchase this item.');
                                        templateEmbed.setColor('Red');                                       
                                    }
                                    else {
                                        bal.coins -= 1200;
                                        await bal.save();
                                        const userItemEye = await userItems.findOne({name: `Eye of Cthulhu ${'Fragment (1/3)' || 'Fragment (2/3)'  || 'Fragment (3/3)' }`, userId: i.user.id});
                                        if(!userItemEye) {
                                            new userItems({
                                                name: 'Eye of Cthulhu (Fragment 1/3)' ,
                                                userId: i.user.id,
                                                price: 1200,
                                                date: Date.now(),

                                            })

                                        } else {
                                            if (userItemEye.fragmentCount > 2 && userItemEye.fragmentCount < 3 )
                                            {
                                                userItemEye.name = 'Eye of Cthulhu (Awakened)';
                                                userItemEye.fragmentCount = 3;
                                                userItemEye.description = 'The awakened eye of Cthulhu, it is said that if you have this eye, you can summon Cthulhu himself.';
                                                userItemEye.price = 0;
                                                await userItemEye.save();


                                            } else {
                                                userItemEye.fragmentCount += 1;
                                            }
                                        }
                                    }
                                }

                                const items = {
                                    'Peridot': { price: 500, description: 'A rare gem that is said to have healing properties.' },
                                    'Dragon Egg': { price: 10000, description: 'A dragon egg, it is said that if you have this egg, you can hatch it and raise your own dragon.' },
                                    'Dragon Scale': { price: 2000, description: 'A dragon scale, it is said that if you have enough of these scales, you can create a powerful armor.' },
                                    'Atmo\'s Bow': { price: 5000, description: 'Atmo\'s Bow, a powerful bow that can shoot arrows that can pierce through anything.' },
                                    'Phoenix Feather': { price: 1000, description: 'A phoenix feather, it is said that if you combine it with other materials, it may be able to give a second life.' },
                                };
                        
                                if (items[itemName] && bal.balanceGold >= items[itemName].price) {
                                    bal.coins -= items[itemName].price;
                                    await bal.save();
                        
                                    await userItems.create({
                                        name: itemName,
                                        userId: i.user.id,
                                        price: items[itemName].price,
                                        date: Date.now(),
                                    });
                        
                                    templateEmbed.setDescription(`You have successfully purchased ${itemName}!`);
                                    i.reply({ embeds: [templateEmbed] });
                                    
                                    const itemNameToRemove = itemName;
                                    const fields = JSON.parse(fs.readFileSync('./utils/itemsWanderer.js', 'utf-8'));

                                    fields = prevFields.replace(itemNameToRemove, '');
                                    fs.writeFileSync('./utils/itemsWanderer.js', fields);
 
 

                                } else {
                                    templateEmbed.setDescription('You do not have enough coins to purchase this item.');
                                    templateEmbed.setColor('Red');
                                    i.reply({ embeds: [templateEmbed] });
                                    console.log(viewMSG.message)

                                    const originalEmbed = viewMSG.embeds[0];
            
                                    // Fuck me
                                    const itemIndex = originalEmbed.fields.findIndex(field => field.name.toLowerCase().includes(itemName.toLowerCase()));

                                    if (itemIndex !== -1) {
                                        originalEmbed.fields.splice(itemIndex, 1);

                                        await theTraderMessage.edit({ embeds: [originalEmbed] });
                                    }
                                }
                            }
                        })
                    });
                }
            });
            collector.on('end', collected => {
                if(collected.size === 0) {
                    const embed = new EmbedBuilder()
                    .setTitle('Wandering Trader')
                    .setDescription('The wandering trader has left the server.')
                    .setColor('Gold')
                    .setThumbnail('')
                    theTraderMessage.edit({embeds: [embed], components: []});

                }
            })
        }   
    }
}
