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
      <input type="date" v-model="user.subscriptionStartDate" required /><br />
      <label>Subscription End Date:</label>
      <input type="date" v-model="user.subscriptionEndDate" /><br />

      <label>Start Date:</label>
      <input type="date" v-model="user.startDate" required /><br />

      <button type="submit">Create User</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { collection, addDoc, getFirestore } from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'
import { USERS, SUBSCRIPTIONS } from '@/utils/constants'

const db = getFirestore(firebaseApp)

const user = ref({
  name: '',
  mail: '',
  subscriptionType: 0,
  subscriptionStartDate: '',
  subscriptionEndDate: null,
  startDate: ''
})

const createUser = async () => {
  try {
    await addDoc(collection(db, 'users'), {
      name: user.value.name,
      mail: user.value.mail,
      subscriptionData: [
        {
          type: user.value.subscriptionType,
          startDate: user.value.subscriptionStartDate,
          endDate: user.value.subscriptionEndDate
        }
      ],
      startDate: user.value.startDate
    })

    user.value = {
      name: '',
      mail: '',
      subscriptionType: '',
      subscriptionStartDate: '',
      subscriptionEndDate: '',
      startDate: '',
      payDate: ''
    }

    alert('User created successfully!')
  } catch (error) {
    console.error('Error creating user: ', error.message)
    alert('An error occurred while creating user.')
  }
}
</script>
