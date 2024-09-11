import { DataService } from "../_services/data.service";
import { Title } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../_models/http_resource";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  user: User;
  currentUser: string = "";
  currentTab = "Diagnostics";
  isAdmin = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit() {
    try {
      this.currentUser = localStorage.getItem("diagnosticUser");

      if (!this.currentUser) {
        this.router.navigate(["/login"]);
      }

      this.titleService.setTitle("Dashboard - IT Strategy Diagnostic Tool");

      this.dataService.getUser(this.currentUser).subscribe((user) => {
        this.user = user;

        if (this.user.role === "Admin") {
          this.isAdmin = true;
        }
      });
    } catch (e) {
      console.log(e);
      this.router.navigate(["not-authenticated"]);
    }
  }
}
