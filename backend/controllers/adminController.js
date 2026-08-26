const pool = require('../config/db');

// GET /api/admin/products  (includes inactive)
async function listAllProducts(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/products
async function createProduct(req, res, next) {
  try {
    const { name, description, category, thickness_mm, image_url, price } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      const err = new Error('name is required');
      err.status = 400;
      throw err;
    }
    const [result] = await pool.query(
      `INSERT INTO products (name, description, category, thickness_mm, image_url, price, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name.trim(), description || null, category || null, thickness_mm || null, image_url || null, price || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/products/:id
async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, description, category, thickness_mm, image_url, price } = req.body || {};
    const [result] = await pool.query(
      `UPDATE products SET name = COALESCE(?, name), description = COALESCE(?, description),
       category = COALESCE(?, category), thickness_mm = COALESCE(?, thickness_mm),
       image_url = COALESCE(?, image_url), price = COALESCE(?, price) WHERE id = ?`,
      [name, description, category, thickness_mm, image_url, price, id]
    );
    if (!result.affectedRows) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/products/:id/status
async function setActiveStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body || {};
    const [result] = await pool.query('UPDATE products SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
    if (!result.affectedRows) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/reviews
async function listAllReviews(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.name AS product_name FROM product_reviews r
       JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC LIMIT 200`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/calculations
async function listCalculations(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM quantity_calculations ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAllProducts,
  createProduct,
  updateProduct,
  setActiveStatus,
  listAllReviews,
  listCalculations
};
