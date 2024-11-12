const emojis = require('./emojis');

const items = [
    {name: '1. Eye of Cthulhu (Fragment 1/3)', value: `Price: ${emojis.currencyGold} 1200 coins\nEye of Cthulhu, this eye is said to be the eye of the god of destruction, Cthulhu. It is said that if you collect all 3 fragments of the eye, you can summon Cthulhu himself.`, inline: false},
    {name: '2. Peridot', value: `Price: ${emojis.currencyGold} 500 coins\nA rare gem that is said to have healing properties. It is said that if you have enough of these gems, you can create a powerful healing potion.`, inline: false},
    {name: '3. Dragon Egg', value: `Price: ${emojis.currencyGold} 10000 coins\nA dragon egg, it is said that if you have this egg, you can hatch it and raise your own dragon.`, inline: false},
    {name: '4. Dragon Scale', value: `Price: ${emojis.currencyGold} 2000 coins\nA dragon scale, it is said that if you have enough of these scales, you can create a powerful armor that can withstand any attack.`, inline: false},
    {name: '5. Atmo\'s Bow', value: `Price: ${emojis.currencyGold} 5000 coins\nAtmo\'s Bow, a powerful bow that is said to be able to shoot arrows that can pierce through anything.`, inline: false},
    {name: '6. Phoenix Feather', value: `Price: ${emojis.currencyGold} 1000 coins\nA phoenix feather, it is said that if you combine it with other materials such as a Dragon Scale, it may be able to give a second life.`, inline: false}
];

module.exports = items;