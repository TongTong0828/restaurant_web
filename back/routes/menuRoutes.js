const express = require('express');
const router = express.Router();

// ��ʱ·�ɴ���
router.get('/', (req, res) => {
  res.json({ message: 'Menu routes' });
});

module.exports = router; 