<template>
  <div>
    <h2>Add Payment</h2>
    <form @submit.prevent="addPayment">
      <label>Amount:</label>
      <input type="number" v-model.number="amount" required /><br />
      <label>Date:</label>
      <input type="date" v-model="date" required :max="maxInputDate()" /><br />
      <button type="submit">Add Payment</button>
    </form>

    <h2>Payments</h2>
    <div v-if="payments.length === 0">No payments available.</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td>${{ payment.amount }}</td>
            <td>{{ payment.date?.toDateString() }}</td>
            <td>
              <button @click="deletePayment(payment.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  collection,
  doc,
  addDoc,
  getFirestore,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'
import { PAYMENTS } from '@/utils/constants'
import { maxInputDate } from '@/utils/functions'

const db = getFirestore(firebaseApp)
const route = useRoute()
const userId = ref(route.params.id)

const amount = ref('')
const date = ref('')
const payments = ref([])

onMounted(async () => {
  fetchPayments()
})

const addPayment = async () => {
  try {
    // // Example of adding a subcollection to a user
    // const paymentsCollectionRef = collection(db, USERS, userId.value, PAYMENTS)
    // // Add payment to the user's payments collection
    // await addDoc(paymentsCollectionRef, {
    //   amount: amount.value,
    //   date: new Date(date.value + 'T00:00:00')
    // })

    await addDoc(collection(db, PAYMENTS), {
      userId: userId.value,
      amount: amount.value,
      date: new Date(date.value + 'T00:00:00')
    })

    alert('Payment added successfully!')

    // Add payment to the local payments array
    payments.value.push({
      userId: userId.value,
      amount: amount.value,
      date: new Date(date.value + 'T00:00:00')
    })

    // Clear the form after adding payment
    amount.value = ''
    date.value = ''
  } catch (error) {
    console.error('Error adding payment: ', error.message)
    alert('An error occurred while adding payment.')
  }
}

const deletePayment = async (paymentId) => {
  try {
    await deleteDoc(doc(db, 'payments', paymentId))
    payments.value = payments.value.filter((payment) => payment.id !== paymentId)
    alert('Payment deleted successfully!')
  } catch (error) {
    console.error('Error deleting payment: ', error.message)
    alert('An error occurred while deleting payment.')
  }
}

const fetchPayments = async () => {
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
</script>
