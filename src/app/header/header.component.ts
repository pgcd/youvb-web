import {Component, CUSTOM_ELEMENTS_SCHEMA, Input} from '@angular/core';

import {IonBackButton, IonButtons, IonIcon, IonLabel, IonTitle, IonToolbar} from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonLabel,
    IonIcon
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeaderComponent {
  @Input({required: true}) public pageTitle!: string;

  constructor() { }

}
