import {
  Component,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import { DataService } from "../_services/data.service";
import { isLoweredSymbol } from "@angular/compiler";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.css"],
})
export class EditComponent {
  @Input() disable: boolean; //If this evaluates to true, this component will be treated like an ordinary div
  @Input() richText: boolean;
  @Input() textarea: boolean;
  @Input() placeholder;
  @Input() callback;
  @Input() params;
  @Input() dataModel;
  @Input() bulletsOnly;
  @Input() before; // Noneditable text to put before text value
  @Input() after; // Noneditable text to put after text value
  @Output() dataModelChange = new EventEmitter<string>();

  editing: boolean = false;
  showPen: boolean = false;
  visible: boolean = false; //Flag to make the active editor visible
  temp = this.dataModel || ""; //Store value for cancel option

  readOnlyEditorOptions = {
    toolbar: false,
  };

  noBorder = {
    border: "none",
  };

  editModeEditorOptions = {
    toolbar: [
      ["bold", "italic", "underline"], // toggled buttons
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
    ],
  };

  bulletOnlyOptions = {
    toolbar: [
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ size: ["small", false, "large", "huge"] }],
    ],
  };

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private dataService: DataService
  ) {}

  clickEditor() {
    if (!this.disable) {
      if (!this.editing) {
        this.temp = this.dataModel;
      }
      console.log("DataModel: ", this.dataModel);

      let editor = this,
        w = this.el.nativeElement.querySelector(".inactive").offsetWidth;
      this.editing = true;
      this.unhover();

      //Make width of active editor match width of inactive container
      setTimeout(function () {
        editor.visible = true;
      }, 100);
    }
  }

  ignoreClick(event) {
    event.stopPropagation();
  }

  deactivate(event) {
    //Editor clicked - ignore
    if (
      event &&
      event.relatedTarget &&
      event.relatedTarget.className.indexOf("ql") >= 0
    ) {
      return;
    }

    this.editing = false;
    this.visible = false;

    //Cancel button clicked
    if (
      event &&
      event.relatedTarget &&
      event.relatedTarget.innerText === "Cancel"
    ) {
      this.dataModel = this.temp;
    }

    //All other click events
    else if (this.callback) {
      if (this.params && Array.isArray(this.params)) {
        this.callback.apply(this.params);
      } else {
        this.callback(this.params);
      }
    }
  }

  // Stop space and enter key presses from triggering parent component
  ignoreArrowKeys(event) {
    if (event.keyCode === 32 || event.keyCode === 13) {
      event.stopPropagation();
    }
  }

  hover() {
    if (!this.disable) {
      this.showPen = true;
    }
  }

  unhover() {
    this.showPen = false;
  }

  getVisibility() {
    return this.visible ? "visible" : "hidden";
  }

  ulToArray(ul) {
    let arr = [];

    ul.querySelectorAll("li").forEach((element) => {
      arr.push(element.innerHTML);
    });

    return arr;
  }

  arrayToUl(value) {
    console.log(value);

    if (typeof value === "string" || value === null) {
      return value;
    }

    let ul = "<ul>";

    value.array.forEach((element) => {
      ul += "<li>" + element + "</li>";
    });

    return ul + "</ul>";
  }

  setFocus(editor) {
    console.log(editor);
    editor.focus();
  }
}
