const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../middleware/errorHandler');
const database = require('../config/database');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名，包含餐厅ID前缀
    const restaurantId = req.user.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `restaurant_${restaurantId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400), false);
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  }
});

// 上传菜品图片
exports.uploadMenuItemImage = [
  upload.single('image'),
  async (req, res, next) => {
    const pool = database.getPool();
    const connection = await pool.getConnection();
    
    try {
      if (!req.file) {
        throw new AppError('Please upload an image', 400);
      }

      const { menuItemId } = req.params;
      const restaurantId = req.user.id;

      console.log('Uploading image for menu item:', { menuItemId, restaurantId });

      // 验证菜品是否属于该餐厅
      const [menuItem] = await connection.query(
        'SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?',
        [menuItemId, restaurantId]
      );

      if (!menuItem.length) {
        // 删除已上传的文件
        fs.unlinkSync(req.file.path);
        throw new AppError('Menu item not found or does not belong to this restaurant', 404);
      }

      // 构建图片URL
      const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

      console.log('Updating menu item with image URL:', imageUrl);

      // 更新菜品的图片URL
      await connection.query(
        'UPDATE menu_items SET image_url = ? WHERE id = ?',
        [imageUrl, menuItemId]
      );

      await connection.commit();

      res.status(200).json({
        status: 'success',
        data: {
          url: imageUrl,
          filename: req.file.filename
        }
      });
    } catch (error) {
      await connection.rollback();
      // 如果出错，删除已上传的文件
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error uploading menu item image:', error);
      next(error);
    } finally {
      connection.release();
    }
  }
];

// 删除菜品图片
exports.deleteMenuItemImage = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    const { menuItemId } = req.params;
    const restaurantId = req.user.id;

    // 获取菜品信息
    const [menuItem] = await connection.query(
      'SELECT image_url FROM menu_items WHERE id = ? AND restaurant_id = ?',
      [menuItemId, restaurantId]
    );

    if (!menuItem.length) {
      throw new AppError('Menu item not found or does not belong to this restaurant', 404);
    }

    if (!menuItem[0].image_url) {
      throw new AppError('No image found for this menu item', 404);
    }

    // 从URL中提取文件名
    const filename = menuItem[0].image_url.split('/').pop();
    const filepath = path.join('public/uploads', filename);

    // 检查文件是否存在
    if (fs.existsSync(filepath)) {
      // 删除文件
      fs.unlinkSync(filepath);
    }

    // 更新数据库中的图片URL为null
    await connection.query(
      'UPDATE menu_items SET image_url = NULL WHERE id = ?',
      [menuItemId]
    );

    await connection.commit();

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting menu item image:', error);
    next(error);
  } finally {
    connection.release();
  }
}; 