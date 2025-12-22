const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const path = require('path');
const { Op } = require('sequelize');

const getProducts = asyncHandler(async (req, res) => {
    const {
        sort = 'createdAt',
        order = 'DESC',
        search = '',
    } = req.query;

    const allowedSorts = ['name', 'price', 'createdAt'];
    const sortColumn = allowedSorts.includes(sort) ? sort : 'createdAt';
    const orderBy = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const searchQuery = search ? `%${search?.trim()}%` : '%%';

    const result = await db.Product.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.like]: searchQuery } },
                { '$category.name$': { [Op.like]: searchQuery } }
            ]
        },
        include: [
            {
                model: db.Category,
                as: 'category',
                required: false
            }
        ],
        distinct: true,
        order: [[sortColumn, orderBy]],

    });

    res.send({
        products: result,
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await db.Product.findByPk(id, {
        include: [{
            model: db.Category, as: 'category',
        }]
    });

    if (!result) {
        return res.status(404).send({ error: 'Product not found' });
    }

    res.send(result);
});

const createProduct = asyncHandler(async (req, res) => {
    const { name, price, category_id } = req.body;

    if (!name || !price || !category_id) {
        return res.status(400).send({ error: 'Name, price, and category_id required' });
    }

    if (isNaN(price) || price <= 0) {
        return res.status(400).send({ error: 'Price must be positive number' });
    }

    const categoryCheck = await db.Category.findByPk(category_id);

    if (!categoryCheck) {
        return res.status(404).send({ error: 'Category not found' });
    }

    let productImage = null;
    if (req.file) {
        productImage = path.join('products', path.basename(req.file.path));
    }
    const result = await db.Product.create({
        name,
        price,
        categoryId: category_id,
        productImage: productImage || null,
        createdById: req.userId
    }
    );
    res.status(201).send({
        message: 'Product created successfully',
        product: result,
    });
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, price, category_id } = req.body;

    if (price && (isNaN(price) || price <= 0)) {
        return res.status(400).send({ error: 'Price must be positive number' });
    }

    let productImage = null;
    if (req.file) {
        productImage = path.join('products', path.basename(req.file.path));
    }
    const productUpdate = {};
    if (name) productUpdate.name = name;
    if (price) productUpdate.price = price;
    if (category_id) productUpdate.category_id = category_id;
    if (productImage) productUpdate.product_image = productImage;
    const result = await db.Product.update({
        ...productUpdate,
        updatedAt: new Date(),
    }, {
        where: { id, createdById: req.userId },
        returning: true,
    });

    if (result.length === 0) {
        return res.status(404).send({ error: 'Product not found' });
    }
    const updatedProduct = await db.Product.findByPk(id, {
        include: [{
            model: db.Category, as: 'category',
        }]
    });
    res.send({
        message: 'Product updated successfully',
        product: updatedProduct,
    });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await db.Product.destroy({
        where: { id, createdById: req.userId },
    });

    if (!result) {
        return res.status(404).send({ error: 'Product not found' });
    }

    res.send({ message: 'Product deleted successfully' });
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
