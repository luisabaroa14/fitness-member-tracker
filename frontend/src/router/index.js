import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CreateUserView from '@/views/CreateUserView.vue'
import UsersView from '@/views/UsersView.vue'
import EditUserView from '@/views/EditUserView.vue'
import AddPaymentView from '@/views/AddPaymentView.vue'
import AddClassView from '@/views/AddClassView.vue'
import LogInView from '@/views/LogInView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { isAuthenticated } from '@/utils/loginStatus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: LogInView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/create-user',
      name: 'create-user',
      component: CreateUserView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/edit-user/:id',
      name: 'edit-user',
      component: EditUserView,
      meta: { requiresAuth: true }
    },
    {
      path: '/add-payment/:id',
      name: 'add-payment',
      component: AddPaymentView,
      meta: { requiresAuth: true }
    },
    {
      path: '/add-class/:id',
      name: 'add-class',
      component: AddClassView,
      meta: { requiresAuth: true }
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: NotFoundView,
      meta: { requiresAuth: true }
    },
    // Catch-all route for any other routes that are not found
    {
      path: '/:catchAll(.*)',
      redirect: '/not-found' 
    }
  ]
})

// Navigation guard to check if the route requires authentication
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && isAuthenticated() === false) {
    next('/login')
  } else {
    // Proceed to the requested route
    next()
  }
})

export default router
