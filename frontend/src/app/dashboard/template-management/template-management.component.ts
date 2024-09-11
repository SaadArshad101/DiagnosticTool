import { Component, OnInit } from '@angular/core';
import { DataService } from '../../_services/data.service';
import { Template, Diagnostic } from '../../_models/http_resource';
import { DiagnosticSerializer } from '../../_services/serializer';

@Component({
  selector: 'app-template-management',
  templateUrl: './template-management.component.html',
  styleUrls: ['../dashboard.component.css']
})
export class TemplateManagementComponent implements OnInit {

  file;
  templates;

  math = Math;
  // These are paginator variables: https://ng-bootstrap.github.io/#/components/pagination/api
  currentPage = 1;
  pageSize = 25;
  maxSize = 10;
  filteredElements = [];
  searchText = '';

  // returns an array of fields that we want to search over
  getFilteredElements(): string[] {
    const example = new Template();

    return Object.getOwnPropertyNames(example).filter(field => {
      return ( field !== 'title' && field !== 'subtitle');
    });
  }

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
    // For filter
    this.filteredElements = this.getFilteredElements();

    this.dataService.getAllTemplates().subscribe(templates => {
      this.templates = templates;
    });
  }

  onFileChanged(event) {
    this.file = event.target.files[0];

    this.addTemplate();
  }

  addTemplate() {
    let newTemplate = new Template();

    const reader = new FileReader();
    reader.readAsText(this.file);

    reader.onloadend = (e) => {
      newTemplate = this.dataService.convertDiagnosticToTemplate(
        DiagnosticSerializer.fromJson(JSON.parse(String(reader.result))) as Diagnostic);

      this.dataService.addTemplate(newTemplate).subscribe(template => {
        this.templates.push(JSON.parse(JSON.stringify(template)));
      });
    };
  }

  deleteTemplate(template) {
    if (confirm('Are you sure you want to delete this Template?')) {
      try {
        this.dataService.deleteTemplate(template.id).subscribe(s => {
          this.templates = this.templates.filter(aTemplate => aTemplate.id !== template.id);
        });
      } catch (e) {
        alert("Something went wrong");
        console.log(e);
      }
    }
  }
}
