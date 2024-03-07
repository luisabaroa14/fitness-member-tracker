<template>
  <div>
    <h2>Set Class</h2>
    <router-link :to="{ name: 'add-payment', params: { id: userId } }"> Add payment </router-link>
    <p>Next payment date: {{ calculateNextPaymentDate() }}</p>
    <p>Debt: ${{ user?.totalDebt }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PAYMENTS, USERS, SUBSCRIPTIONS } from '@/utils/constants'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  where
} from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'

const db = getFirestore(firebaseApp)
const route = useRoute()

const userId = ref(route.params.id)

const payments = ref([])
const user = ref(null)
const latestSubscription = ref(null)

onMounted(async () => {
  await fetchUserPayments()
  await fetchUser()
  setLatestSubscription()
})

const fetchUserPayments = async () => {
  try {
    const paymentsCollection = collection(db, PAYMENTS)

    const querySnapshot = await getDocs(
      query(paymentsCollection, where('userId', '==', userId.value), orderBy('date', 'desc'))
    )

    payments.value = querySnapshot.docs.map((doc) => {
      const payments = doc.data()
      payments.date = payments.date.toDate()
      return { id: doc.id, ...payments }
    })
  } catch (error) {
    console.error('Error fetching payments: ', error.message)
    alert('An error occurred while fetching payments.')
  }
}

const fetchUser = async () => {
  try {
    const userDocRef = doc(db, USERS, userId.value)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const userData = { id: userDocSnap.id, ...userDocSnap.data() }

      let totalDebt = 0
      userData.subscriptionData.forEach((subscription) => {
        subscription.startDate = subscription.startDate?.toDate() ?? null
        subscription.endDate = subscription.endDate?.toDate() ?? null

        const startDate = new Date(subscription.startDate)
        let endDate = subscription.endDate ? new Date(subscription.endDate) : new Date()

        // Calculate the difference in months
        const diffMonths =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth())

        subscription.diffMonths = diffMonths

        if (payments.value) {
          // Get the payments for the current subscription
          const subscriptionPayments = payments.value.filter((payment) => {
            return payment.date >= startDate && payment.date <= endDate
          })

          // Calculate the total amount paid for the current subscription
          subscription.totalPaid = subscriptionPayments.reduce(
            (acc, payment) => acc + payment.amount,
            0
          )

          // Add the debt of the subscription to the total amount
          totalDebt +=
            subscription.diffMonths * SUBSCRIPTIONS[subscription.type].amount -
            subscription.totalPaid
        }
      })

      userData.totalDebt = totalDebt

      user.value = userData
    } else {
      console.error('User not found')
      throw new Error('User not found')
    }
  } catch (error) {
    console.error('Error fetching user: ', error.message)
    throw new Error('Failed to fetch user data')
  }
}

const setLatestSubscription = () => {
  // Ensure user data is available
  if (!user.value || !user.value.subscriptionData) {
    return null // Handle when user or subscription data is not available
  }

  // Get the user's subscription data
  const subscriptions = user.value.subscriptionData

  // Find the subscription with the latest start date
  let maxStartDate = new Date(0) // Initialize with a minimal date

  // Loop through the subscriptions to find the latest start date
  subscriptions.forEach((subscription) => {
    const startDate = new Date(subscription.startDate)
    if (startDate > maxStartDate) {
      maxStartDate = startDate
      latestSubscription.value = subscription
    }
  })
}

const calculateNextPaymentDate = () => {
  // Ensure user and payments are fetched and available
  if (!user.value) return 'User data not available'

  // Ensure current subscription is available
  if (!latestSubscription?.value || latestSubscription.value?.endDate)
    return 'Current subscription not found'

  const startDate = new Date(latestSubscription.value.startDate)

  // Find the next payment date
  const nextPaymentDate = getNextPaymentDate(startDate)

  // Calculate the difference in days between today and the next payment date
  const currentDate = new Date()
  const differenceInTime = nextPaymentDate.getTime() - currentDate.getTime()
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24))

  return nextPaymentDate.toDateString() + ` (${differenceInDays} days)`
}

const getNextPaymentDate = (startDate) => {
  const today = new Date()
  const day = startDate.getDate()
  let nextPaymentMonth
  let nextPaymentYear = today.getFullYear()

  // If day is greater than today's date, set the next payment month to be the current month
  if (day > today.getDate()) {
    nextPaymentMonth = today.getMonth()
  } else {
    nextPaymentMonth = today.getMonth() + 1
  }

  // Set the next payment date to be on the current month
  const nextPaymentDate = new Date(nextPaymentYear, nextPaymentMonth, day)
  const startPaymentDate = new Date(nextPaymentYear, nextPaymentMonth - 1, day)

  const hasPaymentWithin30Days = payments.value.some((payment) => {
    const paymentDate = new Date(payment.date)
    return paymentDate >= startPaymentDate && paymentDate <= nextPaymentDate
  })

  if (hasPaymentWithin30Days) {
    // If there's a payment within 30 days, add another month
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
  }

  return nextPaymentDate
}
</script>
