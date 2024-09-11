import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserDiagnosticData } from 'src/app/_models/http_resource';

@Component({
  selector: 'app-diagnostic-notes-modal',
  templateUrl: './diagnostic-notes-modal.component.html',
  styleUrls: ['./diagnostic-notes-modal.component.css']
})
export class DiagnosticNotesModalComponent implements OnInit, OnDestroy {

  toolbarOptions = [
    ['bold', 'italic', 'underline' ],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [ 'link' ],
  ];

  editorOptions = {
    toolbar: this.toolbarOptions
  };

  constructor(
    public dialogRef: MatDialogRef<DiagnosticNotesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data, //data has diagnostic and diagnosticNotes fields
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close(this.data.diagnosticNotes);
  }

  ngOnDestroy() {
    this.close();
  }

  focusEditor(editor) {
    editor.focus();
  }
}
