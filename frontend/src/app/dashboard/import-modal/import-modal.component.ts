import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ExcelService } from "src/app/_services/excel.service";
import { DataService } from "src/app/_services/data.service";
import { User, Diagnostic } from "src/app/_models/http_resource";
import { DiagnosticSerializer } from "src/app/_services/serializer";
import { Router } from "@angular/router";

@Component({
  selector: "app-import-modal",
  templateUrl: "./import-modal.component.html",
  styleUrls: ["../dashboard.component.css"],
})
export class ImportModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ImportModalComponent>,
    public excelService: ExcelService,
    public dataService: DataService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) {}

  close() {
    this.dialogRef.close();
  }

  onExcelFileChanged(event) {
    this.excelService
      .importFromXLSX(event.target.files[0])
      .then((diagnostic) => {
        this.dataService.addDiagnostic(this.user, diagnostic).subscribe((d) => {
          this.user.diagnostics.push(d.id);
          // this.diagnostics.push(d);
          this.dataService.updateUser(this.user);
          this.close();
        });
      });
  }

  onJsonFileChanged(event) {
    let file = event.target.files[0];

    if (file === null || file.type !== "application/json") {
      alert("Invalid File Type");
    } else {
      const reader = new FileReader();
      reader.readAsText(file);
      file = null;

      reader.onloadend = (e) => {
        const diagnostic = DiagnosticSerializer.fromJson(
          JSON.parse(String(reader.result))
        ) as Diagnostic;
        console.log(diagnostic);
        this.dataService.addDiagnostic(this.user, diagnostic).subscribe(
          (diagnostic2) => {
            this.user.diagnostics.push(diagnostic2.id);
            this.dataService.updateUser(this.user);
            this.close();
          },
          (err) => {
            if (err.status === 404) {
              alert("This resource was not found");
            } else if (err.status === 403) {
              this.router.navigate(["not-authorized"]);
            } else {
              return err.status;
            }
          }
        );
      };
    }
  }
}
