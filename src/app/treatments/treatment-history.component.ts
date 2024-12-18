import {Component, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ToastController, PopoverController, NavParams, ModalController} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {AppState} from '../app.state';
import {map} from 'rxjs/operators';
import moment from 'moment';
// import { SocialSharing } from '@ionic-native/social-sharing';
// import { Clipboard } from '@ionic-native/clipboard';
// import { File } from '@ionic-native/file';
import {Exposure} from './treatment-history.model';
import {TreatmentDataMenuComponent} from './treatment-data-menu.component';
import {latestHistory, groupTreatments, ExposureAccumulator} from "./treatment-history.reducer";
import {CommonModule} from "@angular/common";
import {MomentModule} from "ngx-moment";
import {
    IonButton,
    IonButtons,
    IonContent, IonFab,
    IonHeader,
    IonIcon, IonImg,
    IonText,
    IonTitle,
    IonToolbar
} from "@ionic/angular/standalone";
import {addIcons} from "ionicons";
import {calendar, ellipse, handLeft, download} from "ionicons/icons";
import {HeaderComponent} from "../header/header.component";


@Component({
    selector: 'app-treatment-history',
    templateUrl: './treatment-history.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MomentModule, IonToolbar, IonHeader, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonFab, HeaderComponent],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    styleUrls: ['./treatment-history.scss']
})
export class TreatmentHistoryComponent {
    groupByKey: any;
    activeKey = '';
    fullHistory = false;
    public treatmentHistory: Observable<Exposure[]>;
    public treatmentGroups?: Observable<ExposureAccumulator[]>;

    constructor(
        // private navCtrl: NavController,
        private storage: Storage,
        private store: Store<AppState>,
        // private toastCtrl: ToastController,
        // private clipboard: Clipboard,
        // private socialSharing: SocialSharing,
        // private popoverCtrl: PopoverController,
        // private modalCtrl: ModalController,
    ) {
        addIcons({calendar, handLeft, ellipse, download})
        this.treatmentHistory = store.select('treatmentHistory').pipe(latestHistory());
        this.groupBy('day');
    }

    groupBy(key: string) {
        this.groupByKey = key;
        this.treatmentGroups = this.treatmentHistory.pipe(groupTreatments(this.groupByKey));
    }

    copyData() {
        // const data = {
        //     treatments: JSON.parse(window.localStorage.getItem('treatments') || ''),
        //     treatmentHistory: JSON.parse(window.localStorage.getItem('treatmentHistory') || '')
        // };
        // this.clipboard.copy(JSON.stringify(data));
        // this.toastCtrl.create({
        //     message: "Data copied to clipboard",
        //     duration: 4000,
        //     position: 'top'
        // }).then(
        //     toast => toast.present()
        // );
    }

    exportHistory() {
        let csv = '"ID","Area","Phase","Duration","When","Photo"';
        this.treatmentHistory.subscribe(
            x => {
                let currentHistory = x.map((exposure) => {
                    let when = moment(exposure.when).format('YYYY-MM-DD');
                    let duration = Math.round(exposure.runDuration);
                    return `"${exposure.treatmentId}","${exposure.treatmentData.area}","${exposure.treatmentData.treatmentPhase}","${duration}","${when}","${exposure.image}"`;
                });
                // const dataDir = this.file.externalDataDirectory;
                // this.file.writeFile(dataDir, 'youvb.csv', csv + '\r\n' + currentHistory.join('\r\n'), { replace: true }
                // ).then((info) => {
                //     let options = {
                //         message: 'YouVB Data for ' + moment().format('DD/MM/YYYY'),
                //         subject: 'youvb-' + moment().format('YYYY-MM-DD'),
                //         files: [info.nativeURL],
                //     }
                //     this.socialSharing.share(options.message, options.subject, options.files, null)
                //         .then(r => { console.log("Sharing successful", r) })
                //         .catch(e => { console.log("Error when sharing", e) });
                // }).catch(e => { console.log("Error when writing", e) });
            },
            e => {
                console.log(e)
            },
            () => {
            }
        )
    }

    presentPopover(myEvent: Event) {
        // let popover = this.popoverCtrl.create(TreatmentDataMenu, {
        //     page: this,
        // });
        // popover.present({
        //     ev: myEvent,
        // });
    }

    showImage(exposure: Exposure) {
        // let imageModal = this.modalCtrl.create(ExposureImage, { exposure: exposure });
        // imageModal.present();
    }

    showFullHistory() {
        this.treatmentHistory = this.store.select('treatmentHistory');
        this.fullHistory = true;
        this.groupBy(this.groupByKey);
    }
}


@Component({
    imports: [CommonModule, MomentModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon,
        IonButton, IonContent, IonImg, IonText],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

    template: `
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    {{ exposure.treatmentData.area }} - {{ exposure.when | amDateFormat:'DD/MM/YYYY' }}
                </ion-title>
                <ion-buttons slot="start">
                    <ion-button  (click)="dismiss()">
                        <ion-text color="primary" showWhen="ios">Cancel</ion-text>
                        <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-img src="{{exposure.image}}"></ion-img>
        </ion-content>
    `
})
export class ExposureImageComponent {
    exposure: Exposure

    constructor(params: NavParams) {
        this.exposure = params.get('exposure')
    }

    dismiss() {
        // viewCtrl.dismiss();
    }
}
