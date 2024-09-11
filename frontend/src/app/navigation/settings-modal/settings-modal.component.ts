import {
  Component,
  OnInit,
  Inject,
  ViewChildren,
  QueryList,
  EventEmitter,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "src/app/_services/data.service";
import { UserManagementService } from "src/app/_services/user-management.service";
import {
  User,
  Diagnostic,
  UserDiagnosticData,
} from "src/app/_models/http_resource";
import { Router } from "@angular/router";
import { RegisterComponent } from "src/app/register/register.component";

@Component({
  selector: "app-settings-modal",
  templateUrl: "./settings-modal.component.html",
  styleUrls: ["./settings-modal.component.css"],
})
export class SettingsModalComponent {
  @ViewChildren("usr") forms: QueryList<RegisterComponent>;

  userRows: any[] = [1];
  myUserId: string;
  emails: Set<string> = new Set<string>();
  isAdmin: boolean;
  existingUsers;
  allUsers: Map<string, object> = new Map<string, object>();
  userData;
  accountsDict;

  constructor(
    public dialogRef: MatDialogRef<SettingsModalComponent>,
    public dataService: DataService,
    private userMgmtService: UserManagementService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataService
      .getUser(localStorage.getItem("diagnosticUser"))
      .subscribe((user) => {
        this.isAdmin =
          user.role === "Admin" ||
          user.role === "Designer" ||
          user.role === "Taker";
        this.myUserId = user.id;
      });

    this.updateExistingUsers(data.diagnostic.userData);

    this.userMgmtService.getAllUserEmailsAndNames().subscribe((s) => {
      Object.values(s).forEach((u) => {
        this.allUsers.set(u.id, u);
      });
    });

    this.accountsDict = JSON.parse(localStorage.getItem("accountsDict"));
  }

  close() {
    this.dialogRef.close(this.data.diagnostic);
  }

  addListItem() {
    this.userRows.push(this.userRows.length + 1);
  }

  removeListItem(index) {
    this.userRows[index] = false;
  }

  updateExistingUsers(userData) {
    this.existingUsers = userData.map((x) => x.userId);
    this.userData = userData;
  }

  removeUser(userId: string): void {
    let removeIndex = null;

    this.dataService
      .getDiagnostic(this.data.diagnostic.id)
      .subscribe((diagnostic) => {
        if (this.userData) {
          diagnostic.userData = this.userData;
        }

        for (
          let i = 0;
          i < diagnostic.userData.length && removeIndex === null;
          i++
        ) {
          if (diagnostic.userData[i].userId === userId) {
            removeIndex = i;
          }
        }

        diagnostic.userData.splice(removeIndex, 1);
        this.updateExistingUsers(diagnostic.userData);
      });
  }

  isLastRow(row: number, length: number = this.userRows.length): boolean {
    //If the last row has been deleted ignore it
    if (length > 0 && this.userRows[length - 1] === false) {
      return this.isLastRow(row, length - 1);
    }

    return row === length || length <= 0;
  }

  addUsers(): void {
    const newUsers: Map<string, UserDiagnosticData> = new Map<
      string,
      UserDiagnosticData
    >();
    const onAdd: EventEmitter<number> = new EventEmitter<number>();
    let errors = false,
      added = 0,
      components = this.forms.toArray();

    onAdd.subscribe((s) => {
      //After all users have been added to the system, attach them to the diagnostic
      if (s === components.length) {
        console.log("is addusers happening");
        this.addUsersToDiagnostic(newUsers);
      }
    });

    components.forEach((form) => {
      let addUser = form.onSubmit();

      if (addUser) {
        addUser.subscribe(
          (s) => {
            if (s) {
              this.userMgmtService.addDiagnosticToUser(
                form.registerForm.value.email,
                this.data.diagnostic.id
              );
              newUsers.set(s.id, this.createUserData(s.id));
              onAdd.emit(++added);
            }
          },
          (err) => {
            // User already exists
            let email = form.registerForm.value.email;

            if (email) {
              this.dataService.getAllUsers().subscribe((users) => {
                users.forEach((user2) => {
                  if (email.toUpperCase() === user2.email.toUpperCase()) {
                    newUsers.set(user2.id, this.createUserData(user2.id));
                    onAdd.emit(++added);
                  }
                });
              });
            }
          }
        );
      } else {
        errors = true;
        console.error("Add user failed");
        console.error(addUser);
        console.error(form);
      }

      if (!errors && this.hasErrors(form.f)) {
        errors = true;
      }
    });

    // this.data.emailsEmitter.emit();

    if (!errors) {
      this.close();
    }
  }

  createUserData(
    userId,
    udd: UserDiagnosticData = new UserDiagnosticData()
  ): UserDiagnosticData {
    udd.userId = userId;

    return udd;
  }

  hasErrors(f): boolean {
    if (f) {
      let errors = false;

      Object.values(f).forEach((input) => {
        if (input && input["errors"]) {
          Object.values(input["errors"]).forEach((errVal) => {
            if (errVal === true) {
              errors = true;
            }
          });
        }
      });

      return errors;
    }

    return true;
  }

  addUsersToDiagnostic(userMap: Map<string, UserDiagnosticData>): void {
    console.log("add users to diagnostic");
    this.dataService
      .getDiagnostic(this.data.diagnostic.id)
      .subscribe((diagnostic) => {
        Array.from(userMap.keys()).forEach((userId) => {
          diagnostic.userData.push(userMap.get(userId));
        });

        this.dataService.updateDiagnostic(diagnostic);
      });
  }

  isLoggedIn(email: string): boolean {
    if (!this.accountsDict) {
      return false;
    }

    return !!this.accountsDict[email];
  }
}
