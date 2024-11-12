const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder} = require('discord.js');
const guildsSettings = require('../../schemas/guildSettings');
let selectedOption;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configure')
        .setDescription('Configure the bot settings'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder() // Create a new select menu
                    .setCustomId('select') // Set the custom ID of the component
                    .setPlaceholder('Nothing selected') // Set a placeholder
                    .addOptions(
                        new StringSelectMenuOptionBuilder() // Add the first option
                            .setLabel('Creature Summoning') // Set the label shown for the option
                            .setValue('creature_summoning') // Set the value of the component (this is what is returned in the interaction)
                            .setDescription('Configure the creature summoning settings') // Set a description for the option
                            .setEmoji('🐉'), // Set an emoji for the option (optional)
                        new StringSelectMenuOptionBuilder() // Add the second option
                            .setLabel('Wandering Trader Spawn') // Set the label shown for the option
                            .setValue('wandering_trader_spawn') // Set the value of the component (this is what is returned in the interaction)
                            .setDescription('Configure the wandering trader spawn settings') // Set a description for the option
                            .setEmoji('🧑‍🌾'), // Set an emoji for the option (optional)
                        new StringSelectMenuOptionBuilder() // Add the third option
                            .setLabel('Fragmented Items') // Set the label shown for the option
                            .setValue('fragmented_items') // Set the value of the component (this is what is returned in the interaction)
                            .setDescription('Configure the fragmented items settings') // Set a description for the option
                            .setEmoji('🧩'), // Set an emoji for the option (optional)
                        new StringSelectMenuOptionBuilder() // Add the fourth option
                            .setLabel('Lootbox Spawning') // Set the label shown for the option
                            .setValue('lootbox_spawning') // Set the value of the component (this is what is returned in the interaction)
                            .setDescription('Configure the lootbox spawning settings') // Set a description for the option
                            .setEmoji('🎁') // Set an emoji for the option (optional)


                    )


        )
        const offButton = new ButtonBuilder()
            .setCustomId('off')
            .setLabel('Off')
            .setStyle('4')
        let onButton = new ButtonBuilder()
            .setCustomId('on')
            .setLabel('On')
            .setStyle('3')
        const row2 = new ActionRowBuilder()
            .addComponents(offButton, onButton)

        const guildSettings = await guildsSettings.findOne({guildId: interaction.guild.id});
        if (!guildSettings) {
            new guildsSettings({
                guildId: interaction.guild.id,
                canSummonCreature: true,
                canWanderingMerchant: true,
                canFragmentedItem: true,
                canLootBoxSpawn: true
            })

        }
        embed = new EmbedBuilder()
            .setTitle('Configure')
            .setDescription('Configure the bot settings, such as creature summoning, wandering trader spawn, fragmented items, and lootbox spawning.')
            .setColor('Green')
            .setTimestamp()


        await interaction.reply({ components: [row, row2], embeds: [embed] });
        const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 1200000 });
        collector.on('collect', async i => {
            if (i.customId === 'select') {
                if (i.values[0] === 'creature_summoning') {
                    await i.deferUpdate();
 
                    selectedOption = 'creature_summoning';
                    
                }
                if (i.values[0] === 'wandering_trader_spawn') {
                    await i.deferUpdate();
                    selectedOption = 'wandering_trader_spawn';

                }
                if (i.values[0] === 'fragmented_items') {
                    await i.deferUpdate();
                    selectedOption = 'fragmented_items';


                }
                if (i.values[0] === 'lootbox_spawning') {
                    await i.deferUpdate();
                    selectedOption = 'lootbox_spawning';
                }


            }


        });
        collector.on('end', collected => {
            offButton.setDisabled(true);
            onButton.setDisabled(true);
            row2.addComponents(offButton, onButton);
            interaction.editReply({components: [row, row2], embeds: [embed]});

        })


        const filter2 = i => i.customId === 'off' || i.customId === 'on' && i.user.id === interaction.user.id;
        const collector2 = interaction.channel.createMessageComponentCollector({ filter2, time: 1200000 });
        collector2.on('collect', async i => {
            if (i.customId === 'off') {
                await i.deferUpdate();
                const keys = {
                    'creature_summoning': 'CanSummonCreature',
                    'wandering_trader_spawn': 'CanWanderingMerchant',
                    'fragmented_items': 'CanFragmentedItem',
                    'lootbox_spawning': 'CanLootBoxSpawn'

                };
                const key = keys[selectedOption];
                if (!key) return await interaction.reply({content: 'Please select an option.', ephemeral: true});
                await guildsSettings.findOneAndUpdate({guildId: interaction.guild.id}, {[key]: false});
                await i.followUp({content: `Successfully turned off ${selectedOption}.`, ephemeral: true});
                

            }
            if (i.customId === 'on') {  
                await i.deferUpdate();
   
                const keys = {
                    'creature_summoning': 'CanSummonCreature',
                    'wandering_trader_spawn': 'CanWanderingMerchant',
                    'fragmented_items': 'CanFragmentedItem',
                    'lootbox_spawning': 'CanLootBoxSpawn'

                };
                const key = keys[selectedOption];
                if (!key) return await interaction.reply({content: 'Please select an option.', ephemeral: true});
                await guildsSettings.findOneAndUpdate({guildId: interaction.guild.id}, {[key]: true});
                await i.followUp({content: `Successfully turned on ${selectedOption}.`, ephemeral: true});
      
            }


        });
        collector.on('end', collected => {
            offButton.setDisabled(true);
            onButton.setDisabled(true);
            row2.addComponents(offButton, onButton);
            interaction.editReply({components: [row, row2], embeds: [embed]});


        })





    }


}
