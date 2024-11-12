const {EmbedBuilder} = require('discord.js')
const emojis = require('./emojis')

async function generateEmbed (title, description, color, thumbnail, fields, footer) {
    let embed = new EmbedBuilder()
    embed.setTitle(title ? title : 'Untitled')
    embed.setDescription(description)
    embed.setColor(color ? color : 'Green')    
    if (fields) {
        
        fields.forEach(field => {
            embed.addFields({name: field.name, value: field.value, inline: field.inline})
        })
    }
    
    if (thumbnail) embed.setThumbnail(thumbnail)
    if (footer) embed.setFooter({text: footer})
    return embed
}

async function generateErrorEmbed (err) {
    let embed = new EmbedBuilder()
    embed.setTitle(`${emojis.error} Error`)
    embed.setDescription(`An error has occurred.\n\n\`\`\`js\n${err}\n\`\`\``);
    embed.setColor('Red')
    return embed
}

module.exports = {generateEmbed, generateErrorEmbed}
