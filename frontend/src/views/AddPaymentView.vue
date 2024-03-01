<template>
  <div>
    <h2>Add Payment</h2>
    <form @submit.prevent="addPayment">
      <label>Amount:</label>
      <input type="number" v-model.number="amount" required /><br />
      <label>Date:</label>
      <input type="date" v-model="date" required /><br />
      <button type="submit">Add Payment</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { collection, addDoc, getFirestore } from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'
import { PAYMENTS } from '@/utils/constants'

const db = getFirestore(firebaseApp)
const route = useRoute()
const userId = ref(route.params.id)

const amount = ref('')
const date = ref('')

const addPayment = async () => {
  try {
    await addDoc(collection(db, PAYMENTS), {
      amount: amount.value,
      userId: userId.value,
      date: date.value
    })

    // Clear the form after adding payment
    amount.value = ''
    date.value = ''
    alert('Payment added successfully!')
  } catch (error) {
    console.error('Error adding payment: ', error.message)
    alert('An error occurred while adding payment.')
  }
}
</script>
