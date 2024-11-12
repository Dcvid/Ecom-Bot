const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const balance = require('../../schemas/balance');
const emojis = require('../../utils/emojis');

const initializeNewBalance = require('../../utils/createSchema');
const formatNumber = require('../../utils/formatify');

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to check the balance of')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const user = interaction.user;
            const target = interaction.options.getUser('user') || user;

            if (target.bot) return await interaction.reply({ content: 'You cannot check the balance of a bot.', ephemeral: true });

            const [balData, targetBalData] = await Promise.all([
                balance.findOneAndUpdate({ userId: user.id }, {}, { upsert: true, new: true }),
                balance.findOneAndUpdate({ userId: target.id }, {}, { upsert: true, new: true })
            ]);

            if (!balData) { 
                initializeNewBalance(interaction.user.id, interaction.guildId);

            } else if (!targetBalData) {
                initializeNewBalance(target.id, interaction.guildId);
            }

            

            const firstUnpurchasedTier = balData.bank.find(tier => !tier.purchased);

            const highestPurchasedTier = balData.bank[balData.currentBankIndex - 1]?.purchased
                ? balData.bank[balData.currentBankIndex - 1]
                : null;

            const highestPurchasedTierTarget = targetBalData.bank[targetBalData.currentBankIndex - 1]?.purchased
                ? targetBalData.bank[targetBalData.currentBankIndex - 1]
                : null;


            const embed = new EmbedBuilder()
                .setTitle('Balance Overview')
                .setDescription(`A brief overview of ${target.id !== user.id ? `<@${target.id}>'s` : 'your'} balance status.`)
                .setColor('Green')
                .setThumbnail((target.id !== user.id ? target : user).displayAvatarURL({ dynamic: true }));

            if (target.id !== user.id) {
                embed.addFields({
                    name: "Total",
                    value: `\n${emojis.currencyBronze} \`${formatNumber(targetBalData.balanceBronze)}\n\`${emojis.currencyGold} \`${formatNumber(targetBalData.balanceGold)}\``
                });
                embed.addFields({ name: 'Tier', value: `${emojis.bank} \`${targetBalData.currentBankIndex}\`` });

            } else {
                embed.addFields({
                    name: "Total",
                    value: `\n${emojis.currencyBronze} \`${formatNumber(balData.balanceBronze)}\n\`${emojis.currencyGold} \`${formatNumber(balData.balanceGold === 0 ? 0 : balData.balanceGold)}\``
                });
                if (!firstUnpurchasedTier) {
                    embed.addFields({ name: 'Tier', value: `${emojis.maxBank} ${balData.currentBankIndex}` });
                } else {
                    embed.addFields({name: 'Tier', value: `${emojis.bank} \`${balData.currentBankIndex}\``});
                    embed.setFooter({text: balData.balanceBronze < firstUnpurchasedTier.cost ? `You need ${firstUnpurchasedTier.cost - balData.balanceBronze} more to upgrade to the next tier.` : `You can upgrade to the next tier for ${emojis.currencyBronze} ${firstUnpurchasedTier.cost}`});
                }
            }

            const upgradeButton = new ButtonBuilder()
                .setCustomId('upgrade')
                .setLabel(firstUnpurchasedTier ? (balData.balanceBronze < firstUnpurchasedTier.cost ? 'Upgrade (Insufficient Balance)' : 'Upgrade') : 'Max Tier')
                .setStyle(firstUnpurchasedTier ? (balData.balanceBronze < firstUnpurchasedTier.cost ? 'Danger' : 'Success') : '2')
                .setDisabled(!firstUnpurchasedTier || balData.balanceBronze < firstUnpurchasedTier.cost);

            const row = new ActionRowBuilder().addComponents(upgradeButton);

            await interaction.reply({ embeds: [embed], components: [row] });

            const collector = interaction.channel.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'upgrade') {
                    if (!i.userId === user.id) return await i.reply({ content: 'You cannot use this button.', ephemeral: true })
                    await i.deferUpdate();
                    if (firstUnpurchasedTier && balData.balanceBronze < firstUnpurchasedTier.cost) {
                        const insufficientEmbed = new EmbedBuilder()
                            .setTitle('Insufficient Balance')
                            .setDescription(`You need \`${firstUnpurchasedTier.cost - balData.balanceBronze}\` more to upgrade to the next tier.`)
                            .setColor('Red');
                        await i.followUp({ embeds: [insufficientEmbed], ephemeral: true });
                    } else {
                        const newBalance = balData.balanceBronze - firstUnpurchasedTier.cost;
                        const newBankIndex = balData.currentBankIndex + 1;
                        firstUnpurchasedTier.purchased = true;
                        await balance.updateOne(
                            { userId: user.id, 'bank.purchased': false },
                            { $set: { balanceBronze: newBalance, 'bank.$.purchased': true, currentBankIndex: newBankIndex } }
                        );
                        const successEmbed = new EmbedBuilder()
                            .setTitle('Upgrade Successful')
                            .setDescription('You have successfully upgraded to the next tier.')
                            .setColor('Green');

                        await i.followUp({ embeds: [successEmbed], ephemeral: true });
                    }
                }
            });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
};
