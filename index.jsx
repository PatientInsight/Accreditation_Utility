import React from 'react';

// import AccreditationScorecardPage from './client/AccreditationScorecardPage';
// import WorkflowPage from './client/WorkflowPage';
import FooPage from './client/FooPage';

import { AiFillLayout } from 'react-icons/ai';
import { TiFlowChildren } from 'react-icons/ti';
import { MdDashboard } from 'react-icons/md';
import { GoDashboard } from 'react-icons/go';
import { FaTrafficLight } from 'react-icons/fa';

import { 
  ScorecardButtons,
  EncountersButtons
} from './client/FooterButtons';


var DynamicRoutes = [{
  'name': 'AccreditationScorecardPage',
  'path': '/scorecard',
  'component': FooPage
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
}];

// , {
//   'primaryText': 'Workflow',
//   'to': '/workflow-map',
//   'href': '/workflow-map'
// }

var SidebarElements = [{
  'primaryText': 'Scorecard',
  'to': '/scorecard',
  'href': '/scorecard',
  'icon': <FaTrafficLight />
}];

// , {
//   'primaryText': 'Workflow',
//   'to': '/workflow-map',
//   'href': '/workflow-map',
//   'icon': <TiFlowChildren />
// }

let FooterButtons = [{
  pathname: '/encounters',
  component: <EncountersButtons />
}, {
  pathname: '/scorecard',
  component: <ScorecardButtons />
}];

export { 
  DynamicRoutes, 

  AdminSidebarElements, 
  SidebarElements, 

  // AccreditationScorecardPage, 
  // WorkflowPage, 
  FooPage,

  FooterButtons 
};
