import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { 
  CssBaseline,
  Grid, 
  Container,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Button,
  Tab, 
  Tabs,
  Typography,
  Box
} from '@material-ui/core';


import React from 'react';
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

    let encounterReasonCodes = ["84114007","161505003"];  // Heart failure

    if(get(Meteor, 'settings.public.accreditation.encounterReasonCodes')){
      encounterReasonCodes = get(Meteor, 'settings.public.accreditation.encounterReasonCodes');
    }

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      encounterReasonCodes.push("74400008") // Appendicitis
      encounterReasonCodes.push("72892002"); // Normal Pregnancy
    }

    console.log('Searching Encounters for the following encounter reason codes:', encounterReasonCodes);


    // generate the url to fetch the encounters for a particular date range
    let dateQuery = AutoFetcher.generateDateQuery();    
    Encounters.find({
      'reason.coding.code': {$in: encounterReasonCodes }
    }).forEach(function(encounter){
      if(get(encounter, 'id')){
        console.log('encounter has id', encounter);
        // let encounterUrl = fhirBaseUrl + '/Procedure?encounter=Encounter/' + get(encounter, 'id') + '&_count=1000&apikey=' + apiKey;



        let encounterUrl = fhirBaseUrl + '/';

        if(get(encounter, 'subject.reference')){
          encounterUrl = encounterUrl + get(encounter, 'subject.reference');
        } else if(get(encounter, 'patient.reference')){
          encounterUrl = encounterUrl + get(encounter, 'patient.reference');
        }
        
        if(isFhirServerThatRequiresApiKey()){
          encounterUrl = encounterUrl + '?apikey=' + apiKey;
        }

        console.log('encounterUrl', encounterUrl, encounter);

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
          procedureUrl = procedureUrl + '&apikey=' + apiKey;
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
          observationsUrl = observationsUrl + '&apikey=' + apiKey;
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
          diagnosticReportUrl = diagnosticReportUrl + '&apikey=' + apiKey;
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
          documentReferenceUrl = documentReferenceUrl + '&apikey=' + apiKey;
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
        <Button onClick={this.fetchPatients.bind(this) } >4. Patients</Button>
        <Button onClick={this.fetchProcedures.bind(this) } >5. Procedures</Button>
        <Button onClick={this.fetchObservations.bind(this) } >6. Observations</Button>
        <Button onClick={this.fetchDiagnosticReports.bind(this) } >7. Diagnostic Reports</Button>
        <Button onClick={this.fetchDocumentReferences.bind(this) } >8. Document References</Button>
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
    let encounterReasonCode = "12345678"  // Heart Failure

    if(get(Meteor, 'settings.public.accreditation.encounterReasonCodes')){
      encounterReasonCodes = get(Meteor, 'settings.public.accreditation.encounterReasonCodes');
    }

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      encounterReasonCode = "80146002" // Appendectomy
    }

    Session.set('encountersTableQuery', {'reason.coding.code': encounterReasonCode});
  }
  filterEmergency(){
    Session.set('encountersTableQuery', {$or: [
      {'class': 'emergency'},       // DSTU2
      {'class.code': 'emergency'}   // STU3, R4
    ]});    
  }
  filterObservational(){
    Session.set('encountersTableQuery', {$or: [
      {'class': {$in: ["field", "daytime", "other"]}},      // DSTU2
      {'class.code': {$in: ["field", "daytime", "other"]}}  // STU3, R4
    ]});
  }
  filterInpatient(){
    Session.set('encountersTableQuery', {$or: [
      {'class': 'inpatient'},       // DSTU2
      {'class.code': 'inpatient'}   // STU3, R4
    ]});    
  }
  filterAmbulatory(){
    Session.set('encountersTableQuery', {$or: [
      {'class': 'ambulatory'},       // DSTU2
      {'class.code': 'ambulatory'}   // STU3, R4
    ]});    
  }
  render() {
    return (
      <div>
        <Button onClick={this.filterAll.bind(this) } >All</Button>
        <Button onClick={this.filterHeartFailures.bind(this) } >Heart Failures</Button>
        <Button onClick={this.filterEmergency.bind(this) } >Emergency</Button>
        <Button onClick={this.filterObservational.bind(this) } >Observational</Button>
        <Button onClick={this.filterInpatient.bind(this) } >Inpatient</Button>
        <Button onClick={this.filterAmbulatory.bind(this) } >Ambulatory</Button>
      </div>
    );
  }
}


