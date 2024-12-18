import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'treatments',
        loadComponent: () =>
          import('../treatments/treatment-list.component').then((m) => m.TreatmentListComponent),
        pathMatch: "full"
      },
      {
        path: 'treatments',
        pathMatch: "prefix",
        loadChildren: () => import('../treatments/treatments.routes').then((m) => m.routes)
      },
      {
        path: 'history',
        loadComponent: () =>
          import('../treatments/treatment-history.component').then((m) => m.TreatmentHistoryComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('../about/about.page').then((m) => m.AboutPage),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('../contact/contact.page').then((m) => m.ContactPage),
      },
      {
        path: '',
        redirectTo: '/treatments',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/treatments',
    pathMatch: 'full',
  },
];
