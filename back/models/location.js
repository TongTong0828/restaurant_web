const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const axios = require('axios');
require('dotenv').config();

const GEOCODING_API_KEY = process.env.GOOGLE_MAPS_GEOCODING_API_KEY;
const DISTANCE_MATRIX_API_KEY = process.env.GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY;

class Location {
  static async geocodeAddress(address) {
    try {
      // 如果有 API 密钥，使用 Google Maps API
      if (GEOCODING_API_KEY && GEOCODING_API_KEY !== 'your-geocoding-api-key') {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GEOCODING_API_KEY}`
        );

        if (response.data.status !== 'OK') {
          throw new AppError('Geocoding failed', 400);
        }

        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: response.data.results[0].formatted_address
        };
      } else {
        // 降级方案：使用模拟数据
        // 这里使用一个简单的算法将地址字符串转换为模拟坐标
        const hash = this.simpleHash(address);
        return {
          latitude: 39.9042 + (hash % 100) / 1000,
          longitude: 116.4074 + (hash % 100) / 1000,
          formatted_address: address
        };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error geocoding address', 500);
    }
  }

  static async estimateDelivery(originLat, originLng, restaurantId) {
    const pool = database.getPool();

    try {
      // 获取餐厅地址
      const [restaurant] = await pool.query(
        'SELECT address, latitude, longitude FROM restaurants WHERE id = ?',
        [restaurantId]
      );

      if (restaurant.length === 0) {
        throw new AppError('Restaurant not found', 404);
      }

      // 如果有 API 密钥，使用 Google Maps Distance Matrix API
      if (DISTANCE_MATRIX_API_KEY && DISTANCE_MATRIX_API_KEY !== 'your-distance-matrix-api-key') {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${restaurant[0].latitude},${restaurant[0].longitude}&key=${DISTANCE_MATRIX_API_KEY}`
        );

        if (response.data.status !== 'OK') {
          throw new AppError('Distance calculation failed', 400);
        }

        const element = response.data.rows[0].elements[0];
        return {
          distance: element.distance.text,
          duration: element.duration.text,
          restaurant_address: restaurant[0].address
        };
      } else {
        // 降级方案：使用 Haversine 公式计算距离
        const distance = this.calculateDistance(
          originLat,
          originLng,
          restaurant[0].latitude,
          restaurant[0].longitude
        );

        // 假设平均速度为 30 km/h
        const duration = Math.round(distance * 2); // 分钟
        
        return {
          distance: `${Math.round(distance * 10) / 10} km`,
          duration: `${duration} mins`,
          restaurant_address: restaurant[0].address
        };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error estimating delivery', 500);
    }
  }

  static async findNearbyRestaurants(latitude, longitude, radius) {
    const pool = database.getPool();

    try {
      // 使用 Haversine 公式计算距离
      const [restaurants] = await pool.query(
        `SELECT 
          r.*,
          (
            6371 * acos(
              cos(radians(?)) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(?)) +
              sin(radians(?)) * sin(radians(latitude))
            )
          ) AS distance
         FROM restaurants r
         HAVING distance < ?
         ORDER BY distance`,
        [latitude, longitude, latitude, radius]
      );

      // 获取每个餐厅的菜单项数量和评分
      for (let restaurant of restaurants) {
        const [menuCount] = await pool.query(
          'SELECT COUNT(*) as count FROM menu_items WHERE restaurant_id = ?',
          [restaurant.id]
        );

        const [ratingData] = await pool.query(
          `SELECT 
            AVG(rating) as average_rating,
            COUNT(*) as rating_count
           FROM reviews
           WHERE restaurant_id = ?`,
          [restaurant.id]
        );

        restaurant.menu_items_count = menuCount[0].count;
        restaurant.average_rating = ratingData[0].average_rating || 0;
        restaurant.rating_count = ratingData[0].rating_count || 0;
        restaurant.distance = Math.round(restaurant.distance * 100) / 100;
      }

      return restaurants;
    } catch (error) {
      throw new AppError('Error finding nearby restaurants', 500);
    }
  }

  static async updateRestaurantLocation(restaurantId, address) {
    const pool = database.getPool();

    try {
      // 获取地址的地理坐标
      const location = await this.geocodeAddress(address);

      // 更新餐厅位置信息
      await pool.query(
        `UPDATE restaurants 
         SET 
           address = ?,
           latitude = ?,
           longitude = ?,
           formatted_address = ?
         WHERE id = ?`,
        [
          address,
          location.latitude,
          location.longitude,
          location.formatted_address,
          restaurantId
        ]
      );

      return {
        address: location.formatted_address,
        latitude: location.latitude,
        longitude: location.longitude
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating restaurant location', 500);
    }
  }

  static async updateDeliveryArea(restaurantId, deliveryAreaData) {
    const pool = database.getPool();
    const { radius, minimum_order, delivery_fee } = deliveryAreaData;

    try {
      await pool.query(
        `UPDATE restaurants 
         SET 
           delivery_radius = ?,
           minimum_order = ?,
           delivery_fee = ?
         WHERE id = ?`,
        [radius, minimum_order, delivery_fee, restaurantId]
      );

      return { message: 'Delivery area updated successfully' };
    } catch (error) {
      throw new AppError('Error updating delivery area', 500);
    }
  }

  static async checkDeliveryAvailability(restaurantId, deliveryAddress) {
    const pool = database.getPool();

    try {
      // 获取餐厅信息
      const [restaurant] = await pool.query(
        'SELECT address, delivery_radius FROM restaurants WHERE id = ?',
        [restaurantId]
      );

      if (restaurant.length === 0) {
        throw new AppError('Restaurant not found', 404);
      }

      // 获取送货地址的坐标
      const deliveryLocation = await this.geocodeAddress(deliveryAddress);
      const restaurantLocation = await this.geocodeAddress(restaurant[0].address);

      // 计算距离
      const distance = this.calculateDistance(
        restaurantLocation.latitude,
        restaurantLocation.longitude,
        deliveryLocation.latitude,
        deliveryLocation.longitude
      );

      return {
        available: distance <= restaurant[0].delivery_radius,
        distance: Math.round(distance * 100) / 100,
        delivery_radius: restaurant[0].delivery_radius
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error checking delivery availability', 500);
    }
  }

  // 使用 Haversine 公式计算两点之间的距离（公里）
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRad(value) {
    return value * Math.PI / 180;
  }

  // 简单的字符串哈希函数，用于生成模拟坐标
  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

module.exports = Location; 