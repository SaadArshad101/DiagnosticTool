import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-template-card',
  templateUrl: './template-card.component.html',
  styleUrls: ['./template-card.component.css']
})
export class TemplateCardComponent implements OnInit {

  @Input() title;
  @Input() subtitle;

  constructor() { }

  ngOnInit() {
  }

}
