import '@material/mwc-button';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-snackbar';

import {Dialog} from '@material/mwc-dialog';
import {Snackbar} from '@material/mwc-snackbar';
import {TextField} from '@material/mwc-textfield';
import {resetForm, serializeForm, validateForm} from '@vdegenne/mwc-forms-util';
import {css, customElement, html, LitElement, property, query} from 'lit-element';

import {globalStyles} from './global-styles';
import {Timer, TimerElement} from './timer';


@customElement('app-container')
export class AppContainer extends LitElement {
  @property({attribute: false}) protected _timers: Timer[] = [];

  sonar = new Audio('./sonar.flac');

  @query('mwc-snackbar') snackbar: Snackbar;
  @query('#app-dialog') dialog: Dialog;
  @query('#add-timer-dialog') addTimerDialog: Dialog;

  constructor() {
    super();

    // @ts-ignore
    window.app = this;

    // load the data
    this._loadData();
  }

  public static styles = [
    globalStyles,
    css`
    :host {
      display: block;
    }

    #timers {
      margin: 20px 0;
    }
    timer-element {
      margin: 0 7px 7px 0;
    }
    `
  ];

  protected render() {
    return html`
    <div
        style="font-weight:500;display:inline-block;padding:10px;background-color:var(--mdc-theme-primary);color:white;">
      for Multi-Task Brains.</div><br>

    <div id="timers">
    ${this._timers}
    </div>

    <mwc-button icon="add" autofocus raised
        @click=${() => (this.addTimerDialog.open = true)}>
      new timer
    </mwc-button>

    <mwc-dialog id="app-dialog"
        @closing=${(e: CustomEvent) => this.onDialogClosing(e)}>
      <div class="content"></div>
      <mwc-button slot="secondaryAction" dialogAction="cancel">cancel</mwc-button>
      <mwc-button slot="primaryAction" dialogAction="accept" unelevated>ok</mwc-button>
    </mwc-dialog>

    <mwc-dialog heading="Add Timer"
        id="add-timer-dialog"
        @closing=${this._onAddTimerDialogClosing}>
      <form>
        <mwc-textfield label="Name" name="name" required dialogInitialFocus></mwc-textfield>
        <mwc-textfield label="Time" name="timestring" required
            helper="seconds or a timestring (e.g. 30s, 5m, 1h, ...)"></mwc-textfield>
      </form>
      <mwc-button slot="secondaryAction" dialogAction="close">cancel</mwc-button>
      <mwc-button slot="primaryAction" dialogAction="add"
          label="add"
          icon="add"
          trailingIcon
          unelevated></mwc-button>
    </mwc-dialog>

    <mwc-snackbar></mwc-snackbar>
    `;
  }

  public onDialogClosing(e: CustomEvent) {
    throw new Error('Method not implemented.');
  }

  protected _onAddTimerDialogClosing(e: CustomEvent) {
    if (e.detail.action === 'add') {
      const form =
          this.addTimerDialog.querySelector(':scope > form') as HTMLFormElement;
      if (!validateForm(form)) {
        this.addTimerDialog.open = true;
        return
      }

      const _timer = serializeForm(form) as Timer;
      if (this._timers.some(timer => timer.name === _timer.name)) {
        const namefield =
            (form.querySelector(':scope > mwc-textfield[name=name]') as
             TextField);
        this.openSnackbar('the name already exists');
        this.addTimerDialog.open = true;
        return;
      }

      this._addTimer(_timer);
      this._saveData();

      resetForm(form);
      form.querySelectorAll('mwc-textfield').forEach(textfield => {
        textfield.removeAttribute('required');
        textfield.reportValidity();
        setTimeout(() => textfield.setAttribute('required', ''), 1000);
      });
    }
  }

  protected _addTimer(timer: Timer) {
    const timerEl = Object.assign(new TimerElement, timer);
    this._timers.push(timerEl);
  }

  public _removeTimer(name: string) {
    const index = this._timers.findIndex(timer => timer.name === name);
    if (index >= 0) {
      this._timers.splice(index, 1);
      this._saveData();
    }
  }

  protected _loadData() {
    let timers: string|Timer[]|null = localStorage.getItem('_timers');
    if (timers !== null) {
      timers = JSON.parse(timers);
    } else {
      timers = [{name: 'timer 1', timestring: '10s'}];
    }
    (timers as Timer[]).forEach(timer => {
      this._addTimer(timer);
    })
  }

  public _saveData() {
    localStorage.setItem('_timers', JSON.stringify(this._timers));
    this.requestUpdate();
  }

  public openSnackbar(message: string) {
    this.snackbar.labelText = message;
    this.snackbar.open();
  }
}