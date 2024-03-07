<template>
  <div>
    <h2>Create User</h2>
    <form @submit.prevent="createUser">
      <label>Name:</label>
      <input type="text" v-model="user.name" required /><br />
      <label>Email:</label>
      <input type="email" v-model="user.mail" required /><br />

      <!-- Subscription Data -->
      <label>Subscription Type:</label>
      <select v-model="user.subscriptionType">
        <option v-for="(subscription, key) in SUBSCRIPTIONS" :value="key" :key="key">
          {{ subscription.name }}
        </option></select
      ><br />

      <label>Subscription Start Date:</label>
      <input
        type="date"
        v-model="user.subscriptionStartDate"
        :max="maxInputDate()"
        required
      /><br />
      <label>Subscription End Date:</label>
      <input type="date" v-model="user.subscriptionEndDate" :max="maxInputDate()" /><br />

      <label>Start Date:</label>
      <input type="date" v-model="user.startDate" :max="maxInputDate()" required /><br />

      <button type="submit">Create User</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { collection, addDoc, getFirestore } from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'
import { USERS, SUBSCRIPTIONS } from '@/utils/constants'
import { maxInputDate } from '@/utils/functions'

const db = getFirestore(firebaseApp)

const user = ref({
  name: '',
  mail: '',
  subscriptionType: 0,
  subscriptionStartDate: null,
  subscriptionEndDate: null,
  startDate: ''
})

const createUser = async () => {
  try {
    await addDoc(collection(db, USERS), {
      name: user.value.name,
      mail: user.value.mail,
      subscriptionData: [
        {
          type: user.value.subscriptionType,
          startDate: user.value.subscriptionStartDate
            ? new Date(user.value.subscriptionStartDate + 'T00:00:00')
            : null,
          endDate: user.value.subscriptionEndDate
            ? new Date(user.value.subscriptionEndDate + 'T00:00:00')
            : null
        }
      ],
      startDate: user.value.startDate ? new Date(user.value.startDate + 'T00:00:00') : null
    })

    user.value = {
      name: '',
      mail: '',
      subscriptionType: '',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      startDate: ''
    }

    alert('User created successfully!')
  } catch (error) {
    console.error('Error creating user: ', error.message)
    alert('An error occurred while creating user.')
  }
}
</script>
