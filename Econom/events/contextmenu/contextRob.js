const {ContextMenuCommandBuilder, ApplicationCommandType} = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('rob')
        .setType(ApplicationCommandType.User) 

}
