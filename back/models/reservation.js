const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const Notification = require('./notification');

class Reservation {
  static async createReservation(customerId, reservationData) {
    const pool = database.getPool();
    const {
      restaurantId,
      date,
      time,
      numberOfPeople,
      specialRequests
    } = reservationData;

    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 检查餐厅是否存在
        const [restaurant] = await connection.query(
          'SELECT * FROM restaurants WHERE id = ?',
          [restaurantId]
        );

        if (restaurant.length === 0) {
          throw new AppError('Restaurant not found', 404);
        }

        // 检查时间段是否可用
        const isAvailable = await this.checkAvailability(
          connection,
          restaurantId,
          date,
          time,
          numberOfPeople
        );

        if (!isAvailable) {
          throw new AppError('Selected time slot is not available', 400);
        }

        // 创建预订
        const [result] = await connection.query(
          `INSERT INTO reservations (
            customer_id, restaurant_id, reservation_date,
            reservation_time, number_of_people, special_requests, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [customerId, restaurantId, date, time, numberOfPeople, specialRequests]
        );

        await connection.commit();

        // 获取完整的预订信息
        const [reservation] = await pool.query(
          `SELECT r.*, c.username as customer_name, res.restaurant_name
           FROM reservations r
           JOIN customers c ON r.customer_id = c.id
           JOIN restaurants res ON r.restaurant_id = res.id
           WHERE r.id = ?`,
          [result.insertId]
        );

        // 发送通知
        await Notification.createReservationNotification(
          result.insertId,
          'reservation_placed'
        );

        return reservation[0];
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating reservation', 500);
    }
  }

  static async checkAvailability(connection, restaurantId, date, time, numberOfPeople) {
    // 获取餐厅的容量和当前时间段的预订情况
    const [restaurantCapacity] = await connection.query(
      'SELECT seating_capacity FROM restaurants WHERE id = ?',
      [restaurantId]
    );

    const [existingReservations] = await connection.query(
      `SELECT SUM(number_of_people) as total_people
       FROM reservations
       WHERE restaurant_id = ?
       AND reservation_date = ?
       AND reservation_time = ?
       AND status IN ('pending', 'confirmed')`,
      [restaurantId, date, time]
    );

    const totalPeople = existingReservations[0].total_people || 0;
    return (totalPeople + numberOfPeople) <= restaurantCapacity[0].seating_capacity;
  }

  static async getUserReservations(customerId) {
    const pool = database.getPool();

    try {
      const [reservations] = await pool.query(
        `SELECT r.*, res.restaurant_name, res.address, res.phone
         FROM reservations r
         JOIN restaurants res ON r.restaurant_id = res.id
         WHERE r.customer_id = ?
         ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
        [customerId]
      );

      return reservations;
    } catch (error) {
      throw new AppError('Error fetching user reservations', 500);
    }
  }

  static async getRestaurantReservations(restaurantId, date) {
    const pool = database.getPool();

    try {
      let query = `
        SELECT r.*, c.username as customer_name, c.phone as customer_phone
        FROM reservations r
        JOIN customers c ON r.customer_id = c.id
        WHERE r.restaurant_id = ?
      `;
      const params = [restaurantId];

      if (date) {
        query += ' AND r.reservation_date = ?';
        params.push(date);
      }

      query += ' ORDER BY r.reservation_date, r.reservation_time';

      const [reservations] = await pool.query(query, params);
      return reservations;
    } catch (error) {
      throw new AppError('Error fetching restaurant reservations', 500);
    }
  }

  static async cancelReservation(reservationId, customerId) {
    const pool = database.getPool();

    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 检查预订是否存在且属于该用户
        const [reservation] = await connection.query(
          'SELECT * FROM reservations WHERE id = ? AND customer_id = ?',
          [reservationId, customerId]
        );

        if (reservation.length === 0) {
          throw new AppError('Reservation not found', 404);
        }

        if (reservation[0].status === 'cancelled') {
          throw new AppError('Reservation is already cancelled', 400);
        }

        // 更新预订状态
        await connection.query(
          'UPDATE reservations SET status = "cancelled" WHERE id = ?',
          [reservationId]
        );

        await connection.commit();

        // 获取更新后的预订信息
        const [updatedReservation] = await pool.query(
          `SELECT r.*, res.restaurant_name
           FROM reservations r
           JOIN restaurants res ON r.restaurant_id = res.id
           WHERE r.id = ?`,
          [reservationId]
        );

        return updatedReservation[0];
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error cancelling reservation', 500);
    }
  }

  static async updateReservationStatus(reservationId, restaurantId, status) {
    const pool = database.getPool();

    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 检查预订是否存在且属于该餐厅
        const [reservation] = await connection.query(
          'SELECT * FROM reservations WHERE id = ? AND restaurant_id = ?',
          [reservationId, restaurantId]
        );

        if (reservation.length === 0) {
          throw new AppError('Reservation not found', 404);
        }

        // 更新预订状态
        await connection.query(
          'UPDATE reservations SET status = ? WHERE id = ?',
          [status, reservationId]
        );

        await connection.commit();

        // 发送通知
        if (status === 'confirmed') {
          await Notification.createReservationNotification(
            reservationId,
            'reservation_confirmed'
          );
        }

        // 获取更新后的预订信息
        const [updatedReservation] = await pool.query(
          `SELECT r.*, c.username as customer_name, c.phone as customer_phone
           FROM reservations r
           JOIN customers c ON r.customer_id = c.id
           WHERE r.id = ?`,
          [reservationId]
        );

        return updatedReservation[0];
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating reservation status', 500);
    }
  }

  static async getAvailableTimeSlots(restaurantId, date) {
    const pool = database.getPool();

    try {
      // 获取餐厅营业时间和容量
      const [restaurant] = await pool.query(
        'SELECT opening_time, closing_time, seating_capacity FROM restaurants WHERE id = ?',
        [restaurantId]
      );

      if (restaurant.length === 0) {
        throw new AppError('Restaurant not found', 404);
      }

      // 生成时间段（假设每个时段为1小时）
      const timeSlots = this.generateTimeSlots(
        restaurant[0].opening_time,
        restaurant[0].closing_time
      );

      // 获取每个时间段的预订情况
      const [reservations] = await pool.query(
        `SELECT reservation_time, SUM(number_of_people) as total_people
         FROM reservations
         WHERE restaurant_id = ?
         AND reservation_date = ?
         AND status IN ('pending', 'confirmed')
         GROUP BY reservation_time`,
        [restaurantId, date]
      );

      // 计算每个时间段的可用性
      const availableSlots = timeSlots.map(time => {
        const reservation = reservations.find(r => r.reservation_time === time);
        const reservedSeats = reservation ? reservation.total_people : 0;
        const availableSeats = restaurant[0].seating_capacity - reservedSeats;

        return {
          time,
          available_seats: availableSeats,
          is_available: availableSeats > 0
        };
      });

      return availableSlots;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error getting available time slots', 500);
    }
  }

  static generateTimeSlots(openingTime, closingTime) {
    const slots = [];
    let currentTime = new Date(`2000-01-01 ${openingTime}`);
    const endTime = new Date(`2000-01-01 ${closingTime}`);

    while (currentTime < endTime) {
      slots.push(currentTime.toTimeString().slice(0, 5));
      currentTime.setHours(currentTime.getHours() + 1);
    }

    return slots;
  }
}

module.exports = Reservation; 