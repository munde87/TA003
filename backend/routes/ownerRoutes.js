const express = require('express');
const router = express.Router();
const {
    registerOwner,
    loginOwner,
    getOwnerProfile,
    addProduct,
    toggleProductStatus,
    deleteProduct,
    toggleShopStatus,
    getAllLiveProducts,
    getMyProducts,
} = require('../controllers/ownerController');
const { protect, ownerOnly } = require('../middleware/auth');

// Public routes
router.post('/register', registerOwner);
router.post('/login', loginOwner);
router.get('/all-products', getAllLiveProducts);

// Protected Owner routes
router.get('/profile', protect, ownerOnly, getOwnerProfile);
router.post('/products', protect, ownerOnly, addProduct);
router.get('/my-products', protect, ownerOnly, getMyProducts);
router.put('/products/:productId/toggle', protect, ownerOnly, toggleProductStatus);
router.delete('/products/:productId', protect, ownerOnly, deleteProduct);
router.put('/toggle-shop', protect, ownerOnly, toggleShopStatus);

module.exports = router;