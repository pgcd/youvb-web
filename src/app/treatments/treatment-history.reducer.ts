import {createReducer, on} from '@ngrx/store';
import {completeTreatmentRun, loadHistory} from './treatment.actions';
import {Exposure} from './treatment-history.model';
import moment from 'moment';
import {concatMap, from, groupBy, Observable, reduce, toArray} from "rxjs";
import {map, mergeMap} from "rxjs/operators";

const initialState: Exposure[] = [];

export const TreatmentHistoryReducer = createReducer(
    initialState,
    on(completeTreatmentRun, (state, {treatment, image}) => {
        const logItem = {
            treatmentData: treatment,
            when: moment().toDate(),
            runDuration: treatment.lastDoseDuration,  // A bit of denormalization
            treatmentId: treatment.id,  // See above
            image: image,
        }
        return [...state, logItem];
    }),
    on(loadHistory, (state, {history}) => history))


export const latestHistory = () => {
    return (state: Observable<Exposure[]>) => state.pipe(map(exposures =>
        exposures
            .filter(x => moment.duration(moment().diff(moment(x.when))).asDays() < 14)
            .sort((a, b) => {
                return +moment(b.when) - +moment(a.when);
            })));
}


export interface ExposureAccumulator {
    key: string,
    exposures: Exposure[],
    totalTime: number,
    totalExposures: number
}


export const groupTreatments = (key: string) => {
    return (state: Observable<Exposure[]>) => {
        return state.pipe(concatMap(t => {
            return from(t)
                .pipe(
                    groupBy(exposure => {
                        return key == 'area' ? exposure.treatmentData.area : moment(exposure.when).format('LL')
                    }),
                    mergeMap(group => group
                        .pipe(
                            reduce((acc: ExposureAccumulator, curr: Exposure) => ({
                                    totalTime: acc.totalTime + (curr.runDuration || 0),
                                    key: acc.key,
                                    exposures: [...acc.exposures, curr],
                                    totalExposures: acc.totalExposures + 1
                                }),
                                {
                                    key: group.key,
                                    exposures: [],
                                    totalTime: 0,
                                    totalExposures: 0
                                })
                        )
                    ),
                    toArray()
                )
        }))
    }
}
