import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Diagnostic } from 'src/app/_models/http_resource';

@Component({
  selector: 'app-swot',
  templateUrl: './swot.component.html',
  styleUrls: ['./swot.component.css'],

})

export class SwotComponent {

  @Input() diagnostic;
  @Output() swotEmitter: EventEmitter<Diagnostic> = new EventEmitter<Diagnostic>();

  sChange(list: string[]) {
    this.removeNewLineCharFromList(list);
    console.log(this.removeNewLineCharFromList(list));
    this.getUserData().swot.strengths = list;
    this.swotEmitter.emit(this.diagnostic);
  }

  wChange(list: string[]) {
    this.removeNewLineCharFromList(list);
    this.getUserData().swot.weaknesses = list;
    this.swotEmitter.emit(this.diagnostic);
  }

  oChange(list: string[]) {
    this.removeNewLineCharFromList(list);
    this.getUserData().swot.opportunities = list;
    this.swotEmitter.emit(this.diagnostic);
  }

  tChange(list: string[]) {
    this.removeNewLineCharFromList(list);
    this.getUserData().swot.threats = list;
    this.swotEmitter.emit(this.diagnostic);
  }

  removeNewLineCharFromList(list) {
    for (let i = 0; i < list.length; i++) {
      list[i] = list[i].replace(/(\r\n|\n|\r)/gm, '');
    }
    return list;
  }

  getUserData() {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem('diagnosticUser')) {
        return userData;
      }
    }
    return null;
  }
}
