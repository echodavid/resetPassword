import './style.css';
import { Login } from './Login.js';
import { Forgot } from './Forgot.js';
import { Register } from './Register.js';
import { Reset } from './Reset.js';
import { Verify } from './Verify.js';
import { Unlock } from './Unlock.js';
import { Account } from './Account.js';

const app = document.querySelector('#app');

function renderPage() {
  app.innerHTML = '';
  const hashRaw = window.location.hash.replace('#', '') || 'login';
  const hash = hashRaw.split('?')[0];
  let page;
  if (hash === 'reset') {
    page = Reset();
  } else if (hash === 'verify') {
    page = Verify();
  } else if (hash === 'unlock') {
    page = Unlock();
  } else if (hash === 'account') {
    page = Account();
  } else {
    switch (hash) {
      case 'login':
        page = Login();
        break;
      case 'forgot':
        page = Forgot();
        break;
      case 'register':
        page = Register();
        break;
      default:
        page = Login();
    }
  }
  app.appendChild(page);
}

window.addEventListener('hashchange', renderPage);
renderPage();
