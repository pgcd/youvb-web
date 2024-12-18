import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import {createEffect} from '@ngrx/effects';
import {ActionReducer} from '@ngrx/store';
import {defer, from, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

const STORAGE_KEY = 'NSIS_APP_STATE';

const storage = new Storage({});

// get/setNested inspired by
// https://github.com/mickhansen/dottie.js
function getNested(obj: any, path: string): any {
    if (obj !== null && path) {
        // Recurse into the object.
        const parts = path.split('.').reverse();
        while (obj != null && parts.length) {
            let idx = parts.pop();
            if (idx == undefined) {
                throw new Error('Unexpected undefined index')
            }
            obj = obj[idx];
        }
    }
    return obj;
}

function setNested(obj: any, path: string, value: any): any {
    if (obj != null && path) {
        let pieces = path.split('.'),
            current = obj,
            piece, i,
            length = pieces.length;

        for (i = 0; i < length; i++) {
            piece = pieces[i];
            if (i === length - 1) {
                current[piece] = value;
            } else if (!current[piece]) {
                current[piece] = {};
            }
            current = current[piece];
        }
    }

    return obj;
}

function fetchState(): Promise<{}> {
    console.log('Fetching state');
    return storage
        .get(STORAGE_KEY)
        .then(s => s || {})
        .catch(err => {
        });
}

function saveState(state: any, keys: string[]): Promise<void> {
    // Pull out the portion of the state to save.
    if (keys) {
        state = keys.reduce((acc, k) => {
            const val = getNested(state, k);
            if (val) {
                setNested(acc, k, val);
            }
            return acc;
        }, {})
    }
    console.log('Saving state: ', state);
    return storage.set(STORAGE_KEY, state);
}

export const StorageSyncActions = {
    HYDRATED: 'NSIS_APP_HYDRATED'
}

@Injectable()
export class StorageSyncEffects {

    hydrate$: Observable<any> = createEffect(() => {
            return defer(() => {
                    return from(fetchState()).pipe(
                        map(state => ({
                            type: StorageSyncActions.HYDRATED,
                            payload: state
                        })),
                        catchError(e => {
                            console.warn(`error fetching data from store for hydration: ${e}`);

                            return of({
                                type: StorageSyncActions.HYDRATED,
                                payload: {}
                            });
                        })
                    );
                }
            );
        }
    )
}

export interface StorageSyncOptions {
    keys?: string[];
    ignoreActions?: string[];
    hydratedStateKey?: string;
    onSyncError?: (err: any) => void;
}

const defaultOptions: StorageSyncOptions = {
    keys: [],
    ignoreActions: [],
    onSyncError: (err) => {
    }
}

export function storageSync(options?: StorageSyncOptions) {
    // const {keys, ignoreActions, hydratedStateKey, onSyncError} = Object.assign({}, defaultOptions, options || {});
    options = options || {};
    const keys = options.keys || defaultOptions.keys || [];
    const ignoreActions = options.ignoreActions || defaultOptions.ignoreActions || [];
    const hydratedStateKey = options.hydratedStateKey || defaultOptions.hydratedStateKey;
    const onSyncError = options.onSyncError || defaultOptions.onSyncError || ((err) => {
    });

    ignoreActions.push(StorageSyncActions.HYDRATED);
    ignoreActions.push('@ngrx/store/init');
    ignoreActions.push('@ngrx/effects/init');
    ignoreActions.push('@ngrx/store/update-reducers');

    const hydratedState: any = {};

    return function storageSyncReducer(reducer: ActionReducer<any>) {
        return (state: any, action: any) => {
            const {type, payload} = action;

            if (type === StorageSyncActions.HYDRATED) {
                state = Object.assign({}, state, payload);
                if (hydratedStateKey) {
                    hydratedState[hydratedStateKey] = true;
                }
            }

            const nextState = Object.assign({}, reducer(state, action), hydratedState);

            if (ignoreActions.indexOf(type) === -1) {
                saveState(nextState, keys).catch(err => onSyncError(err));
            }

            return nextState;
        }
    }
}
