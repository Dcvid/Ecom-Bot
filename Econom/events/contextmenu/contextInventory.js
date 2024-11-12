const {ContextMenuCommandBuilder, ApplicationCommandType} = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('inventory')
        .setType(ApplicationCommandType.User) 

}
