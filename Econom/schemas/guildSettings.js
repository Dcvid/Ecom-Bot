const { Schema, model, default: mongoose } = require('mongoose');

const guildSettings = Schema({
    guildID: String,
    canSummonCreature: Boolean,
    canFragmentedItem: Boolean,
    canWanderingMerchant: Boolean,
    canLootBoxSpawn: Boolean,

})

module.exports = model('guildSettingsEconomy', guildSettings);
