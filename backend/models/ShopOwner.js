const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: Number,
        required: true,
    },
    productDescription: {
        type: String,
        default: '',
    },
    productImage: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        default: 'General',
    },
    isLive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});

const shopOwnerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    address: {
        type: String,
        required: [true, 'Shop address is required'],
    },
    shopType: {
        type: String,
        required: [true, 'Shop type is required'],
        enum: ['Grocery', 'Electronics', 'Clothing', 'Food', 'Pharmacy', 'Stationery', 'Hardware', 'Other'],
    },
    uniqueId: {
        type: String,
        unique: true,
    },
    products: [productSchema],
    role: {
        type: String,
        default: 'owner',
    },
    isShopOpen: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ShopOwner', shopOwnerSchema);