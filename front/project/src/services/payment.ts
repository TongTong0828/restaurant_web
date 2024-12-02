import request from '@/utils/request'

export interface CreatePaymentRequest {
  amount: number
  paymentMethod: 'online'
}

export interface PaymentResponse {
  status: string
  data: {
    payment: {
      id: string
      status: string
    }
  }
}

export const paymentService = {
  async createPayment(orderId: string, data: CreatePaymentRequest) {
    const response = await request.post<PaymentResponse>(`/api/payments/create/${orderId}`, data)
    return response.data
  },

  async getPaymentStatus(orderId: string) {
    const response = await request.get<PaymentResponse>(`/api/payments/status/${orderId}`)
    return response.data
  }
} 