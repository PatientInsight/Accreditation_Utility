import AccreditationScorecardPage from './client/AccreditationScorecardPage';
import WorkflowPage from './client/WorkflowPage';

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

// , {
//   'name': 'WorkflowPage',
//   'path': '/workflow-map',
//   'component': WorkflowPage
// }

var AdminSidebarElements = [{
  'primaryText': 'Scorecard',
  'to': '/scorecard',
  'href': '/scorecard'
}, {
  'primaryText': 'Workflow',
  'to': '/workflow-map',
  'href': '/workflow-map'
}];


let FooterButtons = [{
  pathname: '/encounters',
  component: <EncountersButtons />
}, {
  pathname: '/scorecard',
  component: <ScorecardButtons />
}];

export { AdminSidebarElements, DynamicRoutes, AccreditationScorecardPage, WorkflowPage, FooterButtons };
