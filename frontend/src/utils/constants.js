export const USERS = 'users'

export const SUBSCRIPTIONS = Object.freeze({
  0: {
    type: "0",
    name: 'No suscripción',
    hoursPerWeek: null,
    amount: 0
  },
  1: {
    type: "1",
    name: 'Básico',
    hoursPerWeek: 5,
    amount: import.meta.env.VITE_SUBSCRIPTION_0_AMOUNT
  },
  2: {
    type: "2",
    name: 'Intermedio',
    hoursPerWeek: 8,
    amount: import.meta.env.VITE_SUBSCRIPTION_1_AMOUNT
  },
  3: {
    type: "3",
    name: 'Avanzado',
    hoursPerWeek: 0,
    amount: import.meta.env.VITE_SUBSCRIPTION_2_AMOUNT
  },
  4: {
    type: "4",
    name: 'Free Gym',
    hoursPerWeek: 0,
    amount: import.meta.env.VITE_SUBSCRIPTION_3_AMOUNT
  }
})
