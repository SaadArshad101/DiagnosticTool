import { Component, OnInit, OnDestroy, HostListener, ElementRef, Renderer2, ViewChild, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Rubric, Question, Answer, Theme, Diagnostic, Response, Tag, Inventory } from '../_models/http_resource';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../_services/data.service';
import { Title } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SnackbarService } from '../_services/snackbar.service';
import * as _ from 'lodash';
import { CanComponentDeactivate } from '../_services/can-deactivate-guard.service';

const socketUrl = environment.socketUrl;
import { MatDialog } from '@angular/material/dialog';
import * as Quill from 'quill';
import { MatTabChangeEvent, MatTab, MatExpansionPanel } from '@angular/material';
import { NavigationComponent } from '../navigation/navigation.component';
import { NestableComponent } from 'ngx-nestable';
import { v4 as uuid } from 'uuid';
import { UserManagementService } from '../_services/user-management.service';

@Component({
  selector: 'app-survey-designer',
  templateUrl: './theme-designer.component.html',
  styleUrls: ['./theme-designer.component.css']
})
export class ThemeDesignerComponent implements OnInit, OnDestroy, CanComponentDeactivate, AfterViewInit {
  @ViewChild('nav', {static: true}) nav: NavigationComponent;
  @ViewChildren('nestable') nestable: QueryList<NestableComponent>;
  @ViewChildren('tpanel') themePanels: QueryList<MatExpansionPanel>;
  @ViewChildren('qpanel') questionPanels: QueryList<MatExpansionPanel>;

  toolbarOptions = [
    ['bold', 'italic', 'underline' ],        // toggled buttons
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [ 'link', 'video' ],
  ];

  descriptionOptions = {
    toolbar: this.toolbarOptions,
  };

  descriptionReadonlyOptions = {
    toolbar: false
  };

  activePanel = {
    themeIndex: null,
    questionId: null
  };

  readOnlyEditorOptions = {
    readOnly: true,
    theme: 'bubble'
  };

  activeAnswer = {
    themeIndex: null,
    questionId: null,
    answerIndex: null
  };

  resourcesReadOnlyEditorOptions = {
    readOnly: true,
    theme: 'bubble',
    placeholder: 'Add question resources here'
  };

  // Set to true if someone else is already editting.
  lockedOut = false;
  readOnly = false;

  // This is for populating the skip question list
  currentQuestionList = [];

  diagnosticId;
  diagnostic: Diagnostic;
  lastCopyOfDiagnostic: Diagnostic; // Used to track if changes were saved.
  socket$;

  tagsForAutoCompletion: string[] = [];
  edittedThemes = [];
  rangeColumnNames = ['min', 'max', 'rubric-text', 'remove'];
  defaultLabels = ["People", "Process", "Technology", "Artifact"];
  questionsAdded: number = 0;
  currentTab: MatTab;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private userMgmtService: UserManagementService,
    private titleService: Title,
    private snackBarService: SnackbarService,
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Designer - IT Strategy Diagnostic Tool');
    this.diagnosticId = this.route.snapshot.paramMap.get('diagid');

    if (this.route.snapshot.routeConfig.path.substr(-7) === "preview") {
      this.readOnly = true;
      this.dataService.getTemplate(this.diagnosticId).subscribe(template => {
        if (template === null) {
          this.router.navigate(['not-found']);
          this.diagnostic = null;
        } else {
          this.diagnostic = template.diagnostic;
          this.initRoadmapAndEdittedThemes();
          this.lastCopyOfDiagnostic = _.cloneDeep(this.diagnostic);
          this.initInventory();
        }
      }, (err => {
        if (err.status === 403) {
          alert('You are not authorized to view this content.');
        } else {
          console.log(err);
        }
      }));
    } else if (this.route.snapshot.routeConfig.path.substr(-12) === "adminPreview") {
      this.readOnly = true;
      this.dataService.getDiagnostic(this.diagnosticId).subscribe(diagnostic => {
        if (diagnostic === null) {
          this.router.navigate(['not-found']);
          this.diagnostic = null;
        } else {
          this.diagnostic = diagnostic;
          // this.initRoadmapAndEdittedThemes();
          this.lastCopyOfDiagnostic = _.cloneDeep(this.diagnostic);
          this.initInventory();
        }
      }, (err => {
        if (err.status === 403) {
          alert('You are not authorized to view this content.');
        } else {
          console.log(err);
        }
      }));
    } else {
      this.dataService.getDiagnostic(this.diagnosticId).subscribe(diagnostic => {

        // Get tags
        this.dataService.getAllTags().subscribe(tags => {
          this.tagsForAutoCompletion = tags.map(tag => tag.value);
        });

        this.diagnostic = diagnostic;
        console.log(this.diagnostic);

        if (this.diagnostic === null) {
          this.router.navigate(['not-found']);
        }

        // Establish socket connection if no one is editing the diagnostic already
        if (diagnostic.lock === true && window.location.href.indexOf("http://localhost") !== 0) {
          alert('Another user is already editing this diagnostic');
          this.router.navigate(['/diagnostic/' + this.diagnosticId + '/adminPreview']);
        } else {
          this.socket$ = new WebSocketSubject(socketUrl);

          this.socket$.subscribe(response => {
            this.socket$.next(this.diagnosticId);
          });
        }

        this.initInventory();
        // this.initRoadmapAndEdittedThemes();
        this.lastCopyOfDiagnostic = _.cloneDeep(this.diagnostic);
      }, (err => {
        if (err.status === 403) {
          alert('You are not authroized to view this content.');
        } else {
          console.log(err);
        }
      }));
    }

    if (this.diagnostic && !this.diagnostic.associatedEmails) {
      this.diagnostic.associatedEmails = [];
    }
  }

  // Removes any duplicate elements from array and returns array of unique elements
  filterDuplicateItemsFromArray(arr: string[]): string[] {
    const unique = Array.from(new Set(arr));
    return unique;
  }

  initRoadmapAndEdittedThemes() {
    // Init roadmap if null
    if (this.diagnostic.roadmap == null || this.diagnostic.roadmap.length === 0)  {
      this.diagnostic.roadmap = [];

      this.diagnostic.themes.forEach(i => {
        this.diagnostic.roadmap.push(['', '', '', '']);
      });
    }

    this.diagnostic.themes.forEach(d => {
      this.edittedThemes.push(false);
    });
  }

  ngOnDestroy() {
    // Kill the socket connection
    if (this.socket$) {
      this.socket$.unsubscribe();
    }
  }

  //This is also called each time an expander is clicked
  ngAfterViewInit() {
    setTimeout(() => this.loadVisibleQuills(window.innerHeight + window.scrollY), 100);
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    this.loadVisibleQuills(window.innerHeight + window.scrollY);
  }

  tabChange(event: MatTabChangeEvent) {
    this.currentTab = event.tab;
    setTimeout(() => this.loadVisibleQuills(window.innerHeight + window.scrollY), 100);
    setTimeout(() => window.scrollTo(0, 0), 100);
  }

  isTabSelected(tabName) {
    if (this.currentTab) {
      return this.currentTab.textLabel === tabName;
    }

    return tabName === "Themes";
  }

  // Initialize inventory names
  initInventory(): void {
    if (!this.diagnostic.inventory || !this.diagnostic.inventory.length) {

      console.log("init inventory");

      this.diagnostic.inventory = [new Inventory(), new Inventory(), new Inventory(), new Inventory()];

      for (let i = 0; i < this.defaultLabels.length; i++) {
        this.diagnostic.inventory[i].name = this.defaultLabels[i];
      }
      this.dataService.updateDiagnostic(this.diagnostic);
      this.lastCopyOfDiagnostic = _.cloneDeep(this.diagnostic);
    } 
  }
  
  async loadVisibleQuills(pageHeight) {
    let thisComponent = this;

    if (pageHeight) {
      this.el.nativeElement.querySelectorAll(".quill:not(.ql-container)").forEach(element => {
        if (element.parentNode.offsetTop < pageHeight && element.parentNode.offsetWidth > 0 && element.parentNode.offsetHeight > 0) {
          let q = new Quill(element, this.getOptionsForId(element.id));
          
          q.on('text-change', function(delta, oldDelta, source) { 
            thisComponent.updateValue(element.id, (q as any).root.innerHTML);
           });

          q.clipboard.dangerouslyPasteHTML(0, this.getValueForId(element.id));
          this.styleEditor(element.querySelector(".ql-container .ql-editor"));
        }
      });
    }
  }

  // async loadVisibleNestables(pageHeight) {
  //   let thisComponent = this;
    
  //   if (pageHeight) {
      
  //   }
  // }

  async styleEditor(element) {
    if (element) {
      this.renderer.setStyle(element, "min-height", "200px");
      this.renderer.setStyle(element, "padding-bottom", "1rem");
    }
  }
  
  //Quill update callback
  async updateValue(id, value) {
    let idPts = id.split("-");
    let i = idPts[2], j = idPts[3];

    if (id.indexOf("quill-themes") === 0) {
      this.diagnostic.themes[j].questions[i].description = value;
    }

    else if (id.indexOf("quill-sc") === 0) {
      this.diagnostic.rubric[i].text = value;
    }

    else if (id.indexOf("quill-roadmap") === 0) {
      this.diagnostic.roadmap[i][j] = value;
    }
  }

  getValueForId(id) {
    let idPts = id.split("-");
    let i = idPts[2], j = idPts[3];

    if (id.indexOf("quill-themes") === 0) {
      return this.diagnostic.themes[j].questions[i].description;
    }

    else if (id.indexOf("quill-sc") === 0) {
      return this.diagnostic.rubric[i].text;
    }

    else if (id.indexOf("quill-roadmap") === 0) {
      return this.diagnostic.roadmap[i][j];
    }

    return "";
  }

  getOptionsForId(id) {
    const isStratCons = id.indexOf("quill-sc") === 0; //If false assumed to be roadmap
    let opt, idPts = id.split("-");
    let i = idPts[2], j = idPts[3];

    if (id.indexOf("quill-themes") === 0) {
      if (this.edittedThemes[j] === false) {
        // opt = this.descriptionReadOnlyEditorOptions;
      }

      else if (this.edittedThemes[j] === true) {
        opt = this.descriptionOptions;
      }

      if (opt) {
        opt["ngModel"] = this.diagnostic.themes[j].questions[i].description;
      }
    }

    else if (!this.readOnly) {
      // opt = isStratCons ? this.editorOptions : this.roadmapOptions;
    }

    else {
      // opt = this.readOnlyEditorOptions;
    }

    if (opt && !opt["ngModel"]) {
      opt["ngModel"] = isStratCons ? this.diagnostic.rubric[i].text : this.diagnostic.roadmap[i][j];
    }

    if (opt && !opt["theme"]) {
      opt["theme"] = "snow";
    }

    return opt;
  }

  getQuestions(themeIndex) { return this.diagnostic.themes[themeIndex].questions; }

  save() {
    this.updateRemovedUsers();
    console.log(this.diagnostic);
    this.dataService.updateDiagnostic(this.diagnostic);
    this.lastCopyOfDiagnostic = _.cloneDeep(this.diagnostic);
    console.log(this.diagnostic);
    this.openSnackBar('Work has been saved.');
  }

  async updateRemovedUsers() {
    let ums = this.userMgmtService, diagnosticId = this.diagnosticId;
    let oldUsers = this.getIdsForUserData(this.lastCopyOfDiagnostic.userData);
    let newUsers = this.getIdsForUserData(this.diagnostic.userData);

    this.userMgmtService.getAllUserEmailsAndNames().subscribe(s => {
      Object.values(s).forEach(function(user) {
        if (oldUsers.indexOf(user.id) >= 0 && newUsers.indexOf(user.id) < 0) {
          ums.removeDiagnosticFromUser(user.email, diagnosticId);
          console.log("remove:"); console.log(user);
        }
      });
    });
  }

  getIdsForUserData(userData) {
    return userData.map(x => x.userId);
  }

  trackByFn(index, item) {
    return index;
  }

  stopExpansion(event: Event) {
    event.stopPropagation();
  }

  stopSpaceBar(event) {
    if (event.keyCode === 32) {
      event.stopPropagation();
    }
  }

  // Adds a new zeroed out Rubric Entry
  addRubricElement() {
    this.diagnostic.rubric.push(new Rubric());

    // Setting a timeout to make sure the element exists before scrolling to it.
    setTimeout(() => {
      document.getElementById('rubric' + (this.diagnostic.rubric.length - 1)).scrollIntoView();
    }, 30);
  }

  // Removes a specified Rubric Entry
  removeRubricElement(index: number) {
    if (confirm('Are you sure you want to remove this Rubric entry?')) {
      try {
        this.diagnostic.rubric.splice(index, 1);
      } catch (e) {
        console.log(e);
      }
    }
  }

  // getRealIndex(index: number): number {
  //   let collapsed = 0;

  //   this.themePanels.toArray().forEach(panel => {
  //     if (!panel.expanded) {
  //       collapsed++;
  //     }
  //   });

  //   return index - collapsed;
  // }

  updateNestableList(themeIndex) {
    let nestable = this.nestable.toArray()[themeIndex];

    nestable.listChange.emit(this.diagnostic.themes[themeIndex].questions);
  }

  generateExtItemId(question: Question): void {
    question["$$id"] = 1000 + this.questionsAdded++;
    question["$$expanded"] = true;
  }

  // Leaving this callback in for debugging
  listChange(event) {
    //console.log(event);
  }

  addQuestionElement(themeIndex, question = new Question()) {
    const td = this;
    let oldPanels = this.questionPanels.toArray(); // Save reference to panels before addding, so we can tell which one is new

    question = JSON.parse(JSON.stringify(question));
    this.generateExtItemId(question);
    this.diagnostic.themes[themeIndex].questions.push(question);

    this.updateNestableList(themeIndex);

    // this.diagnostic.userData.forEach(userData => {
    //   if (userData.responses && userData.responses[themeIndex]) {
    //     userData.responses[themeIndex].push(new Response());
    //   }
    // });

    setTimeout(function() {
      // Loop through new set of panels and open the new question
      td.questionPanels.toArray().forEach(panel => {
        if (oldPanels.indexOf(panel) < 0) {
          panel.open();
        }
      });
    }, 100);
  }

  duplicateQuestionElement(themeIndex, q) {
    const question = JSON.parse(JSON.stringify(q));
    question.id = uuid();
    for (const answer of question.answers) {
      answer.id = uuid();
    }
    this.assignNewIdsToChildrenQuestionsAndAnswers(question);
    this.diagnostic.themes[themeIndex].questions.push(question);

    this.updateNestableList(themeIndex);
  }

  assignNewIdsToChildrenQuestionsAndAnswers(question: Question) {
    question.id = uuid();
    for (const answer of question.answers) {
      answer.id = uuid();
    }

    for (const childQuestion of question.children) {
      this.assignNewIdsToChildrenQuestionsAndAnswers(childQuestion);
    }
  }

  // Removes Question at the specified question number
  removeQuestionElement(questionId, themeIndex) {
    if (confirm('Are you sure you want to remove this question?')) {
      try {
        this.recursiveRemoveQuestion(questionId, themeIndex);
      } catch (e) {
        console.log(e);
      }
    }
  }

  selectSkipDropdown(themeIndex, question) {
    this.currentQuestionList = this.getListOfQuestionsAfterQuestion(themeIndex, question);
  }

  recursiveRemoveQuestion(questionId, themeIndex, question = null) {
    const questions = this.diagnostic.themes[themeIndex].questions;
    if (question === null) {
      if (questions.findIndex(q => q.id === questionId) !== -1) {
        this.diagnostic.themes[themeIndex].questions = this.diagnostic.themes[themeIndex].questions
          .filter(q => q.id !== questionId);
      } else {
        for (const question2 of questions) {
          this.recursiveRemoveQuestion(questionId, themeIndex, question2);
        }
      }
      return;
    } else if (question !== null) {
      if (question.children.findIndex(q => q.id === questionId) !== -1) {
        question.children = question.children.filter(q2 => q2.id !== questionId);
      } else {
        for (const child of question.children) {
          this.recursiveRemoveQuestion(questionId, themeIndex, child);
        }
      }
    }
    return;
  }

  findIdInChildren(id, question: Question) {
    return question.children.findIndex(q => q.id === id);
  }

  addAnswerOptionElement(questionId: number, themeIndex) {

    const theme = this.diagnostic.themes[themeIndex];

    let queue = theme.questions;

    while (queue.length > 0) {
      let children = [];
  
      for (const question of queue) {
        if (question['id'] === questionId) {
          if(!this.diagnostic.isHarveyBall && question.answers.length >= 3 || this.diagnostic.isHarveyBall && question.answers.length >= 5){
            confirm('Question Limit Exceeded.')
          }
          else {
            question['answers'].push(new Answer());
          }
        }

        if (question['children'].length > 0) {
          children.push(question['children']);
        }

        children = children.flat();
      }

      queue = children;
    }
  }

  // Removes a specified Answer Option
  removeAnswerOptionElement(questionId: string, answerIndex: number, themeIndex) {
    if (confirm('Are you sure you want to remove this answer option?')) {
      try {
        const question = this.diagnostic.themes[themeIndex].questions.find(q => q.id === questionId);
        question.answers.splice(answerIndex, 1);
      } catch (e) {
        console.log(e);
      }
    }
  }

  addTheme(theme = new Theme()) {
    theme = JSON.parse(JSON.stringify(theme));
    this.diagnostic.themes.push(theme);
    this.diagnostic.roadmap.push(new Array(4));

    this.edittedThemes.push(true);

    // Setting a timeout to make sure the element exists before scrolling to it.
    setTimeout(() => {
      document.getElementById('theme' + (this.diagnostic.themes.length - 1)).scrollIntoView();
    }, 30);
  }

  duplicateTheme(theme, index) {
    const newTheme = JSON.parse(JSON.stringify(theme));
    newTheme.id = uuid();
    index = index + 1;

    for (const question of newTheme.questions) {
      this.assignNewIdsToChildrenQuestionsAndAnswers(question);
    }

    this.diagnostic.themes.splice(index, 0, newTheme);
    this.diagnostic.roadmap.splice(index, 0, new Array(4));
    this.edittedThemes.splice(index, 0, true);
  }

 deleteTheme(themeIndex: number) {
    if (confirm('Are you sure you want to delete this theme?')) {
      try {
        this.diagnostic.themes.splice(themeIndex, 1);
        this.diagnostic.roadmap.splice(themeIndex, 1);

        this.edittedThemes.splice(themeIndex, 1);
      } catch (e) {
        alert('Something went wrong');
        console.log(e);
      }
    }
  }

  drop(event: CdkDragDrop<any[]>, arr, themeIndex = -1) {
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    if (themeIndex !== -1) {
      this.reorderResponses(event.previousIndex, event.currentIndex, themeIndex);
    }
  }

  // Swap all the responses
  reorderResponses(index1, index2, themeIndex) {
    this.diagnostic.userData.forEach(userData => {
      const temp = userData.responses[themeIndex][index1];
      userData.responses[themeIndex][index1] = userData.responses[themeIndex][index2];
      userData.responses[themeIndex][index2] = temp;
    });
  }

  ignoreClick(event) {
    event.stopPropagation();
  }

  openSnackBar(message: string) {
    this.snackBarService.openSnackBar(message);
  }

  // changeIsBento() {
  //   this.diagnostic.isBento = !this.diagnostic.isBento;
  // }

  // changeIsDX() {
  //   this.diagnostic.isDX = !this.diagnostic.isDX;
  // }

  // changeIsSWOTVertical() {
  //   this.diagnostic.isSWOTVertical = !this.diagnostic.isSWOTVertical;
  // }

  // changeReportHidden() {
  //   this.diagnostic.hideReport = !this.diagnostic.hideReport;
  // }

  // changeIsScorecard() {
  //   this.diagnostic.isScorecard = !this.diagnostic.isScorecard;
  // }

  // changeShowRoadmap() {
  //   this.diagnostic.showRoadmap = !this.diagnostic.showRoadmap;
  // }

  changeDiagnostic(event) {
    console.log(event);
    this.diagnostic = event;
  }

  // If a tag got removed completely from a diagnostic, remove that tag object from diagnostic.tags
  removeNonExistingTags() {
    const tagStrings = new Set<string>();

    for (const theme of this.diagnostic.themes) {
      for (const question of theme.questions) {
        for (const tag of question.tags) {
          tagStrings.add(tag['value']);
        }
      }
    }

    this.diagnostic.tags = this.diagnostic.tags.filter(tag => tagStrings.has(tag.value));
  }

  onTagAdd(event) {
    // Send tag string to backend
    const newTag = new Tag();
    newTag.value = event.display;
    this.dataService.addTag(newTag).subscribe();

    this.tagsForAutoCompletion.push(event.display);
    this.tagsForAutoCompletion = this.filterDuplicateItemsFromArray(this.tagsForAutoCompletion);

    const diagnosticTagStrings = this.diagnostic.tags.map(tag => tag.value);

    // Add the tag object to diagnostic.tags if we don't already have that tag in there.
    if (!diagnosticTagStrings.includes(newTag.value)) {
      this.diagnostic.tags.push(newTag);
    }
  }

  onTagRemove(event) {
    this.removeNonExistingTags();
  }

  getInventoryArray(){
    var inventoryArray = [];
    for (let i = 0; i < this.diagnostic.inventory.length; i++) {
      inventoryArray.push(i);
    }
    return inventoryArray;  
  }
    
  getInventoryLabel(index: number): string {
    let label = this.diagnostic.inventory[index].name;

    if (!label) {
      return this.defaultLabels[index];
    }

    return label;
  }

  hoverPanel(themeIndex: number, row): void {
    this.activePanel.themeIndex = themeIndex;
    this.activePanel.questionId = row.item.$$id;
  }

  unhoverPanel(): void {
    delete this.activePanel.themeIndex;
    delete this.activePanel.questionId;
  }

  isPanelActive(themeIndex: number, row, panel: MatExpansionPanel): boolean {
    if (panel.expanded) {
      return true;
    }

    return this.isMatchingQuestion(themeIndex, row.item.$$id, this.activePanel);
  }

  isMatchingQuestion(themeIndex: number, questionId: number, obj): boolean {
    return obj.themeIndex === themeIndex && obj.questionId === questionId;
  }

  hoverAnswer(themeIndex: number, answerIndex: number, row): void {
    this.activeAnswer.themeIndex = themeIndex;
    this.activeAnswer.questionId = row.item.$$id;
    this.activeAnswer.answerIndex = answerIndex;
  }

  unhoverAnswer(): void {
    delete this.activeAnswer.themeIndex;
    delete this.activeAnswer.questionId;
    delete this.activeAnswer.answerIndex;
  }

  isAnswerActive(themeIndex: number, answerIndex: number, row): boolean {
    const focused = document.querySelector("#ans-" + [themeIndex, answerIndex, row.item.$$id].join("-") + " .mat-focused");

    if (focused) {
      return true;
    }

    return this.isMatchingQuestion(themeIndex, row.item.$$id, this.activeAnswer) && this.activeAnswer.answerIndex === answerIndex;
  }

  getListOfQuestionsAfterQuestion(themeIndex: number, question: Question) {
    const id = question.id;
    const flatQuestionArrayOfTheme = this.flattenQuestionsArrayForTheme(this.diagnostic.themes[themeIndex]).map(obj => obj['question']);

    const indexOfCurrentQuestion = flatQuestionArrayOfTheme.findIndex(q => q.id === id);

    if (indexOfCurrentQuestion === flatQuestionArrayOfTheme.length - 1) {
      return [];
    }
    return flatQuestionArrayOfTheme.slice(indexOfCurrentQuestion + 1);
  }

  getQuestionTitle(themeIndex: number, questionId: string) {
    if (questionId === 'nextTheme') {
      return 'Next Theme';
    }

    const flatQuestionArrayOfTheme = this.flattenQuestionsArrayForTheme(this.diagnostic.themes[themeIndex]).map(obj => obj['question']);
    const question = flatQuestionArrayOfTheme.find(q => q.id === questionId);

    if (question) {
      return question.text;
    } else {
      return '';
    }
  }

  flattenQuestionsArrayForTheme(theme: Theme): Object[] {

    const flatArray = [];
    const stack = [];
    stack.push(JSON.parse(JSON.stringify(theme.questions)));

    while (stack.length > 0) {
      const topArray = stack[stack.length - 1];
      const firstElement: Question = {... topArray[0]};

      topArray.shift();

      flatArray.push({
        'question': firstElement,
        'depth': stack.length});

      if (topArray.length <= 0) {
        stack.pop();
      }

      if (firstElement && firstElement.children && firstElement.children.length > 0) {
        stack.push(firstElement.children);
      }
    }

    return flatArray;
  }

  reorderTheme(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.diagnostic.themes, event.previousIndex, event.currentIndex);
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (!_.isEqual(this.diagnostic, this.lastCopyOfDiagnostic)) {
      return false;
    } else {
      return true;
    }
  }
}
