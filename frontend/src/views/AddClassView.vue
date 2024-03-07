<template>
  <div>
    <h2>Set Class</h2>
    <router-link :to="{ name: 'add-payment', params: { id: userId } }"> Add payment </router-link>
    <p>Next payment date: {{ calculateNextPaymentDate() }}</p>
    <p>Debt: ${{ user?.totalDebt }}</p>
  </div>
  <h2>Add Class</h2>
  <form @submit.prevent="addClass">
    <label>Date:</label>
    <input type="date" v-model="date" required :max="maxInputDate()" /><br />
    <button type="submit">Add Class</button>
  </form>
  <h2>Classes</h2>
  <div v-if="classes.length === 0">No classes available.</div>
  <div v-else>
    <p>Classes this week: {{ weekClasses.length }}</p>
    <div v-if="latestSubscription?.type">
      <p v-if="SUBSCRIPTIONS[latestSubscription.type]?.hoursPerWeek > 0">
        Missing classes:
        {{ SUBSCRIPTIONS[latestSubscription.type]?.hoursPerWeek - weekClasses.length }}
      </p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in classes" :key="c.id">
          <td>{{ c.date?.toDateString() }}</td>
          <td>
            <button @click="deleteClass(c.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { USERS, SUBSCRIPTIONS, CLASSES } from '@/utils/constants'
import { getUserPayments } from '@/services/firestore/paymentsService'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'
import { maxInputDate } from '@/utils/functions'

const db = getFirestore(firebaseApp)
const route = useRoute()

const userId = ref(route.params.id)

const user = ref(null)
const payments = ref([])
const classes = ref([])
const date = ref('')
const latestSubscription = ref(null)

onMounted(async () => {
  await fetchUserPayments()
  await fetchUserClasses()
  await fetchUser()
  setLatestSubscription()
})

const weekClasses = computed(() => {
  // Get the current date
  const today = new Date()
  const currentDayOfWeek = today.getDay() // 0: Sunday, 1: Monday, ..., 6: Saturday

  // Calculate the start date of the current week (Monday)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (currentDayOfWeek - 1)) // Adjust for Monday
  startDate.setHours(0, 0, 0, 0) // Set time to midnight

  // Calculate the end date of the current week (Sunday)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6) // Add 6 days to get to Sunday
  endDate.setHours(23, 59, 59, 999) // Set time to end of day (23:59:59)

  // Assuming classes.value is your list of classes with dates
  return classes.value.filter((c) => {
    const classDate = new Date(c.date)
    classDate.setHours(0, 0, 0, 0) // Set time to midnight for comparison
    return classDate >= startDate && classDate <= endDate
  })
})

const fetchUserPayments = async () => {
  try {
    const querySnapshot = await getUserPayments(userId.value)

    payments.value = querySnapshot.docs.map((doc) => {
      const payments = doc.data()
      payments.date = payments.date?.toDate()
      return { id: doc.id, ...payments }
    })
  } catch (error) {
    console.error('Error fetching payments: ', error.message)
    alert('An error occurred while fetching payments.')
  }
}

const fetchUserClasses = async () => {
  try {
    const classessCollection = collection(db, CLASSES)

    const querySnapshot = await getDocs(
      query(classessCollection, where('userId', '==', userId.value), orderBy('date', 'desc'))
    )

    classes.value = querySnapshot.docs.map((doc) => {
      const classes = doc.data()
      classes.date = classes.date?.toDate()
      return { id: doc.id, ...classes }
    })
  } catch (error) {
    console.error('Error fetching classes: ', error.message)
    alert('An error occurred while fetching classes.')
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

const addClass = async () => {
  try {
    const docRef = await addDoc(collection(db, CLASSES), {
      userId: userId.value,
      date: new Date(date.value + 'T00:00:00')
    })

    alert('Class added successfully!')

    // Add payment to the local classes array
    classes.value.push({
      id: docRef.id,
      userId: userId.value,
      date: new Date(date.value + 'T00:00:00')
    })

    // Sort the classes by date
    classes.value.sort((a, b) => b.date - a.date)

    // Clear the form after adding a class
    date.value = ''
  } catch (error) {
    console.error('Error adding class: ', error.message)
    alert('An error occurred while adding a class.')
  }
}

const deleteClass = async (classId) => {
  try {
    await deleteDoc(doc(db, CLASSES, classId))
    classes.value = classes.value.filter((c) => c.id !== classId)
    alert('Class deleted successfully!')
  } catch (error) {
    console.error('Error deleting class: ', error.message)
    alert('An error occurred while deleting class.')
  }
}
</script>
