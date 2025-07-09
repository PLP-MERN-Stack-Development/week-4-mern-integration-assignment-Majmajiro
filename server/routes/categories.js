import express from 'express';
import { check, validationResult } from 'express-validator';
import Category from '../models/Category.js';

const router = express.Router();

// Validation rules
const categoryValidation = [
  check('name', 'Name is required').notEmpty(),
];

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new category
router.post('/', categoryValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const category = new Category({ name: req.body.name });
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

