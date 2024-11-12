const mongosoe = require('mongoose');

const ownedItems = mongosoe.Schema({
    name: String,
    item: String,
    price: Number,
    description: String,
    date: String,
    userId: String,
    count: Number,
    fragmentCount: Number,


});

module.exports = mongosoe.model('ownedItems', ownedItems);
