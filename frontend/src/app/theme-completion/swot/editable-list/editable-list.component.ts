import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-editable-list',
  templateUrl: './editable-list.component.html',
  styleUrls: ['./editable-list.component.css'],
})

export class EditableListComponent {

  @Output() notify: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Input() list: string[];
  @Input() title: string;
  currentText: string;

  OnInit() {
    this.currentText = '';
  }

  addListItem() {
    // Do not allow strings with only whitespace to be pushed
    if (!/^\s*$/.test(this.currentText)) {
      this.list.push(this.currentText);
    }
    this.currentText = '';
    this.notify.emit(this.list);
  }

  removeListItem(newItem: string) {
    this.list.splice(this.list.indexOf(newItem), 1);
    this.notify.emit(this.list);
  }

  ignoreArrowKeys(event) {
    if (event.keyCode === 37 || event.keyCode === 39) {
      event.stopPropagation();
    }
  }

}
