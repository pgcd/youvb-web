import {bootstrapApplication} from '@angular/platform-browser';
import {RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules} from '@angular/router';
import {IonicRouteStrategy, provideIonicAngular} from '@ionic/angular/standalone';

import {routes} from './app/app.routes';
import {AppComponent} from './app/app.component';
import {ActionReducerMap, MetaReducer, provideState, provideStore} from "@ngrx/store";
import {TreatmentActions} from "./app/treatments/treatment.actions";
import {TreatmentsReducer} from "./app/treatments/treatment.reducer";
import {TreatmentHistoryReducer} from "./app/treatments/treatment-history.reducer";
import {Drivers} from "@ionic/storage"
import {IonicStorageModule, Storage} from '@ionic/storage-angular';
import {enableProdMode, importProvidersFrom} from "@angular/core";
import {localStorageSyncReducer, reducer} from "./app/app.reducer";
import {AppState} from "./app/app.state";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const reducers: ActionReducerMap<AppState> = {
  treatments: TreatmentsReducer,
  treatmentHistory: TreatmentHistoryReducer
};

const metaReducers: Array<MetaReducer<AppState, any>> = [localStorageSyncReducer];


import { defineCustomElements } from '@ionic/pwa-elements/loader';
import {environment} from "./environments/environment";
// Call the element loader before the bootstrapModule/bootstrapApplication call
defineCustomElements(window);

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideIonicAngular({
            mode: 'md',
            innerHTMLTemplatesEnabled: true,
        }),
        provideStore(reducers, {metaReducers}),
        importProvidersFrom(
            IonicStorageModule.forRoot({
                name: "youvb",
                driverOrder: [Drivers.LocalStorage]
            }),
            // EffectsModule.forRoot([StorageSyncEffects]),
        ),
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        provideRouter(routes, withPreloading(PreloadAllModules)),
        TreatmentActions, provideAnimationsAsync(),
    ],
});
