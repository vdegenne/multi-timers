import {css} from 'lit-element';

export const globalStyles = css`
:host {
  --mdc-theme-primary: #673ab7;
}
form {
  display: flex;
  flex-direction: column;
}
form > mwc-textfield {
  margin: 9px;
}
`