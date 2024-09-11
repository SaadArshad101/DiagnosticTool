import { Component, OnInit, Input } from '@angular/core';
import { RecInventoryComponent } from '../rec-inventory/rec-inventory.component';
import { Diagnostic, UserDiagnosticData } from '../_models/http_resource';
import { AnalyticsService } from '../_services/analytics.service';
import { ResponseService } from '../_services/response.service';

@Component({
  selector: 'app-impl-roadmap',
  templateUrl: './impl-roadmap.component.html',
  styleUrls: ['./impl-roadmap.component.css']
})
export class ImplRoadmapComponent implements OnInit {
  @Input() recInv: RecInventoryComponent;
  @Input() diagnostic: Diagnostic;
  @Input() enableCurLvl: boolean;
  @Input() agg: boolean; // Aggregated results implementation

  percentages: number[];
  flattenedQuestionMap;
  disabledQuestions;

  constructor(
    private analyticsService: AnalyticsService,
    private responseService: ResponseService
  ) { };

  ngOnInit() {
    // Diagnostic variable can be passed either directly or through the Recommendations Inventory reference
    if (this.recInv && !this.diagnostic) {
      this.diagnostic = this.recInv.diagnostic;
    }

    this.flattenedQuestionMap = this.responseService.getFlattenQuestionsMap(this.diagnostic);
    this.disabledQuestions = this.responseService.getDisabledQuestions(this.diagnostic, this.flattenedQuestionMap, this.getUserData());

    if (!this.diagnostic.inventoryLabels || !this.diagnostic.inventoryLabels.length) {
      this.diagnostic.inventoryLabels = ["Weak", "", "", "", "Strong"];
    }
    
    if (this.enableCurLvl) {
      if (this.agg) {
        this.percentages = this.analyticsService.getThemeAverages(this.diagnostic, this.flattenedQuestionMap);
      } else {
        const userDataPromise = new Promise<UserDiagnosticData>((resolve, reject) => {
          resolve(this.getUserData());
        });

        userDataPromise.then(userData => {
          this.percentages = this.analyticsService.getThemePercentagesOfUser(this.diagnostic, userData, this.flattenedQuestionMap);
        });
      }
    }
  }

  getPercent(themeIndex: number): number {
    if (this.percentages && this.percentages.length) {
      return +this.percentages[themeIndex];
    }

    return 0;
  }

  getUserData(): UserDiagnosticData {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem('diagnosticUser')) {
        return userData;
      }
    }
    return null;
  }
}
