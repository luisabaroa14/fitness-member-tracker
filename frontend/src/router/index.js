import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CreateUserView from '@/views/CreateUserView.vue'
import UsersView from '@/views/UsersView.vue'
import EditUserView from '@/views/EditUserView.vue'
import AddPaymentView from '@/views/AddPaymentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/create-user',
      name: 'create-user',
      component: CreateUserView
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView
    },
    {
      path: '/edit-user/:id',
      component: EditUserView,
      name: 'edit-user'
    },
    {
      path: '/add-payment/:id',
      component: AddPaymentView,
      name: 'add-payment'
    }
  ]
})

export default router
