<template>
  <div>
    <LogoIcon />
    <div class="center-item">
      <h2>Add Payment</h2>
      <form @submit.prevent="createPayment">
        <label>Amount:</label>
        <input class="w-100 mb-1" type="number" v-model.number="amount" required /><br />
        <label>Date:</label>
        <input class="w-100 mb-1" type="date" v-model="date" required :max="maxInputDate()" /><br />
        <button class="w-100" type="submit">Add Payment</button>
      </form>
    </div>
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
              <button @click="removePayment(payment.id)">Delete</button>
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
import { addPayment, deletePayment, getUserPayments } from '@/services/firestore/paymentsService'
import { maxInputDate } from '@/utils/functions'
import LogoIcon from '@/components/LogoIcon.vue';

const route = useRoute()
const userId = ref(route.params.id)

const amount = ref('')
const date = ref('')
const payments = ref([])

onMounted(async () => {
  fetchPayments()
})

const createPayment = async () => {
  try {
    const docRef = await addPayment(userId.value, amount.value, date.value)

    alert('Payment added successfully!')

    // Add payment to the local payments array
    payments.value.push({
      id: docRef.id,
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

const removePayment = async (paymentId) => {
  try {
    await deletePayment(paymentId)
    payments.value = payments.value.filter((payment) => payment.id !== paymentId)
    alert('Payment deleted successfully!')
  } catch (error) {
    console.error('Error deleting payment: ', error.message)
    alert('An error occurred while deleting payment.')
  }
}

const fetchPayments = async () => {
  try {
    const querySnapshot = await getUserPayments(userId.value)

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
