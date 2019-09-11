import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import React from 'react';
import { browserHistory } from 'react-router';
import { Glass } from 'meteor/clinical:glass-ui';
import { FlatButton } from 'material-ui';
import { get } from 'lodash';

import AutoFetcher from '../lib/AutoFetcher';

let apiKey = get(Meteor, 'settings.public.interfaces.default.auth.username', '');
let usePseudoCodes = get(Meteor, 'settings.public.usePseudoCodes', false);
let fhirBaseUrl = get(Meteor, 'settings.public.interfaces.default.channel.endpoint', false);

isFhirServerThatRequiresApiKey = function(){
  if(["https://syntheticmass.mitre.org/v1/fhir"].includes(get(Meteor, 'settings.public.interfaces.default.channel.endpoint'))){
    return true;
  } else {
    return false
  }
}


Session.setDefault('filterEncountersForHeartFailures', false);
export class ScorecardButtons extends React.Component {
  constructor(props) {
    super(props);
  }
  fetchPatients(){
    console.log('Fetching Patients')

    let reasonCodes = ["84114007","161505003"];  // Heart failure

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      reasonCodes.push("74400008") // Appendicitis
      reasonCodes.push("72892002"); // Normal Pregnancy
    }

    // generate the url to fetch the encounters for a particular date range
    let dateQuery = AutoFetcher.generateDateQuery();    
    Encounters.find({
      'reason.coding.code': {$in: reasonCodes }
    }).forEach(function(encounter){
      if(get(encounter, 'id')){
        // let encounterUrl = fhirBaseUrl + '/Procedure?encounter=Encounter/' + get(encounter, 'id') + '&_count=1000&apikey=' + apiKey;
        let encounterUrl = fhirBaseUrl + '/'+ get(encounter, 'subject.reference');
        
        if(isFhirServerThatRequiresApiKey()){
          encounterUrl = encounterUrl + '?apikey=' + apiKey;
        }
        Meteor.setTimeout(function(){
          AutoFetcher.recursivePatientQuery(encounterUrl, apiKey)
        }, 100);
      }
    })
  }
  fetchProcedures(){
    console.log('Fetching Procedures')

    // maybe hipaa audit log here?

    
    // get our start and end dates
    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    // generate the url to fetch the encounters for a particular date range
    let dateQuery = AutoFetcher.generateDateQuery();    
    Patients.find().forEach(function(patient){
      if(get(patient, 'id')){
        // let procedureUrl = fhirBaseUrl + '/Procedure?patient=Encounter/' + get(patient, 'id') + '&_count=1000&apikey=' + apiKey;
        let procedureUrl = fhirBaseUrl + '/Procedure?patient=' + get(patient, 'id') + '&_count=1000';

        if(isFhirServerThatRequiresApiKey()){
          procedureUrl = procedureUrl + '?apikey=' + apiKey;
        }
        Meteor.setTimeout(function(){
          AutoFetcher.recursiveProceduresQuery(procedureUrl, apiKey)
        }, 50);
      }
    })
  }
  fetchObservations(){
    console.log('Fetching Observations')

    // maybe hipaa audit log here?

    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    // generate the url to fetch the encounters for a particular date range
    let dateQuery = AutoFetcher.generateDateQuery();    
    Patients.find().forEach(function(patient){
      if(get(patient, 'id')){
        let observationsUrl = fhirBaseUrl + '/Observation?patient=' + get(patient, 'id') + '&_count=1000';

        if(isFhirServerThatRequiresApiKey()){
          observationsUrl = observationsUrl + '?apikey=' + apiKey;
        }
        Meteor.setTimeout(function(){
          AutoFetcher.recursiveObservationsQuery(observationsUrl, apiKey);
        }, 50);
      }
    })

  }
  fetchDiagnosticReports(){
    console.log('Fetching Diagnostic Reports')

    // maybe hipaa audit log here?

    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    // generate the url to fetch the encounters for a particular date range
    let dateQuery = AutoFetcher.generateDateQuery();    
    Patients.find().forEach(function(patient){
      if(get(patient, 'id')){
        let diagnosticReportUrl = fhirBaseUrl + '/DiagnosticReport?patient=' + get(patient, 'id') + '&_count=1000';

        if(isFhirServerThatRequiresApiKey()){
          diagnosticReportUrl = diagnosticReportUrl + '?apikey=' + apiKey;
        }

        Meteor.setTimeout(function(){
          AutoFetcher.recursiveDiagnosticReportsQuery(diagnosticReportUrl, apiKey);
        }, 50);
      }
    })

  }
  fetchDocumentReferences(){
    console.log('Fetching Document References')

    // maybe hipaa audit log here?

    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    // generate the url to fetch the encounters for a particular date range
    let dateQuery = AutoFetcher.generateDateQuery();    
    let encounterUrl = fhirBaseUrl + '/DocumentReference?encounter' + dateQuery + '&_count=1000&apikey=' + apiKey;

    // generate the url to fetch the encounters for a particular date range
    Patients.find().forEach(function(patient){
      if(get(patient, 'id')){
        let documentReferenceUrl = fhirBaseUrl + '/DocumentReference?subject=Patient/' + get(patient, 'id') + '&_count=1000';

        if(isFhirServerThatRequiresApiKey()){
          documentReferenceUrl = documentReferenceUrl + '?apikey=' + apiKey;
        }

        Meteor.setTimeout(function(){
          AutoFetcher.recursiveDocumentReferenceQuery(documentReferenceUrl, apiKey);
        }, 50);
      }
    })

    AutoFetcher.recursiveDocumentReferenceQuery(encounterUrl, apiKey);

  }
  render() {
    return (
      <div>
        <FlatButton label='4. Patients' onClick={this.fetchPatients.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='5. Procedures' onClick={this.fetchProcedures.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='6. Observations' onClick={this.fetchObservations.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='7. Diagnostic Reports' onClick={this.fetchDiagnosticReports.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='8. Document References' onClick={this.fetchDocumentReferences.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
      </div>
    );
  }
}


export class EncountersButtons extends React.Component {
  constructor(props) {
    super(props);
  }
  // toggleHeartFailureFilter(){
  //   console.log('Filtering heart failures...');

  //   let reasonCode = "12345678"  // Heart Failure

  //   if(Session.get('usePseudoCodes')){
  //     console.log('Using psueduo codes.  To disable; please edit the settings file.')
  //     reasonCode = "80146002" // Appendectomy
  //   }

  //   if(Session.get('filterEncountersForHeartFailures')){
  //     Session.set('encountersTableQuery', {'reason.coding.code': reasonCode});
  //     Session.set('filterEncountersForHeartFailures', false);
  //   } else {
  //     Session.set('encountersTableQuery', {});
  //     Session.set('filterEncountersForHeartFailures', true);
  //   }

  //   // Session.toggle('filterEncountersForHeartFailures')
  // }
  filterAll(){
    Session.set('encountersTableQuery', {});
  }
  filterHeartFailures(){
    let reasonCode = "12345678"  // Heart Failure

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      reasonCode = "80146002" // Appendectomy
    }

    Session.set('encountersTableQuery', {'reason.coding.code': reasonCode});
  }
  filterEmergency(){
    Session.set('encountersTableQuery', {'class.code': 'EMERGENCY'});    
  }
  filterObservational(){
    Session.set('encountersTableQuery', {'class.code': 'emergency'});
  }
  filterInpatient(){
    Session.set('encountersTableQuery', {'class.code': 'inpatient'});    
  }
  filterAmbulatory(){
    Session.set('encountersTableQuery', {'class.code': 'ambulatory'});    
  }
  render() {
    return (
      <div>
        <FlatButton label='All' onClick={this.filterAll.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='Heart Failures' onClick={this.filterHeartFailures.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='Emergency' onClick={this.filterEmergency.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='Observational' onClick={this.filterObservational.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='Inpatient' onClick={this.filterInpatient.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
        <FlatButton label='Ambulatory' onClick={this.filterAmbulatory.bind(this) } style={ Glass.darkroom({marginLeft: '20px'}) } ></FlatButton>
      </div>
    );
  }
}


