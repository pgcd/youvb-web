import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonIcon, IonItem, IonList, IonTitle, IonToolbar} from '@ionic/angular/standalone';
import {HeaderComponent} from "../header/header.component";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, IonList, IonItem, IonIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContactPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
