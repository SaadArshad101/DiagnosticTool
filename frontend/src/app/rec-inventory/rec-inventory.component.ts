import {
  Component,
  OnInit,
  Input,
  ElementRef,
  HostListener,
  Renderer2,
  EventEmitter,
} from "@angular/core";
import {
  Diagnostic,
  Inventory,
  Recommendation,
} from "../_models/http_resource";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: "app-rec-inventory",
  templateUrl: "./rec-inventory.component.html",
  styleUrls: ["./rec-inventory.component.css"],
})
export class RecInventoryComponent implements OnInit {
  @Input() diagnostic: Diagnostic;
  @Input() tabs: boolean;

  currentIndex: number = 0; // Current tab/inventory index
  expandThreshold: number;
  numberOfTabsAllowed = 7;

  blankRecommendations: Recommendation[] = [];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (!this.diagnostic.inventory.length) {
      this.diagnostic.inventory = [
        new Inventory(),
        new Inventory(),
        new Inventory(),
        new Inventory(),
      ];
    }

    for (let i = 0; i < this.numberOfTabsAllowed; i++) {
      this.blankRecommendations.push(new Recommendation());
    }

    if (typeof this.diagnostic.processLabel === "undefined") {
      this.diagnostic.processLabel = "Process";
    }

    this.initInventory(this.diagnostic.inventory);
    setTimeout(() => this.onResize(), 100);
  }

  // Initialize inventory names
  initInventory(inv: Inventory[]): void {
    if (!inv[0].name) {
      inv[0].name = "People";
    }
    if (!inv[1].name) {
      inv[1].name = "Process";
    }
    if (!inv[2].name) {
      inv[2].name = "Technology";
    }
    if (!inv[3].name) {
      inv[3].name = "Artifact";
    }
  }

  listPriorities(): string[] {
    return ["Low", "Medium", "High"];
  }

  listCCP(): string[] {
    const ids: Set<string> = new Set<string>();

    this.diagnostic.themes.forEach(function (theme) {
      if (!isNaN(+theme.coreProcessId) && theme.coreProcessId !== "") {
        ids.add(theme.coreProcessId);
      }
    });

    if (!Array.from(ids).length) {
      for (let i = 1; i <= this.diagnostic.themes.length; i++) {
        ids.add(i.toString());
      }
    }

    return Array.from(ids);
  }

  getBallForMaturity(maturity): string {
    if (maturity >= 0 && maturity <= 100) {
      return "assets/icons/harveybw" + Math.floor(maturity / 25) + ".png";
    }

    console.warn("Unexpected maturity: " + maturity);

    return this.getBallForMaturity(0);
  }

  getCurrentInventory(): Inventory {
    return this.diagnostic.inventory[this.currentIndex];
  }

  submitRecommendation(invIndex: number): void {
    this.diagnostic.inventory[invIndex].recommendations = [
      this.blankRecommendations[invIndex],
    ];
    this.blankRecommendations[invIndex] = new Recommendation();
  }

  generateRecommendation(
    inv: Inventory = this.getCurrentInventory(),
    rec: Recommendation = new Recommendation()
  ): Recommendation {
    rec.recommendationId = this.generateId(inv);

    return rec;
  }

  generateId(inv: Inventory): string {
    let maxId = inv.recommendations.length + 1;

    inv.recommendations.forEach(function (rec) {
      let id = Number(rec.recommendationId);

      if (!isNaN(id) && id >= maxId) {
        maxId = id + 1;
      }
    });

    return maxId.toString();
  }

  insertRowAfter(
    index: number,
    inv: Inventory = this.getCurrentInventory()
  ): Recommendation[] {
    return inv.recommendations.splice(
      index + 1,
      0,
      this.generateRecommendation(inv)
    );
  }

  removeRow(
    index: number,
    inv: Inventory = this.getCurrentInventory()
  ): Recommendation[] {
    return inv.recommendations.splice(index, 1);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.getCurrentInventory().recommendations,
      event.previousIndex,
      event.currentIndex
    );
  }

  addTab(): void {
    if (this.diagnostic.inventory.length < this.numberOfTabsAllowed) {
      const inv = new Inventory();
      inv.name = "New Tab";
      this.diagnostic.inventory.push(inv);
      this.currentIndex = this.diagnostic.inventory.length - 1;
    } else {
      alert(`Only ${this.numberOfTabsAllowed} tabs are allowed`);
    }
  }

  deleteTab(index: number): void {
    if (confirm("Are you sure you want to delete this tab?")) {
      if (index >= this.diagnostic.inventory.length - 1) {
        this.currentIndex = index - 1;
      }

      this.diagnostic.inventory.splice(index, 1)
    }
  }

  tabChange(event: MatTabChangeEvent) {
    // Store current inventory based on selected tab
    this.currentIndex = event.index;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event?) {
    if (this.tabs) {
      const container = this.el.nativeElement.parentNode;
      const contentList = this.el.nativeElement.querySelectorAll(
        ".mat-tab-body-content"
      );

      if (contentList && contentList.length) {
        const content = contentList[this.currentIndex];

        // If there's a scrollbar on recommendation inventory content remove fluid layout
        if (content.scrollWidth > content.clientWidth) {
          this.renderer.removeClass(container, "row");
          this.expandThreshold = window.innerWidth;
        }

        // Restore fluid layout if window is expanded
        else if (
          this.expandThreshold &&
          window.innerWidth >= this.expandThreshold
        ) {
          this.renderer.addClass(container, "row");
          delete this.expandThreshold;
        }
      }
    }
  }
}
