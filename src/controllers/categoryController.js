const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const getCategories = asyncHandler(async (req, res) => {
  const result = await db.Category.findAll({ where: { createdById: req.userId }, order: [['createdAt', 'DESC']] });

  res.json({
    count: result.length,
    categories: result,
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.Category.findByPk(id, { where: { createdById: req.userId } });

  if (!result) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json(result);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const result = await db.Category.create({ name, createdById: req.userId }); 

  res.status(201).json({
    message: 'Category created successfully',
    category: result,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const result = await db.Category.update({
    name,
    updatedAt: new Date(),
  }, {
    where: { id, createdById: req.userId },
    returning: true,
  });

  if (result.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }
  const updatedCat = await db.Category.findByPk(id, { where: { createdById: req.userId } });

  res.json({
    message: 'Category updated successfully',
    category: updatedCat,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.Category.destroy({
    where: { id, createdById: req.userId },
  });

  if (!result) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({ message: 'Category deleted successfully' });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
