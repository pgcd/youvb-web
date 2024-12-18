import {Routes} from '@angular/router';
import {TreatmentListComponent} from './treatment-list.component';

export const routes: Routes = [
    {
        path: '',
        component: TreatmentListComponent,
        pathMatch: "full",
    },
    {
        path: '',
        pathMatch: "prefix",
        children: [
            {
                path: 'history',
                loadComponent: () =>
                    import('../treatments/treatment-history.component').then((m) => m.TreatmentHistoryComponent),
                pathMatch: "full",
            },
            {
                path: 'new',
                loadComponent: () =>
                    import('../treatments/treatment-form.component').then((m) => m.TreatmentFormComponent),
                pathMatch: "full",
            },
            {
                path: ':id/edit',
                loadComponent: () =>
                    import('../treatments/treatment-form.component').then((m) => m.TreatmentFormComponent),
                pathMatch: "full",
            },
            {
                path: ':id/data',
                loadComponent: () =>
                    import('./treatment-data-menu.component').then((m) => m.TreatmentDataMenuComponent),
                pathMatch: "full",
            },
            {
                path: ':id',
                loadComponent: () =>
                    import('../treatments/treatment-detail.component').then((m) => m.TreatmentDetailComponent),
                pathMatch: "full",
            },
        ]
    }
];
