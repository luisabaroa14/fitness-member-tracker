<template>
  <div>
    <h2>Users List</h2>
    <table style="width: 100%">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Start Date</th>
          <th>Subscriptions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.mail }}</td>
          <td>{{ user.startDate }}</td>
          <td>
            <ul v-if="user.subscriptionData.length > 0">
              <li v-for="(subscription, index) in user.subscriptionData" :key="index">
                <p>Type: {{ subscription.type }}</p>
                <p>Start Date: {{ subscription.startDate }}</p>
                <p>End Date: {{ subscription.endDate }}</p>
              </li>
            </ul>
            <span v-else>No subscriptions</span>
          </td>
          <router-link :to="{ name: 'edit-user', params: { id: user.id } }"> Edit </router-link>
          <router-link :to="{ name: 'add-payment', params: { id: user.id } }">
            Add payment
          </router-link>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, getFirestore } from 'firebase/firestore'
import firebaseApp from '@/utils/firebase'
import { USERS } from '@/utils/constants'

const db = getFirestore(firebaseApp)

const users = ref([])

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS))
    querySnapshot.forEach((doc) => {
      users.value.push({ id: doc.id, ...doc.data() })
    })
  } catch (error) {
    console.error('Error fetching users: ', error.message)
    alert('An error occurred while fetching users.')
  }
})
</script>
