require('../styles/main.less');

import './polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';

import createStore from './store';

import runLoop from './runLoop';

const store = createStore();
runLoop.setStore(store);

runLoop.start();

// Set up router
import routes from './config/routes';
import {Router} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
let history = createBrowserHistory();

ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      {routes}
    </Router>
  </Provider>
), document.getElementById('container'));
