import { TreatmentsReducer } from './treatments/treatment.reducer';
import { TreatmentHistoryReducer } from './treatments/treatment-history.reducer';
import { combineReducers, compose } from '@ngrx/store';
import {LocalStorageConfig, localStorageSync} from "ngrx-store-localstorage";

export function onSyncError(err: unknown) {
  console.log(err);
}

// export const storageSyncReducer = storageSync({
//   keys: ['treatments', 'treatmentHistory'],
//   ignoreActions: [        // Don't sync when these actions occur
//   ],
//   hydratedStateKey: 'hydrated', // Add this key to the state
//   onSyncError: onSyncError      // If a sync fails
// });

const productionReducer = compose(localStorageSyncReducer, combineReducers)(
    { treatments: TreatmentsReducer, treatmentHistory: TreatmentHistoryReducer }
);

export function reducer(state: any, action: any) {
    return productionReducer(state, action);
}


export function localStorageSyncConfig(): LocalStorageConfig {
  return {
    keys: ['treatments', 'treatmentHistory'], // Replace with your actual state key
    rehydrate: true,
  };
}

export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync(localStorageSyncConfig())(reducer);
}
