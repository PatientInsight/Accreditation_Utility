import HelloWorldPage from './client/HelloWorldPage';
import PostcardPage from './client/PostcardPage';
import BodyMassIndexPage from './client/BodyMassIndexPage';

var DynamicRoutes = [{
  'name': 'HelloWorldPage',
  'path': '/scorecard',
  'component': HelloWorldPage
}, {
  'name': 'BodyMassIndexPage',
  'path': '/body-mass-index',
  'component': BodyMassIndexPage
}];

var AdminSidebarElements = [{
  'primaryText': 'Scorecard',
  'to': '/scorecard',
  'href': '/scorecard'
}, {
  'primaryText': 'Body Mass Calculator',
  'to': '/body-mass-index',
  'href': '/body-mass-index'
}];

export { AdminSidebarElements, DynamicRoutes, SamplePage, PostcardPage, BodyMassIndexPage };
