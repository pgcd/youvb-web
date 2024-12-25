import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Store} from '@ngrx/store';
import {concatMap, Observable, scan} from 'rxjs';
import {AppState} from '../app.state';
import {Treatment} from './treatment.model';
import {map} from 'rxjs/operators';
import moment from 'moment';
import {CommonModule} from "@angular/common";
import {MomentModule} from "ngx-moment";
import {
    AlertController,
    IonAlert,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonText,
    IonTitle,
    IonToolbar,
    PopoverController
} from "@ionic/angular/standalone";
import {Router, RouterLink} from "@angular/router";
import {TreatmentDataMenuComponent} from "./treatment-data-menu.component";
import {HeaderComponent} from "../header/header.component";
import {HowTo} from "../about/howTo";
// import { Clipboard } from '@ionic-native/clipboard';
// import { File } from '@ionic-native/file';

interface PlanningData {
    todayTime?: string,
    todaySeconds: number,
    todayExposures: number,
    lateExposures: number,
}

@Component({
    selector: 'app-treatments-list',
    templateUrl: './treatment-list.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MomentModule, IonHeader, IonContent, IonFab, IonList, IonTitle, IonButtons, IonIcon,
        IonItem, IonToolbar, IonFabButton, IonButton, RouterLink, IonLabel, HeaderComponent, IonCard, IonCardHeader, IonCardContent, IonText, IonAlert],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TreatmentListComponent {
    public treatments: Observable<Treatment[]>;
    public planningData: PlanningData = {
        todayExposures: 0,
        todaySeconds: 0,
        lateExposures: 0
    };

    constructor(
        private router: Router,
        private store: Store<AppState>,
        // private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        // private clipboard: Clipboard,
        // private file: File,
        private popoverCtrl: PopoverController,
    ) {
        // treatments are currently sorted by nextDose, so that the more urgent is always on top
        let tmp1 = this.store
            .select(state => state.treatments || []);
        let tmp2 = tmp1
            .pipe(
                map(
                    treatments => treatments.toSorted((a, b) => {
                        return +(moment(a.nextDose) || moment().add(1, 'd')) - +(moment(b.nextDose) || moment().add(1, 'd'));
                    })
                )
            );

        this.treatments = tmp2

        this.treatments
            .pipe(
                concatMap(t => t),
                scan((data: PlanningData, t: Treatment, i) => {
                        const today = moment().startOf('day');
                        const nextDose = moment(t.nextDose);
                        const toDo = today <= nextDose && nextDose < today.add(1, 'd');
                        data.todayExposures = data.todayExposures += toDo ? 1 : 0;
                        data.todaySeconds = data.todaySeconds += toDo ? +t.nextDoseDuration : 0;
                        data.lateExposures = data.lateExposures += today.diff(nextDose, 'd', false) > 6 ? 1 : 0
                        return data;
                    }, {todayExposures: 0, lateExposures: 0, todaySeconds: 0}
                ))
            .subscribe(d => {
                console.log(d)
                this.planningData = d;
                this.planningData.todayTime = moment.unix(d.todaySeconds).format('mm:ss')
            });


    }

    newTreatment() {
        this.router.navigate(['/treatments/new', {}]);
    }

    editTreatment(treatment: Treatment) {
        this.router.navigate(['/treatments/', treatment.id, 'edit']);
    }

    openTreatment(treatment: Treatment) {
        this.router.navigate(['/treatments/', treatment.id,]);
    }

    treatmentPhaseClass(treatment: Treatment) {
        return 'treatment-phase-' + treatment.treatmentPhase;
    }

    treatmentIsLate(treatment: Treatment) {
        return moment().diff(moment(treatment.nextDose), 'd', false);
    }

    treatmentIsLateClass(treatment: Treatment) {
        return (this.treatmentIsLate(treatment) > 1) ? 'treatment-is-late' : 'treatment-is-future';
    }

    goToHistory() {
        this.router.navigate(['treatments', 'history']);
    }

    async treatmentDataPopover(e: Event) {
        const popover = await this.popoverCtrl.create({
            component: TreatmentDataMenuComponent,
            event: e,
            reference: "trigger"
        });

        await popover.present();

        const {role} = await popover.onDidDismiss();
        console.log(`Popover dismissed with role: ${role}`);

    }

    protected readonly HowTo = HowTo;
}
