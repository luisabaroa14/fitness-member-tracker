<template>
  <div>
    <h2>Users</h2>
    <table style="width: 100%">
      <thead>
        <tr>
          <!-- <th>Id</th> -->
          <th>Name</th>
          <th>Email</th>
          <th>Start Date</th>
          <th>Subscriptions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <!-- <td>{{ user.id }}</td> -->
          <td>{{ user.name }}</td>
          <td>{{ user.mail }}</td>
          <td>{{ user.startDate }}</td>
          <td>
            <ul v-if="user.subscriptionData.length > 0">
              <li v-for="(subscription, index) in user.subscriptionData" :key="index">
                <p>Type: {{ SUBSCRIPTIONS[subscription.type].name }}</p>
                <p>
                  Start Date: {{ subscription.startDate?.toDateString() || 'No date provided' }}
                </p>
                <p>End Date: {{ subscription.endDate?.toDateString() || 'No date provided' }}</p>
              </li>
            </ul>
            <span v-else>No subscriptions</span>
          </td>
          <router-link :to="{ name: 'edit-user', params: { id: user.id } }"> Edit </router-link>
          <router-link :to="{ name: 'add-payment', params: { id: user.id } }">
            Add payment
          </router-link>
          <router-link :to="{ name: 'user-payments', params: { id: user.id } }">
            View payments
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
import { USERS, SUBSCRIPTIONS } from '@/utils/constants'

const db = getFirestore(firebaseApp)

const users = ref([])

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS))
    querySnapshot.forEach((doc) => {
      const user = doc.data()
      user.subscriptionData.forEach((subscription) => {
        subscription.startDate = subscription.startDate?.toDate()
        subscription.endDate = subscription.endDate?.toDate()
      })
      users.value.push({ id: doc.id, ...user })
    })
  } catch (error) {
    console.error('Error fetching users: ', error.message)
    alert('An error occurred while fetching users.')
  }
})
</script>
