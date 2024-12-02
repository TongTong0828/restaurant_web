const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../middleware/errorHandler');
const database = require('../config/database');

// ���� multer �洢
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    // ȷ���ϴ�Ŀ¼����
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // ����Ψһ�ļ�������������IDǰ׺
    const restaurantId = req.user.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `restaurant_${restaurantId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// �ļ�������
const fileFilter = (req, file, cb) => {
  // ֻ����ͼƬ�ļ�
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400), false);
  }
};

// ���� multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // ���� 5MB
  }
});

// �ϴ���ƷͼƬ
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

      // ��֤��Ʒ�Ƿ����ڸò���
      const [menuItem] = await connection.query(
        'SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?',
        [menuItemId, restaurantId]
      );

      if (!menuItem.length) {
        // ɾ�����ϴ����ļ�
        fs.unlinkSync(req.file.path);
        throw new AppError('Menu item not found or does not belong to this restaurant', 404);
      }

      // ����ͼƬURL
      const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

      console.log('Updating menu item with image URL:', imageUrl);

      // ���²�Ʒ��ͼƬURL
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
      // �������ɾ�����ϴ����ļ�
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

// ɾ����ƷͼƬ
exports.deleteMenuItemImage = async (req, res, next) => {
  const pool = database.getPool();
  const connection = await pool.getConnection();
  
  try {
    const { menuItemId } = req.params;
    const restaurantId = req.user.id;

    // ��ȡ��Ʒ��Ϣ
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

    // ��URL����ȡ�ļ���
    const filename = menuItem[0].image_url.split('/').pop();
    const filepath = path.join('public/uploads', filename);

    // ����ļ��Ƿ����
    if (fs.existsSync(filepath)) {
      // ɾ���ļ�
      fs.unlinkSync(filepath);
    }

    // �������ݿ��е�ͼƬURLΪnull
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