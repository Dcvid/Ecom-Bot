const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const itemsSchema = require('../../schemas/itemSchema');
const emojis = require('../../utils/emojis');
const bal = require('../../schemas/balance')   
const ownedItems = require('../../schemas/userItems');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View the shop')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the shop')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view-item')
                .setDescription('View an item in the shop')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('The item to view. (enter the name)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Buy an item from the shop')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('The item to buy. (enter the name)')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'view':
                const userBalance = await bal.findOne({ userId: interaction.user.id });
                const userRespect = userBalance.respectValue || 0; // Assuming respect starts at 0 if not present

                // Calculate discount percentage based on respect value

               

                const items = await itemsSchema.find({});
                if (!items.length) {
                    // If there are no items in the database, add an example item
                    const exampleItem = new itemsSchema({
                        name: 'Example',
                        price: 100,
                        priceType: 'Bronze',
                        description: 'This is an example item',
                        imageURL: 'https://cdn.discordapp.com/attachments/882694037252653312/882694099074441728/unknown.png'
                    });
                    await exampleItem.save();
                    items.push(exampleItem); // Add the example item to the items array
                }

                const itemsPerRow = 5;
                let page = 1;
                const maxPage = Math.ceil(items.length / itemsPerRow);

                const generateEmbed = (currentPage) => {
                    const shopEmbed = new EmbedBuilder()
                        .setTitle('Shop')
                        .setDescription('Welcome to the shop!')
                        .setColor('Green');

                    const start = (currentPage - 1) * itemsPerRow;
                    const end = start + itemsPerRow;

                    for (let i = start; i < end && i < items.length; i++) {
                        const item = items[i];
                        const originalPrice = item.price;
                        let discountedPrice = originalPrice;
                        
                        // Calculate discount based on respect value
                        if (userRespect > 0) {
                            const maxDiscountPercentage = userRespect > 0 ? (userRespect > 500 ? 95 : 75) : 0;
                            const discountPercentage = Math.min(userRespect / 2, maxDiscountPercentage);
                            console.log(discountPercentage)
                            const discountAmount = (originalPrice * discountPercentage) / 100;
                            discountedPrice = originalPrice - discountAmount;
                        }
                
                        const discountPercent = (originalPrice - discountedPrice) / originalPrice * 100;
                        const priceType = `currency${item.priceType}`;
                        const formattedPrice = `${emojis[priceType]} ${originalPrice.toFixed(2)} (${discountPercent.toFixed(0)}% off: ${emojis[priceType]} ${discountedPrice.toFixed(2)})`;
                
                        shopEmbed.addFields({
                            name: item.name,
                            value: `Price: ${formattedPrice}\nDescription: ${item.description}`
                        });
                    }

                    return shopEmbed;
                };

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle('Primary')
                    .setEmoji('➡️')
                    .setDisabled(page === maxPage);

                const previousButton = new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle('Primary')
                    .setEmoji('⬅️')
                    .setDisabled(page === 1);
                
                const pageButton = new ButtonBuilder()
                    .setCustomId('page')
                    .setLabel(`${page}/${maxPage}`)
                    .setStyle('2')   
                    .setDisabled(true);

                const actionRow = new ActionRowBuilder()
                    .addComponents(previousButton, pageButton, nextButton);

                await interaction.reply({ embeds: [generateEmbed(page)], components: [actionRow] });

                const filter = (i) => i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async (i) => {
                    if (i.customId === 'next') {
                        page = page + 1 > maxPage ? 1 : page + 1;

                    } else if (i.customId === 'previous') {
                        page = page - 1 < 1 ? maxPage : page - 1;
                    }

                    nextButton.setDisabled(page === maxPage);
                    pageButton.setLabel(`${page}/${maxPage}`);
                    previousButton.setDisabled(page === 1);

                    await i.update({ embeds: [generateEmbed(page)], components: [actionRow] });
                });
            break;
            case 'view-item':
                const item = await itemsSchema.findOne({ name: interaction.options.getString('item') });
                if (!item) return interaction.reply('That item does not exist!');
                const priceType = `currency${item.priceType}`
                const itemEmbed = new EmbedBuilder()
                    .setTitle(item.name)
                    .setDescription(`Price: ${emojis[priceType]} ${item.price}\nDescription: ${item.description}`)
                    .setThumbnail(item.imageURL)
                    .setColor('Green');
                await interaction.reply({ embeds: [itemEmbed] });
            break;
            case 'buy':
                const itemToBuy = await itemsSchema.findOne({ name: interaction.options.getString('item') });
                if (!itemToBuy) return interaction.reply({ content: 'That item does not exist!', ephemeral: true });

                const price = itemToBuy.price;
                const priceType2 = `currency${itemToBuy.priceType}`
                const balance = await bal.findOne({ userId: interaction.user.id });

                if (!balance || balance[priceType2] < price) return interaction.reply({ content: `You do not have enough ${itemToBuy.priceType} to buy this item!`, ephemeral: true });
                const newBalance = balance[priceType2] - price;
                const ownedItem = await ownedItems.findOne({ userId: interaction.user.id, name: itemToBuy.name });

                if (ownedItem) {
                    await interaction.reply({ content: `You have successfully bought ${itemToBuy.name} for ${emojis[priceType2]} ${price}!`, ephemeral: true });
                    await ownedItems.findOneAndUpdate({ userId: interaction.user.id, name: itemToBuy.name }, { count: ownedItem.count + 1 });
                    await bal.findOneAndUpdate({ userId: interaction.user.id }, { [priceType2]: newBalance });
                    return;
                }

                const newItem = new ownedItems({
                    userId: interaction.user.id,
                    name: itemToBuy.name,
                    description: itemToBuy.description,
                    price: itemToBuy.price,
                    date: Date.now(),
                    count: 1,
                });

                await newItem.save();


                await bal.findOneAndUpdate({ userId: interaction.user.id }, { [priceType2]: newBalance });


                
                await interaction.reply({ content: `You have successfully bought ${itemToBuy.name} for ${emojis[priceType2]} ${price}!`, ephemeral: true });


            }


        
    },
};
