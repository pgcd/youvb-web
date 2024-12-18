import {Component, CUSTOM_ELEMENTS_SCHEMA, Input} from '@angular/core';
import {
    ToastController,
    ModalController,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons, IonIcon, IonButton, IonContent, IonText, IonList, IonItem
} from '@ionic/angular/standalone';
import { rehydrateApplicationState } from 'ngrx-store-localstorage';
// import { File } from '@ionic-native/file';


@Component({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonIcon,
        IonButton,
        IonContent,
        IonText
    ],
    template: `
        <ion-header>
            <ion-toolbar>
                <ion-title>
                    Select data to import
                </ion-title>
                <ion-buttons slot="start">
                    <ion-button (click)="close()">
                        <ion-text color="primary" showWhen="ios">Cancel</ion-text>
                        <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <form novalidate>
                <input type="file">
            </form>
        </ion-content>
    `
})
export class OpenFileModalComponent {
    constructor(
        private viewCtrl: ModalController,
    ) { }

    close() {
        this.viewCtrl.dismiss();
    }
}


@Component({
    templateUrl: './treatment-data-menu.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IonList,
        IonItem,
        IonIcon,
        IonContent
    ],
    standalone: true
})
export class TreatmentDataMenuComponent {
    @Input() public page!: string;

    constructor(
        private viewCtrl: ModalController,
        // private file: File,
        private toastCtrl: ToastController,
        private modalCtrl: ModalController,
    ) {

    }

    close() {
        this.viewCtrl.dismiss();
    }


    saveData() {
        // let toast, data = {
        //     treatments: JSON.parse(window.localStorage.getItem('treatments')),
        // };
        // const dataDir = this.file.externalDataDirectory;
        // this.file.writeFile(dataDir, 'youvb.json', JSON.stringify(data), { replace: true }).then(info => {
        //     toast = this.toastCtrl.create({ message: "Configuration saved to file " + info.nativeURL, duration: 4000, dismissOnPageChange: false, position: 'top' });
        //     toast.present();
        // })
    }

    loadData() {
        // let toast, data = {
        //     treatments: JSON.parse(window.localStorage.getItem('treatments')),
        //     treatmentHistory: JSON.parse(window.localStorage.getItem('treatmentHistory'))
        // };
        // if (data.treatments) {
        //     let res = rehydrateApplicationState(['treatments', 'treatmentHistory'], window.localStorage, key=>key);
        //     console.log(res);
        //     toast = this.toastCtrl.create({ message: "Data found in LocalStorage", duration: 4000, dismissOnPageChange: false, position: 'bottom' });
        //     toast.present();
        // }
        // let modal = this.modalCtrl.create(OpenFileModal);
        // modal.present();
    }
}
