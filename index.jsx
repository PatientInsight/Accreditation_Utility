import AccreditationScorecardPage from './client/AccreditationScorecardPage';
import React from 'react';

import { 
  ScorecardButtons,
  EncountersButtons
} from './client/FooterButtons';


var DynamicRoutes = [{
  'name': 'AccreditationScorecardPage',
  'path': '/scorecard',
  'component': AccreditationScorecardPage
}];

var AdminSidebarElements = [{
  'primaryText': 'Scorecard',
  'to': '/scorecard',
  'href': '/scorecard'
}];


let FooterButtons = [{
  pathname: '/encounters',
  component: <EncountersButtons />
}, {
  pathname: '/scorecard',
  component: <ScorecardButtons />
}];

export { AdminSidebarElements, DynamicRoutes, AccreditationScorecardPage, FooterButtons };
