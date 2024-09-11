import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/_models/http_resource';
import { DataService } from '../../_services/data.service';

@Component({
  selector: 'app-template-bank',
  templateUrl: './template-bank.component.html',
  styleUrls: ['../dashboard.component.css']
})
export class TemplateBankComponent implements OnInit {

  newlyAddedDiagnostic = null;
  file = null;
  templates;

  constructor(
    public dialogRef: MatDialogRef<TemplateBankComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    public dataService: DataService
    ) { }

  ngOnInit() {
    this.dataService.getAllTemplates().subscribe(templates => {
      this.templates = templates;
    });
  }

  close() {
    this.dialogRef.close();
  }

  importFromTemplate(template) {
    this.dataService.addDiagnostic(this.data, template.diagnostic).subscribe(diagnostic2 => {
      this.data.diagnostics.push(diagnostic2.id);
      this.dataService.updateUser(this.data);

      this.close();
    });
  }
}
