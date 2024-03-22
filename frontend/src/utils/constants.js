export const USERS = 'users'
export const PAYMENTS = 'payments'
export const CLASSES = 'classes'

export const SUBSCRIPTIONS = Object.freeze({
  0: {
    type: '0',
    name: 'No suscripción',
    hoursPerWeek: null,
    amount: 0
  },
  1: {
    type: '1',
    name: 'Básico',
    hoursPerWeek: 5,
    amount: import.meta.env.VITE_SUBSCRIPTION_0_AMOUNT
  },
  2: {
    type: '2',
    name: 'Intermedio',
    hoursPerWeek: 8,
    amount: import.meta.env.VITE_SUBSCRIPTION_1_AMOUNT
  },
  3: {
    type: '3',
    name: 'Avanzado',
    hoursPerWeek: 0,
    amount: import.meta.env.VITE_SUBSCRIPTION_2_AMOUNT
  },
  4: {
    type: '4',
    name: 'Free Gym',
    hoursPerWeek: 0,
    amount: import.meta.env.VITE_SUBSCRIPTION_3_AMOUNT
  }
})

export const CLASS_TYPES = Object.freeze({
  0: {
    type: '0',
    name: import.meta.env.VITE_CLASS_TYPE_0,
    
  },
  1: {
    type: '1',
    name: import.meta.env.VITE_CLASS_TYPE_1
  }
})

export const PAYMENT_TYPES = Object.freeze({
  0: {
    type: '0',
    name: import.meta.env.VITE_PAYMENT_TYPE_0,
    
  },
  1: {
    type: '1',
    name: import.meta.env.VITE_PAYMENT_TYPE_1
  }
})