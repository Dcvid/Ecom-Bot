const {ContextMenuCommandBuilder, ApplicationCommandType} = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('balance')
        .setType(ApplicationCommandType.User) 

}
