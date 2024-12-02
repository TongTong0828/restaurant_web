const Location = require('../models/location');
const { AppError } = require('../middleware/errorHandler');

// 地址转换为经纬度
exports.geocodeAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    const location = await Location.geocodeAddress(address);
    res.json({
      status: 'success',
      data: { location }
    });
  } catch (error) {
    next(error);
  }
};

// 距离和配送时间估算
exports.estimateDelivery = async (req, res, next) => {
  try {
    const { userLatitude, userLongitude, restaurantId } = req.query;
    const estimate = await Location.estimateDelivery(
      userLatitude,
      userLongitude,
      restaurantId
    );
    res.json({
      status: 'success',
      data: { estimate }
    });
  } catch (error) {
    next(error);
  }
};

// 查找附近餐厅
exports.findNearbyRestaurants = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.body;
    const restaurants = await Location.findNearbyRestaurants(
      latitude,
      longitude,
      radius
    );
    res.json({
      status: 'success',
      data: { restaurants }
    });
  } catch (error) {
    next(error);
  }
};

// 更新餐厅位置
exports.updateRestaurantLocation = async (req, res, next) => {
  try {
    const { address } = req.body;
    const location = await Location.updateRestaurantLocation(req.user.id, address);
    res.json({
      status: 'success',
      data: { location }
    });
  } catch (error) {
    next(error);
  }
};

// 更新配送区域
exports.updateDeliveryArea = async (req, res, next) => {
  try {
    const result = await Location.updateDeliveryArea(req.user.id, req.body);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 检查配送可用性
exports.checkDeliveryAvailability = async (req, res, next) => {
  try {
    const { restaurantId, deliveryAddress } = req.body;
    const availability = await Location.checkDeliveryAvailability(
      restaurantId,
      deliveryAddress
    );
    res.json({
      status: 'success',
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
}; 