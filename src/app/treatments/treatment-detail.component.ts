import {Component, CUSTOM_ELEMENTS_SCHEMA, NgZone} from '@angular/core';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonText,
    IonTitle,
    IonToolbar,
    ToastController
} from '@ionic/angular/standalone';
import {AppState} from '../app.state';
import {getTreatment, Treatment, updateTreatmentOnStart} from './treatment.model';
import {Store} from '@ngrx/store';
import {Observable, Subscription, timeInterval, timer} from 'rxjs';
import {completeTreatmentRun, TreatmentActions} from './treatment.actions';
import moment from 'moment';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";

import {LocalNotifications} from '@capacitor/local-notifications';
import {CommonModule} from "@angular/common";
import {Exposure} from "./treatment-history.model";
import {MomentModule} from "ngx-moment";
import {addIcons} from "ionicons";
import {cameraOutline, create, warning} from "ionicons/icons";
import {HeaderComponent} from "../header/header.component";
import {Camera, CameraResultType, ImageOptions, Photo} from "@capacitor/camera";
import {Directory, Filesystem} from "@capacitor/filesystem";

@Component({
    selector: 'app-treatment-detail',
    templateUrl: './treatment-detail.html',
    imports: [CommonModule, MomentModule, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonButton, IonList, IonListHeader, IonItem, RouterLink, IonChip, HeaderComponent, IonText, IonLabel],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    styleUrls: ['./treatment-detail.scss']
})
export class TreatmentDetailComponent {
    public currentStatus = '';
    photosEnabled = false;  // temporary flag, until photos are good to go
    treatmentTimerRefresh!: Subscription;
    treatmentRunEnd!: Date;
    second!: number;
    fullRun!: number;
    treatmentName!: string;
    tempImage?: Photo;
    treatment!: Treatment;
    public history?: Observable<Exposure[]>;
    use_notifications: boolean = false;

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private treatmentActions: TreatmentActions,
        public zone: NgZone,
        public toastCtrl: ToastController,
        private activatedRoute: ActivatedRoute,
    ) {
        addIcons({create, cameraOutline, warning})
    }

    ionViewWillEnter() {
        this.activatedRoute.params.subscribe((params) => {
            this.store.select(getTreatment(parseInt(params['id'])))
                .subscribe((item) => {
                    const initial_treatment: Treatment = item!;
                    if (!initial_treatment) {
                        this.router.navigate(['/treatments']);
                        return
                    }
                    const treatment = updateTreatmentOnStart(initial_treatment);
                    this.showChanges(initial_treatment, treatment);
                    this.history = this.store.select(state =>
                        state.treatmentHistory.filter(item => item.treatmentId === treatment.id)
                            .toSorted((a, b) => {return a.when > b.when ? -1 : 1}));
                    const tname = (treatment.area || '').toLowerCase();
                    this.treatmentName = tname.charAt(0).toUpperCase() + tname.slice(1);
                    this.fullRun = Number(treatment.nextDoseDuration);
                    this.treatment = treatment;
                    this.second = this.fullRun;
                    this.currentStatus = 'ready';
                });
        });
        this.checkNotifications();
    }

    ionViewWillLeave() {
        console.log('View leaving treatment ', this.treatment, ' with status', this.currentStatus)
        if (this.currentStatus == 'done' || this.currentStatus == 'completed') {
            // LocalNotifications.clear(this.treatment.id);
            // if (this.tempImage) {
            //     const dirName = this.tempImage.substr(0, this.tempImage.lastIndexOf('/'));
            //     const fileName = this.tempImage.substr(this.tempImage.lastIndexOf('/') + 1);
            //     Filesystem.stat(dirName, fileName).then((exists) => {
            //         if (exists) {
            //             Filesystem.deleteFile(dirName, fileName);
            //         }
            //     }).catch(() => {
            //     })
            // }

        }
    }

    editTreatment(treatment: Treatment) {
        this.router.navigate(['/treatments/', treatment.id, 'edit']);
    }

    runTimer() {
        switch (this.currentStatus) {
            case 'done':
            case 'completed':
                break;
            case 'running':
                this.currentStatus = 'paused';
                this.stopTimer();
                break;
            case 'paused':
            case 'ready':
                this.currentStatus = 'running';
                let time = new Date();
                this.treatmentRunEnd = new Date(time.getTime() + this.second * 1000);
                console.log('starting run for treatment', this.treatment, 'for', this.second, "at ", time, "; end at", this.treatmentRunEnd);
                this.treatmentTimerRefresh = timer(0, 500).pipe(
                    timeInterval()
                ).subscribe(x => {
                    this.refreshStatus(x)
                });
        }
    }

    private endRun() {
        {
            console.log('end run at second', this.second, this.currentStatus);
            this.currentStatus = 'done';
            LocalNotifications.schedule({
                notifications: [
                    {
                        id: this.treatment.id,
                        title: this.treatment.area + ' completed',
                        body: '',
                        sound: 'file://assets/timerdone.wav',
                        // icon: 'file://assets/icon/notification_icon.png',
                        smallIcon: 'res://ic_notification_icon_large',
                    }
                ]
            })
            this.completeRun();
        }
    }

    stopTimer() {
        this.treatmentTimerRefresh.unsubscribe();
        console.log('stop received at second', this.second, this.currentStatus);
    }

    refreshStatus(t: any) {
        this.second -= t.interval / 1000;
        if (this.second < 0.5) {
            this.endRun();
        } else {
            this.currentStatus = 'running';
        }
    }

    completeRun() {
        this.currentStatus = 'completed';
        this.second = 0;
        this.stopTimer();
        this.treatment = Object.assign({}, this.treatment, {lastDoseDuration: this.fullRun})
        let image = this.saveTempImage()
        this.store.dispatch(completeTreatmentRun({treatment: this.treatment, image: image}));
        console.log('complete run at second', this.second, 'of', this.fullRun, this.currentStatus);
        this.zone.run(() => {
        });
    }

    showChanges(original: Treatment, updated: Treatment) {
        let messages = [];
        if (!original.nextDoseDuration || !updated.nextDoseDuration) {
            console.log('Durations missing', original.nextDoseDuration, updated.nextDoseDuration)
            return
        }
        if (original.nextDoseDuration < updated.nextDoseDuration) {
            messages.push("Exposure increased");
        } else if (original.nextDoseDuration > updated.nextDoseDuration) {
            messages.push("Exposure decreased");
            if (original.treatmentPhase != updated.treatmentPhase) {
                messages.push('Treatment phase changed to "' + updated.treatmentPhase + '"');
            }
        }
        if (messages.length) {
            this.showToast(messages.join('\n<br />'));
        }
    }

    private showToast(message: string) {
        this.toastCtrl.create({
            message: message,
            duration: 4000,
            position: 'middle'
        }).then(toast => {
            console.log('toast created with message ', message);
            toast.present()
        });
    }

    takePicture() {
        const options: ImageOptions = {
            quality: 100,
            resultType: CameraResultType.Base64,
            correctOrientation: true
        }
        Camera.getPhoto(options).then((photo: Photo) => {
            console.log("photo received", photo)
            this.tempImage = photo;
        }, (err) => {
            console.log("photo error", err)
        });
    }

    checkNotifications() {
         LocalNotifications.checkPermissions().then((d) => {this.use_notifications = d.display == 'granted'})
    }

    allowNotifications() {
        LocalNotifications.requestPermissions().then((d) => {this.use_notifications = d.display == 'granted'})
    }

    private saveTempImage() {
        console.log("saving image", this.tempImage);
        let path: string = '';
        if (this.tempImage) {
            const newFileName = this.treatment.id + ' - ' + encodeURI(this.treatment.area!) + ' - ' + moment().format('YYYYMMDDTHHmmss') + '.jpg';
            savePicture(this.tempImage, newFileName).then((result) => {
                path = result.filepath;
                this.toastCtrl.create({
                    message: 'Before-treatment image saved as ' + path,
                    duration: 4000,
                    position: 'top'
                }).then(toast => toast.present);
            })
            // Filesystem.rename(
            //     {
            //         from: this.tempImage.path!,
            //         to: 'YouVB/' + newFileName,
            //         directory: '',
            //         toDirectory: ''
            //     }
            //     )
            //     .then((info) => {
            //         this.store.dispatch(this.treatmentActions.completeTreatmentRun({
            //             treatment: this.treatment,
            //             image: info.nativeURL
            //         }));
            //         let toast = this.toastCtrl.create({
            //             message: 'Before-treatment image saved as ' + info.nativeURL, duration: 4000,
            //             dismissOnPageChange: false, position: 'top'
            //         });
            //         toast.present();
            //     })
            //     .catch((error) => {
            //         console.log("Error moving picture to definitive storage", error);
            //     })
        }
        return path;
    }
}


async function savePicture(photo: Photo, fileName: string) {
    console.log("Saving", photo)
    const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: photo.base64String!,
        directory: Directory.Data,
    });

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
        filepath: fileName,
        webviewPath: photo.webPath,
    };
}

// export async function base64FromPath(path: string): Promise<string> {
//     const response = await fetch(path);
//     const blob = await response.blob();
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onerror = reject;
//         reader.onload = () => {
//             if (typeof reader.result === 'string') {
//                 resolve(reader.result);
//             } else {
//                 reject('method did not return a string');
//             }
//         };
//         reader.readAsDataURL(blob);
//     });
// }
