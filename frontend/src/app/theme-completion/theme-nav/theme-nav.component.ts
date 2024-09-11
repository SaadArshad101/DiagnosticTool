import { Component, Input, Output, ElementRef, EventEmitter, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-theme-nav',
  templateUrl: './theme-nav.component.html',
  styleUrls: ['./theme-nav.component.css']
})
export class ThemeNavComponent {

  reportLink;
  margin = 0;
  hidePagination;
  previousTheme = '';
  numVisibleThemes = -1;

  @Input() diagnostic;

  @Output() themeIdEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() reportClickedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  setReportClicked() {
    this.reportClickedEmitter.emit(true);
    this.updateNavPosition();
  }

  setCurrentTheme(id) {
    this.themeIdEmitter.emit(id);
  }

  getCurrentTheme() {
    const currentTheme = this.getUserData().currentTheme, previousTheme = this.previousTheme;
    this.previousTheme = currentTheme;

    if (previousTheme !== '' && previousTheme !== currentTheme) {
      this.updateNavPosition();
    }

    return currentTheme;
  }

  getCurrentThemeIndex() {
    return this.diagnostic.themes.map(theme => theme.id).findIndex(id => id === this.getUserData().currentTheme);
  }

  getUserData() {
    for (const userData of this.diagnostic.userData) {
      if (userData.userId === localStorage.getItem('diagnosticUser')) {
        return userData;
      }
    }
    return null;
  }

  getRightBoundary() {
    const elLast = this.el.nativeElement.querySelector("#nav-inner-wrap>:last-child");

    return elLast.offsetLeft + elLast.offsetWidth;
  }

  clickArrow(incr) {
    let nextThemeIndex = this.getCurrentThemeIndex() + incr;

    if (nextThemeIndex >= 0 && nextThemeIndex <= this.getMaxThemeVal()) {
      let nextThemeId = this.diagnostic.themes[nextThemeIndex].id;
      this.setCurrentTheme(nextThemeId);
    }
  }

  getMaxScrollVal() {
    let totalWidth = 0, index = 0, elTheme;

    do {
      elTheme = this.el.nativeElement.querySelector(".theme-head-" + index++);

      if (elTheme) {
        totalWidth += elTheme.offsetWidth;
      }
    } while (elTheme)

    return this.el.nativeElement.querySelector("#nav-outer-wrap").offsetWidth - totalWidth;
  }

  getMaxThemeVal() {
    if (this.numVisibleThemes < 0) {
      const buttons = this.el.nativeElement.querySelectorAll(".theme-head");

      this.numVisibleThemes = buttons ? buttons.length - 1 : 0;
    }

    return this.numVisibleThemes;
  }

  setScroll(margin) {
    const min = 0, max = this.getMaxScrollVal();

    if (margin > min || this.isWholeNavVisible()) {
      margin = min;
    }

    else if (margin < max) {
      margin = max;
    }

    this.margin = margin;
  }

  getOffset(index = this.getCurrentThemeIndex()) {
    let totalOffset = 0, i = 0, width = 0;
    
    for (i; i <= index; i++) {
      width = this.el.nativeElement.querySelector(".theme-head-" + i).offsetWidth;
      totalOffset -= width;
    }

    return totalOffset + width + this.el.nativeElement.querySelector("#nav-outer-wrap").offsetWidth / 2 - width / 2;
  }

  updateNavPosition() {
    this.setScroll(this.getOffset());
  }

  isNavigationHidden(dir) {
    if (this.isWholeNavVisible()) {
      return true;
    }

    switch (dir) {
      case -1:
        return this.getCurrentThemeIndex() == 0;
      case 1:
        return this.getCurrentThemeIndex() == this.getMaxThemeVal();
    }
  }

  isWholeNavVisible() {
    return this.getMaxScrollVal() > 0;
  }

  ngAfterViewInit() {
    setTimeout(() => this.updateNavPosition(), 1);
  }
}
