<template>
  <div>
    <LogoIcon />
    <div class="center-item">
      <h2>Edit User</h2>
      <form @submit.prevent="updateUserData">
        <label>Name:</label>
        <input class="w-100 mb-1" type="text" v-model="user.name" required /><br />
        <label>Email:</label>
        <input class="w-100 mb-1" type="email" v-model="user.mail" required /><br />
        <hr class="mb-1" />

        <!-- Subscription Data -->
        <div v-for="(subscription, index) in user.subscriptionData" :key="index">
          <label>Subscription Type:</label>
          <select class="w-100 mb-1" v-model="subscription.type">
            <option v-for="(subscriptionType, key) in SUBSCRIPTIONS" :value="key" :key="key">
              {{ subscriptionType.name }}
            </option></select
          ><br />
          <label>Subscription Start Date:</label>
          <input
            class="w-100 mb-1"
            type="date"
            :value="formattedDate(subscription.startDate)"
            @input="updateDate($event.target.value, subscription, 'startDate')"
            :max="maxInputDate()"
            required
          /><br />
          <label>Subscription End Date:</label>
          <input
            class="w-100 mb-1"
            type="date"
            :value="formattedDate(subscription.endDate)"
            @input="updateDate($event.target.value, subscription, 'endDate')"
            :max="maxInputDate()"
          /><br />
          <button class="w-100" type="button" @click="removeSubscription(index)">
            Remove Subscription
          </button>
          <hr class="mb-1" />
        </div>

        <button class="w-100" type="button" @click="addSubscription">Add Subscription</button>

        <button class="w-100" type="submit">Save Changes</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUser, updateUser } from '@/services/firestore/usersService'
import { useRoute } from 'vue-router'
import { SUBSCRIPTIONS } from '@/utils/constants'
import { maxInputDate } from '@/utils/functions'
import LogoIcon from '@/components/LogoIcon.vue'

const route = useRoute()

const userId = ref(route.params.id)
const user = ref({})

onMounted(async () => {
  try {
    const response = await getUser(userId.value)

    if (response) {
      user.value = response.data()
      user.value.subscriptionData.forEach((subscription) => {
        subscription.startDate = subscription.startDate?.toDate() ?? null
        subscription.endDate = subscription.endDate?.toDate() ?? null
      })
    } else {
      alert('User not found.')
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

const updateUserData = async () => {
  try {
    await updateUser(user.value, userId.value)
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
