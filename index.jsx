import AccreditationScorecardPage from './client/AccreditationScorecardPage';
import PostcardPage from './client/PostcardPage';
import BodyMassIndexPage from './client/BodyMassIndexPage';

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

export { AdminSidebarElements, DynamicRoutes, AccreditationScorecardPage };
