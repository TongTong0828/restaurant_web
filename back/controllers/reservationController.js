const Reservation = require('../models/reservation');
const { AppError } = require('../middleware/errorHandler');

// ����Ԥ��
exports.createReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.createReservation(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { reservation }
    });
  } catch (error) {
    next(error);
  }
};

// ��ȡ�û���Ԥ���б�
exports.getUserReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.getUserReservations(req.user.id);
    res.json({
      status: 'success',
      data: { reservations }
    });
  } catch (error) {
    next(error);
  }
};

// ��ȡ������Ԥ���б�
exports.getRestaurantReservations = async (req, res, next) => {
  try {
    const { date } = req.query;
    const reservations = await Reservation.getRestaurantReservations(
      req.user.restaurant_id,
      date
    );
    res.json({
      status: 'success',
      data: { reservations }
    });
  } catch (error) {
    next(error);
  }
};

// ȡ��Ԥ��
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.cancelReservation(
      req.params.reservation_id,
      req.user.id
    );
    res.json({
      status: 'success',
      data: { reservation }
    });
  } catch (error) {
    next(error);
  }
};

// ����Ԥ��״̬�������ã�
exports.updateReservationStatus = async (req, res, next) => {
  try {
    if (!req.user.restaurant_id) {
      throw new AppError('Only restaurant staff can update reservation status', 403);
    }

    const reservation = await Reservation.updateReservationStatus(
      req.params.reservation_id,
      req.user.restaurant_id,
      req.body.status
    );
    res.json({
      status: 'success',
      data: { reservation }
    });
  } catch (error) {
    next(error);
  }
};

// ��ȡ����ʱ���
exports.getAvailableTimeSlots = async (req, res, next) => {
  try {
    const { restaurant_id, date } = req.query;
    if (!restaurant_id || !date) {
      throw new AppError('Restaurant ID and date are required', 400);
    }

    const availableSlots = await Reservation.getAvailableTimeSlots(
      restaurant_id,
      date
    );
    res.json({
      status: 'success',
      data: { available_slots: availableSlots }
    });
  } catch (error) {
    next(error);
  }
}; 