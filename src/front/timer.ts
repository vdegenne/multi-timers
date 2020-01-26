import '@material/mwc-icon';

import {css, customElement, html, LitElement, property} from 'lit-element';
import * as stringy from 'stringytime';
import {AppContainer} from './app';

export declare interface Timer {
  name: string;
  timestring: string;
}

declare let app: AppContainer;


@customElement('timer-element')
export class TimerElement extends LitElement {
  /** Name of the timer */
  @property() name: string = 'no title';

  /** The time from where the countdown starts */
  @property() timestring: string = '5m';

  /** Is the countdown running or not */
  @property({type: Boolean}) protected active = false;

  /** value memory of remaining seconds */
  @property({attribute: false}) protected _remaining: number;

  /** Used to decrement the timer when active */
  protected _interval: NodeJS.Timeout|undefined;

  /** When the countdown is terminated it is set to true */
  @property({type: Boolean, reflect: true}) notified = false;

  constructor() {
    super();
    this.addEventListener('mouseenter', () => {
      this.notified = false;
    });
    this.addEventListener('click', () => {
      this.notified = false;
    });
  }


  public static styles = [css`
    :host {
      display: inline-block;
      background-color: #212121;
      color: white;
      border-radius: 1px;
      padding: 5px;
      box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, .5);
      min-width: 130px;
      max-width: 400px;
    }

    :host([notified]) {
      background-color: #ffeb3b;
      color: black;
    }
    :host([notified]) header {
      border-bottom: 1px solid black;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* background-color: red; */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-bottom: 3px;
      border-bottom: 1px solid white;
    }
    header mwc-icon {
      cursor: pointer;
      user-select: none;
      vertical-align: bottom;
      font-size: 20px;
    }

    #name {
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 4px;
    }

    #controls {
      display: flex;
      /* flex-shrink: 1; */
      margin: 0 0 0 7px;
    }

    #feedback {
      padding: 12px 7px;
      /* background-color: green; */
      text-align: center;
      font-weight: 900;
    }
  `];

  protected render() {
    return html`
    <div id="base">
      <header>
        <div id="name">${this.name}</div>
        <div id="controls">
          <mwc-icon @click=${this._togglePlay} style="vertical-align:bottom">
            ${!this.active ? 'play_arrow' : 'stop'}
          </mwc-icon>
          <mwc-icon style="vertical-align:bottom" @click=${
        this._delete}>close</mwc-icon>
        </div>
      </header>
      <div id="feedback">
        ${!this.active ? this.timestring : this._remaining}
      </div>
    </div>`;
  }

  protected _togglePlay() {
    if (!this.active) {
      this._remaining = this.initialTimeSeconds;
      this._interval = setInterval(() => {
        if (--this._remaining === 0) {
          this._notify();
          this._togglePlay();
        }
      }, 1000);
      this.active = true;
    } else {
      this.active = false;
      clearInterval(this._interval as NodeJS.Timeout);
      this._interval = undefined;
    }
  }

  protected _notify() {
    this.notified = true;
    app.sonar.play();
  }

  protected _delete() {
    app.dialog.heading = 'Confirmation';
    app.dialog.querySelector('.content')!.innerHTML = `
    Are you sure you want to delete "${this.name}" ?
    `;

    app.onDialogClosing = (e: CustomEvent) => {
      if (e.detail.action === 'accept') {
        app._removeTimer(this.name);
      }
    };
    app.dialog.open = true;
  }


  protected get initialTimeSeconds() {
    let milliseconds;
    if (parseInt(this.timestring).toString() === this.timestring) {
      this.timestring += 's';
      app._saveData();
    }

    milliseconds = stringy.toMilliseconds(this.timestring);
    return milliseconds / 1000;  // using seconds
  }

  toJSON() {
    return {name: this.name, timestring: this.timestring};
  }
}