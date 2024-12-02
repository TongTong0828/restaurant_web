const Search = require('../models/search');
const { AppError } = require('../middleware/errorHandler');

// 搜索菜单项
exports.searchMenu = async (req, res, next) => {
  try {
    const { query, restaurant_id, category, price_min, price_max, dietary } = req.query;
    const filters = {
      restaurant_id,
      category,
      price_min: price_min ? parseFloat(price_min) : undefined,
      price_max: price_max ? parseFloat(price_max) : undefined,
      dietary: dietary ? dietary.split(',') : undefined
    };

    const menuItems = await Search.searchMenuItems(query, filters);
    res.json({
      status: 'success',
      data: { menuItems }
    });
  } catch (error) {
    next(error);
  }
};

// 搜索平台政策
exports.searchPolicies = async (req, res, next) => {
  try {
    const { query, category } = req.query;
    const policies = await Search.searchPolicies(query, category);
    res.json({
      status: 'success',
      data: { policies }
    });
  } catch (error) {
    next(error);
  }
};

// 推荐餐厅
exports.recommendRestaurants = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cuisine_preference, location, price_range } = req.body;
    
    const recommendations = await Search.getRestaurantRecommendations(userId, {
      cuisine_preference,
      location,
      price_range
    });

    res.json({
      status: 'success',
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
}; 