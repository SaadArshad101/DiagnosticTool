import { Component, Input } from '@angular/core';
import { EditableListComponent } from '../theme-completion/swot/editable-list/editable-list.component';
import { Diagnostic, Inventory, Scorecard } from '../_models/http_resource';
import { DataService } from '../_services/data.service';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css']
})
export class ScorecardComponent {

    @Input() editable;
    @Input() scorecards;
    @Input() diagnostic;
    @Input() generatedScorecards;

    editingMaturity = false;

    constructor(
      private dataService: DataService
    ) { }

    ngOnInit() {
      if (!this.diagnostic.inventory.length) {
        this.diagnostic.inventory = [new Inventory(), new Inventory(), new Inventory(), new Inventory()];
      }

      this.initInventory(this.diagnostic.inventory);
    }
    
    initInventory(inv: Inventory[]): void {
      if (!inv[0].name) { inv[0].name = "People" }
      if (!inv[1].name) {inv[1].name = "Process" }
      if (!inv[2].name) { inv[2].name = "Technology" }
      if (!inv[3].name) { inv[3].name = "Artifact" }
    }  

    getBallForMaturity(maturity) {
      if (maturity >= 0 && maturity <= 100) {
        if(!this.diagnostic.isHarveyBall){
          return "assets/icons/harveybw" + Math.floor(maturity/ 25) + ".png";
        }
        else{
          if(this.diagnostic.isHarveyBall){
          return "assets/icons/harveybw" + Math.floor(maturity/ 25) + ".png";
          }
        }
      }
      
      return this.getBallForMaturity(0);
    }

    isSelected(i, q) {
      if (q.chosenAnswer === null) {
        return i === 0;
      }

      return q.harveyBallText[i] === q.chosenAnswer;
    }

    stripTags(html) {
      return (html || "").replace(/<[^>]*>/g, '');
    }

    save(diagnostic) {
      this.dataService.updateDiagnostic(diagnostic);
    }

    updateMaturity(capability, scorecard) {
      let index = Math.floor(capability.maturity / 25);

      this.recalculateScorecardMaturity(scorecard);

      capability.questions.forEach(q => {
        q.chosenAnswer = q.harveyBallText[index];
      });

      this.save(this.diagnostic);
    }

    recalculateScorecardMaturity(scorecard) {
      let maturity = 0;
      for (const capability of scorecard.capabilities) {
        maturity += +capability.maturity;
      }

      scorecard.maturity = maturity / scorecard.capabilities.length;
    }

    indexTracker(index: number, value: any) {
      return index;
    }

    identify(index, item) {
      return item ? item.id : index;
    }

    printDiagnostic() {

    }
}
