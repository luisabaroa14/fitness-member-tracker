<template>
  <div>
    <LogoIcon />
    <div class="center-item">
      <h2>Create User</h2>
      <form @submit.prevent="createUser">
        <label>Name:</label>
        <input class="w-100 mb-1" type="text" v-model="user.name" required /><br />
        <label>Email:</label>
        <input class="w-100 mb-1" type="email" v-model="user.mail" required /><br />

        <!-- Subscription Data -->
        <label>Subscription Type:</label>
        <select class="w-100 mb-1" v-model="user.subscriptionType">
          <option v-for="(subscription, key) in SUBSCRIPTIONS" :value="key" :key="key">
            {{ subscription.name }}
          </option>
        </select>
        <br />

        <label>Subscription Start Date:</label>
        <input
          class="w-100 mb-1"
          type="date"
          v-model="user.subscriptionStartDate"
          :max="maxInputDate()"
          required
        /><br />
        <label>Subscription End Date:</label>
        <input
          class="w-100 mb-1"
          type="date"
          v-model="user.subscriptionEndDate"
          :max="maxInputDate()"
        /><br />

        <label>Start Date:</label>
        <input
          class="w-100 mb-1"
          type="date"
          v-model="user.startDate"
          :max="maxInputDate()"
          required
        /><br />

        <button class="w-100" type="submit">Create User</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addUser } from '@/services/firestore/usersService'
import { SUBSCRIPTIONS } from '@/utils/constants'
import { maxInputDate } from '@/utils/functions'
import LogoIcon from '@/components/LogoIcon.vue'

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
    await addUser(user.value)

    // Clear form
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
