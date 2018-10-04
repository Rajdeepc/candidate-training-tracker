import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import FindStatus from './components/FindStatus.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
        path: '/dashboard/:username',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: '/findall/:username',
        name: 'findall',
        component: FindStatus
    }
  ]
})