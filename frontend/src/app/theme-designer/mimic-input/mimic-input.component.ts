import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mimic-input',
  templateUrl: './mimic-input.component.html',
  styleUrls: ['./mimic-input.component.css']
})
export class MimicInputComponent implements OnInit {

  @Input() labelName;
  @Input() isEmpty;
  @Input() content;

  constructor() { }

  ngOnInit() {
  }

}
