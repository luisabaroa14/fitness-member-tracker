<template>
  <div>
    <h2>Payments</h2>
    <router-link :to="{ name: 'add-payment', params: { id: userId } }"> Add payment </router-link>
    <div v-if="payments.length === 0">No payments available.</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td>{{ payment.id }}</td>
            <td>{{ payment.amount }}</td>
            <td>{{ payment.date }}</td>
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
import { PAYMENTS } from '@/utils/constants'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'

const db = getFirestore(firebaseApp)
const route = useRoute()

const userId = ref(route.params.id)

const payments = ref([])

const fetchPayments = async () => {
  try {
    const paymentsCollection = collection(db, PAYMENTS)

    const querySnapshot = await getDocs(
      query(paymentsCollection, where('userId', '==', userId.value), orderBy('date', 'desc'))
    )

    payments.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching payments: ', error.message)
    alert('An error occurred while fetching payments.')
  }
}

onMounted(fetchPayments)

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
</script>
