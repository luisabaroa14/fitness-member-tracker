<template>
  <div>
    <h2>Create User</h2>
    <form @submit.prevent="createUser">
      <label>Name:</label>
      <input type="text" v-model="name" required /><br />
      <label>Mail:</label>
      <input type="text" v-model="mail" required /><br />
      <label>Subscription Type:</label>
      <input type="text" v-model="subscriptionType" required /><br />
      <label>Subscription Start Date:</label>
      <input type="date" v-model="subscriptionStartDate" required /><br />
      <label>Subscription End Date:</label>
      <input type="date" v-model="subscriptionEndDate" /><br />
      <label>Start Date:</label>
      <input type="date" v-model="startDate" required /><br />
      <button type="submit">Create User</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { collection, addDoc, getFirestore } from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'

const db = getFirestore(firebaseApp)

const name = ref('')
const mail = ref('')
const subscriptionType = ref('')
const subscriptionStartDate = ref('')
const subscriptionEndDate = ref(null)
const startDate = ref('')

const createUser = async () => {
  try {
    await addDoc(collection(db, 'users'), {
      name: name.value,
      mail: mail.value,
      subscriptionData: [
        {
          type: subscriptionType.value,
          startDate: subscriptionStartDate.value,
          endDate: subscriptionEndDate.value
        }
      ],
      startDate: startDate.value,
    })

    // Clear the form fields after successful user creation
    name.value = ''
    mail.value = ''
    subscriptionType.value = ''
    subscriptionStartDate.value = ''
    subscriptionEndDate.value = ''
    startDate.value = ''

    alert('User created successfully!')
  } catch (error) {
    console.error('Error creating user: ', error.message)
    alert('An error occurred while creating user.')
  }
}
</script>
