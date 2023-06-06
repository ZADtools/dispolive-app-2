import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/app',
        component: () => import('layouts/MainLayout.vue'),
        children:   [
            //{ path: '', component: () => import('pages/Index.vue') },
            { path: 'fahrberichte', name: 'fahrberichte', component: () => import('pages/Fahrberichte.vue') },
            { path: 'fahrberichtactiv/:id', name: 'fahrberichtactiv', component: () => import('pages/FahrberichtActiv.vue') },
            { path: 'contact', name: 'contact', component: () => import('pages/Contacts.vue') },
            { path: 'cardreader', name: 'cardreader', component: () => import('pages/Cardreader.vue') },
            { path: 'messenger', name: 'messenger', component: () => import('pages/Messenger.vue') },

            { path: 'desinfection', name: 'desinfection', component: () => import('pages/Desinfection.vue') },
            { path: 'inventarIn', name: 'inventarIn', component: () => import('pages/Inventar.vue'), props: { inApp: true } },
            { path: 'dienstplan', name: 'dienstplan', component: () => import('pages/Dienstplan.vue') },
            { path: 'missingData', name: 'missingData', component: () => import('pages/Missingdata.vue') },
            { path: 'settings', name: 'settings', component: () => import('pages/Settings.vue') }
        ]
    },
    {
        path:       '/carlist',
        name:       'carlist',
        component:  () => import('pages/Cars.vue')
    },
    {
        path:       '/inventar',
        name:       'inventar',
        component:  () => import('pages/Inventar.vue'),
        props:      { sidebar: false, disableFooter: true }
    },
    {
        path:       '/',
        name:       'login',
        component:  () => import('pages/Login.vue')
    },
    {
        path:       '/domain',
        name:       'domain',
        component:  () => import('pages/Domain.vue')
    },
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
    }
];

export default routes;
