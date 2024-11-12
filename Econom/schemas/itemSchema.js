const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
    },
    priceType: {
        type: String,
        required: true
    },

    imageURL: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Items', itemsSchema);
