const express = require('express');
const router = express.Router();

// 临时路由处理
router.get('/', (req, res) => {
  res.json({ message: 'Menu routes' });
});

module.exports = router; 