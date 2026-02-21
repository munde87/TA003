const ShopOwner = require('../models/ShopOwner');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// Generate Unique ID like: NEARU-GRO-7A3X2
const generateUniqueId = (shopType) => {
    const prefix = 'NEARU';
    const typeCode = shopType.substring(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${typeCode}-${randomPart}`;
};

// @desc    Register shop owner
// @route   POST /api/owners/register
// @access  Public
const registerOwner = async (req, res) => {
    try {
        const { username, email, password, address, shopType } = req.body;

        // Validation
        if (!username || !email || !password || !address || !shopType) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if owner already exists
        const ownerExists = await ShopOwner.findOne({ email });
        if (ownerExists) {
            return res.status(400).json({ message: 'Owner already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate unique ID
        let uniqueId = generateUniqueId(shopType);

        // Make sure uniqueId is truly unique
        let idExists = await ShopOwner.findOne({ uniqueId });
        while (idExists) {
            uniqueId = generateUniqueId(shopType);
            idExists = await ShopOwner.findOne({ uniqueId });
        }

        // Create owner
        const owner = await ShopOwner.create({
            username,
            email,
            password: hashedPassword,
            address,
            shopType,
            uniqueId,
        });

        if (owner) {
            res.status(201).json({
                success: true,
                message: 'Shop Owner registered successfully',
                data: {
                    _id: owner._id,
                    username: owner.username,
                    email: owner.email,
                    address: owner.address,
                    shopType: owner.shopType,
                    uniqueId: owner.uniqueId,
                    role: owner.role,
                    token: generateToken(owner._id),
                },
                note: `Your Unique Login ID is: ${owner.uniqueId} — Save this! You will login with this ID and your password.`
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login shop owner (uniqueId + password)
// @route   POST /api/owners/login
// @access  Public
const loginOwner = async (req, res) => {
    try {
        const { uniqueId, password } = req.body;

        if (!uniqueId || !password) {
            return res.status(400).json({ message: 'Please provide Unique ID and password' });
        }

        // Find owner by uniqueId
        const owner = await ShopOwner.findOne({ uniqueId });
        if (!owner) {
            return res.status(401).json({ message: 'Invalid Unique ID or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Unique ID or password' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: owner._id,
                username: owner.username,
                email: owner.email,
                address: owner.address,
                shopType: owner.shopType,
                uniqueId: owner.uniqueId,
                role: owner.role,
                isShopOpen: owner.isShopOpen,
                token: generateToken(owner._id),
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get owner profile
// @route   GET /api/owners/profile
// @access  Private (Owner)
const getOwnerProfile = async (req, res) => {
    try {
        const owner = await ShopOwner.findById(req.user._id).select('-password');
        if (owner) {
            res.status(200).json({
                success: true,
                data: owner,
            });
        } else {
            res.status(404).json({ message: 'Owner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add product
// @route   POST /api/owners/products
// @access  Private (Owner)
const addProduct = async (req, res) => {
    try {
        const { productName, productPrice, productDescription, productImage, category } = req.body;

        if (!productName || !productPrice) {
            return res.status(400).json({ message: 'Product name and price are required' });
        }

        const owner = await ShopOwner.findById(req.user._id);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        const newProduct = {
            productName,
            productPrice,
            productDescription: productDescription || '',
            productImage: productImage || '',
            category: category || 'General',
            isLive: true,
        };

        owner.products.push(newProduct);
        await owner.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            data: owner.products[owner.products.length - 1],
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle product live/close
// @route   PUT /api/owners/products/:productId/toggle
// @access  Private (Owner)
const toggleProductStatus = async (req, res) => {
    try {
        const owner = await ShopOwner.findById(req.user._id);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        const product = owner.products.id(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isLive = !product.isLive;
        await owner.save();

        res.status(200).json({
            success: true,
            message: `Product is now ${product.isLive ? 'LIVE' : 'CLOSED'}`,
            data: product,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/owners/products/:productId
// @access  Private (Owner)
const deleteProduct = async (req, res) => {
    try {
        const owner = await ShopOwner.findById(req.user._id);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        const product = owner.products.id(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.deleteOne();
        await owner.save();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle shop open/close
// @route   PUT /api/owners/toggle-shop
// @access  Private (Owner)
const toggleShopStatus = async (req, res) => {
    try {
        const owner = await ShopOwner.findById(req.user._id);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        owner.isShopOpen = !owner.isShopOpen;
        await owner.save();

        res.status(200).json({
            success: true,
            message: `Shop is now ${owner.isShopOpen ? 'OPEN' : 'CLOSED'}`,
            isShopOpen: owner.isShopOpen,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all products (for users to see) - only LIVE products from OPEN shops
// @route   GET /api/owners/all-products
// @access  Public
const getAllLiveProducts = async (req, res) => {
    try {
        const owners = await ShopOwner.find({ isShopOpen: true }).select('-password');

        const allProducts = [];

        owners.forEach(owner => {
            owner.products.forEach(product => {
                if (product.isLive) {
                    allProducts.push({
                        _id: product._id,
                        productName: product.productName,
                        productPrice: product.productPrice,
                        productDescription: product.productDescription,
                        productImage: product.productImage,
                        category: product.category,
                        shopName: owner.username,
                        shopAddress: owner.address,
                        shopType: owner.shopType,
                        ownerId: owner._id,
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            count: allProducts.length,
            data: allProducts,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get owner's own products
// @route   GET /api/owners/my-products
// @access  Private (Owner)
const getMyProducts = async (req, res) => {
    try {
        const owner = await ShopOwner.findById(req.user._id).select('-password');
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        res.status(200).json({
            success: true,
            count: owner.products.length,
            data: owner.products,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerOwner,
    loginOwner,
    getOwnerProfile,
    addProduct,
    toggleProductStatus,
    deleteProduct,
    toggleShopStatus,
    getAllLiveProducts,
    getMyProducts,
};