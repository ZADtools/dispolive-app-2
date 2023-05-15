import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    // {
    //     path: '/app',
    //     component: () => import('layouts/MainLayout.vue'),
    //     children:   [
    //         { path: '', component: () => import('pages/Index.vue') },
    //         { path: 'trips', name: 'trips', component: () => import('pages/Trips.vue') },
    //         { path: 'tripNow/:id', name: 'tripNow', component: () => import('pages/TripNow.vue') },
    //         { path: 'contact', name: 'contact', component: () => import('pages/Contacts.vue') },
    //         { path: 'cardreader', name: 'cardreader', component: () => import('pages/Cardreader.vue') },
    //         { path: 'messages', name: 'messages', component: () => import('pages/Messages.vue') },

    //         { path: 'desinfection', name: 'desinfection', component: () => import('pages/Desinfection.vue') },
    //         { path: 'checklistCar', name: 'checklistCar', component: () => import('pages/Caritemlist.vue'), props: { sidebar: true } },
    //         { path: 'checklistEmployee', name: 'checklistEmployee', component: () => import('pages/ChecklistEmployee.vue') },

    //         { path: 'missingData', name: 'missingData', component: () => import('pages/MissingData.vue') },
    //         { path: 'settings', name: 'settings', component: () => import('pages/Settings.vue') }
    //     ]
    // },
    // {
    //     path:       '/carlist',
    //     name:       'carlist',
    //     component:  () => import('pages/Cars.vue')
    // },
    // {
    //     path:       '/caritemlist',
    //     name:       'caritemlist',
    //     component:  () => import('pages/CaritemlistLayout.vue'),
    //     props:      { sidebar: false, disableFooter: true }
    // },
    {
        path:       '/',
        name:       'login',
        component:  () => import('pages/Login.vue')
    },
    // {
    //     path:       '/domain',
    //     name:       'domain',
    //     component:  () => import('pages/Domain.vue')
    // },
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
    }
];

export default routes;
