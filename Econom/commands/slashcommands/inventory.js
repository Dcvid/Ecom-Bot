const { SlashCommandBuilder } = require('discord.js');
const generate = require('../../utils/createEmbed');
const ownedItems = require('../../schemas/userItems');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Shows your or someone else\'s inventory')
        .addUserOption(option => option.setName('user').setDescription('The user\'s inventory you want to see').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const items = await ownedItems.find({ userId: user.id });
        const target = interaction.guild.members.cache.get(user.id);

        if (!items.length) return interaction.reply({ content: `${user.username} doesn't have any items`, ephemeral: true });
        const embed = await generate.generateEmbed(
            `${target.displayName}'s inventory`,
            `<@${target.id}> has ${items.length} items`,
            'Green',
            'https://th.bing.com/th/id/R.7dac724674dc9d879d8af25e400d09bd?rik=ArYgRtPUCbtXBQ&riu=http%3a%2f%2fpixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com%2fimage%2f006ef1cc0b83e31.png&ehk=ugqaVGJnzMc2Wiq9wIeIU3Jjlti6o7dwZveuERf5FJA%3d&risl=&pid=ImgRaw&r=0',
            items.map(item => {
                return {
                    name: `${item.name} (${item.count})`,
                    value: `${item.description.slice(0, 100)}...`,
                    inline: false
                }
            })            

        )
        interaction.reply({ embeds: [embed] })

    }


}

