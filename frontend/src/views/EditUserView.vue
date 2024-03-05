<template>
  <div>
    <h2>Edit User</h2>
    <form @submit.prevent="updateUser">
      <label>Name:</label>
      <input type="text" v-model="user.name" required /><br />
      <label>Email:</label>
      <input type="email" v-model="user.mail" required /><br />
      <hr />

      <!-- Subscription Data -->
      <div v-for="(subscription, index) in user.subscriptionData" :key="index">
        <label>Subscription Type:</label>
        <select v-model="subscription.type">
          <option v-for="(subscriptionType, key) in SUBSCRIPTIONS" :value="key" :key="key">
            {{ subscriptionType.name }}
          </option></select
        ><br />
        <label>Subscription Start Date:</label>
        <input
          type="date"
          :value="formattedDate(subscription.startDate)"
          @input="updateDate($event.target.value, subscription, 'startDate')"
          required
        /><br />
        <label>Subscription End Date:</label>
        <input
          type="date"
          :value="formattedDate(subscription.endDate)"
          @input="updateDate($event.target.value, subscription, 'endDate')"
        /><br />
        <button type="button" @click="removeSubscription(index)">Remove Subscription</button>
        <hr />
      </div>

      <button type="button" @click="addSubscription">Add Subscription</button>

      <button type="submit">Save Changes</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'
import { useRoute } from 'vue-router'
import { USERS, SUBSCRIPTIONS } from '@/utils/constants'

const db = getFirestore(firebaseApp)
const route = useRoute()

const userId = ref(route.params.id)
const user = ref({})

onMounted(async () => {
  try {
    const docRef = doc(db, USERS, userId.value)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      user.value = docSnap.data()
      user.value.subscriptionData.forEach((subscription) => {
        subscription.startDate = subscription.startDate?.toDate()
        subscription.endDate = subscription.endDate?.toDate()
      })
    } else {
      console.error('User not found')
    }
  } catch (error) {
    console.error('Error fetching user: ', error.message)
    alert('An error occurred while fetching user.')
  }
})

// Function to format dates
const formattedDate = (date) => {
  return date ? date.toISOString().substr(0, 10) : ''
}

// Function to update dates
const updateDate = (value, subscription, field) => {
  subscription[field] = new Date(value + 'T00:00:00')
}

const updateUser = async () => {
  try {
    const userRef = doc(db, USERS, userId.value)
    await updateDoc(userRef, user.value)
    alert('User updated successfully!')
  } catch (error) {
    console.error('Error updating user: ', error.message)
    alert('An error occurred while updating user.')
  }
}

const addSubscription = () => {
  user.value.subscriptionData.push({
    type: '',
    startDate: '',
    endDate: null
  })
}

const removeSubscription = (index) => {
  user.value.subscriptionData.splice(index, 1)
}
</script>
