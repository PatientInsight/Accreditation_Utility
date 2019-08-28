import { CardMedia, CardText, CardTitle, CardHeader, RaisedButton, FlatButton, DatePicker } from 'material-ui';
import { GlassCard, FullPageCanvas, Glass } from 'meteor/clinical:glass-ui';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { browserHistory } from 'react-router';

import { get, uniqBy } from 'lodash';

import { Table } from 'react-bootstrap';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { EJSON } from 'meteor/ejson';

import { moment } from 'meteor/momentjs:moment';

import LosslessJSON from 'lossless-json';
import JSON5 from 'json5';

import Client from 'fhir-kit-client';

console.log('Intitializing fhir-kit-client for ' + get(Meteor, 'settings.public.interfaces.default.channel.endpoint', ''))
const client = new Client({
  baseUrl: get(Meteor, 'settings.public.interfaces.default.channel.endpoint', '')
});

Session.setDefault('displayText', '');
Session.setDefault('measuresArray', [{
  identifier: "CM.M1",
  description: "Heart failure specific admission rates to Observation level of care.",
  score: 0
}, {
  identifier: "CM.M2",
  description: "Heart failure specific admission rates to Inpatient level of care.",
  score: 0
}, {
  identifier: "CM.M12a",
  description: "Proportion of patients receiving Echocardiogram or Cardiac MRI",
  score: 0
}, {
  identifier: "CM.M12b",
  description: "Proportion of patients receiving Cardiac MRI",
  score: 0
}, {
  identifier: "CM.M12c",
  description: "Proportion of patients receiving Echocardiogram",
  score: 0
}, {
  identifier: "CM.M15",
  description: "Door to ECG time Median time from arrival to ECG performed. ",
  score: 0
}, {
  identifier: "CM.M17",
  description: "Door to therapy time for nitroglycerin or other vasodilator during early stabilization.",
  score: 0
}, {
  identifier: "CM.M18",
  description: "Door to IV therapy time for diuretic during early stabilization.",
  score: 0
}, {
  identifier: "CM.M24",
  description: "Observation patients receiving a Cardiology consult.",
  score: 0
}, {
  identifier: "CM.M27",
  description: "Screening completion for CRT/CRT-D during Inpatient level of care stay.",
  score: 0
}, {
  identifier: "CM.M28c",
  description: "Documented daily weight complete.",
  score: 0
}, {
  identifier: "CM.M29",
  description: "Cardiology consult.",
  score: 0
}, {
  identifier: "CM.M31",
  description: "Daily assessment of renal and electrolyte function.   Proportion of patients having documented daily assessment of electrolytes and renal function. ",
  score: 0
}]);


Session.setDefault('usePseudoCodes', get(Meteor, 'settings.public.usePseudoCodes'));


Session.setDefault('activeMeasure', {});
Session.setDefault('showJson', false);
Session.setDefault('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=112790001&apikey=');

Session.setDefault('encounter_observational', 0);
Session.setDefault('encounter_inpatient', 0);
Session.setDefault('encounter_inpatient_accute', 0);
Session.setDefault('encounter_ambulatory', 0);
Session.setDefault('encounter_emergency', 0);
Session.setDefault('encounter_field', 0);
Session.setDefault('encounter_homehealth', 0);
Session.setDefault('encounter_preadmission', 0);
Session.setDefault('encounter_shortstay', 0);
Session.setDefault('encounter_virtual', 0);
Session.setDefault('encounters_total', 0);
Session.setDefault('encounters_discharged', 0);
Session.setDefault('encounters_discharged_with_heartfailure', 0);

Session.setDefault('patients_heartfailure', 0);



Session.setDefault('start_date', '2018-08-01');
Session.setDefault('end_date', '2018-08-01');

export class AccreditationScorecardPage extends React.Component {
  constructor(props) {
    super(props);
  }
  getMeteorData() {

    let imgHeight = (Session.get('appHeight') - 210) / 3;

    let data = {
      style: {
        page: {},
        coverImg: {
          maxWidth: 'inherit',
          maxHeight: 'inherit',
          height: 'inherit'
        },
        cards: {
          media: {
            height: (imgHeight - 1) + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          practitioners: {
            cursor: 'pointescale-downr',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          organizations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          locations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          }
        },
        inactiveIndexCard: {
          opacity: .5,
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px'
        },
        tile: {
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px',
          marginBottom: '20px',
          height: imgHeight + 'px'
        },
        spacer: {
          display: 'block'
        },
        title: Glass.darkroom(),
        subtitle: Glass.darkroom()
      },
      organizations: {
        image: "/pages/provider-directory/organizations.jpg"
      },
      totals: {
        // https://www.hl7.org/fhir/v3/ActEncounterCode/vs.html
        patients: {
          total: Patients.find().count(),
          heartfailure: Session.get('patients_heartfailure')
        },
        encounters: {
          inpatients: Session.get('encounter_inpatient'),
          inpatient_accute: Session.get('encounter_inpatient_accute'),
          observations: Session.get('encounter_observational'),
          ambulatory: Session.get('encounter_ambulatory'),
          emergency: Session.get('encounter_emergency'),
          field: Session.get('encounter_field'),
          homehealth: Session.get('encounter_homehealth'),
          preadmission: Session.get('encounter_preadmission'),
          shortstay: Session.get('encounter_shortstay'),
          virtual: Session.get('encounter_virtual'),
          total: Encounters.find().count(),
          discharged: Session.get('encounters_discharged'),
          discharged_with_heartfailure: Session.get('encounters_discharged_with_heartfailure')
        },
        observations: {
          total: Observations.find().count()
        },
        procedures: {
          total: Procedures.find().count()
        },
        diagnosticReports: {
          total: DiagnosticReports.find().count()
        },
        documentReferences: {
          total: DocumentReferences.find().count()
        },

      },
      displayText: Session.get('displayText'),
      measures: Session.get('measuresArray'),
      showJson: Session.get('showJson'),
      endpoint: get(Meteor, 'settings.public.interfaces.default.channel.endpoint', ''),
      apiKey: get(Meteor, 'settings.public.interfaces.default.auth.username', ''),
      fhirQueryUrl: Session.get('fhirQueryUrl')
    };


    data.style.indexCard = Glass.darkroom(data.style.indexCard);

    if (Session.get('appWidth') < 768) {
      data.style.inactiveIndexCard.width = '100%';
      data.style.inactiveIndexCard.marginBottom = '10px';
      data.style.inactiveIndexCard.paddingBottom = '10px';
      data.style.inactiveIndexCard.paddingLeft = '0px';
      data.style.inactiveIndexCard.paddingRight = '0px';

      data.style.spacer.display = 'none';
    }

    if(Session.get('appHeight') > 1200){
      data.style.page = {
        top: '50%',
        transform: 'translateY(-50%)',
        position: 'relative'
      }
    }

    if(process.env.NODE_ENV === "test") console.log("AccreditationScorecardPage[data]", data);
    return data;
  }
  toggleDisplayJson(){
    Session.toggle('showJson');
  }
  fetchMetadata(fhirClient){
    console.log('fetchMetadata')
    console.log('fhirClient', fhirClient)

    console.log('fhirClient.smartAuthMetadata()', fhirClient.smartAuthMetadata())
    fhirClient.smartAuthMetadata().then((response) => {
      console.log('smartAuthMetadata', response);
    });
    fhirClient.capabilityStatement().then((data) => {
      console.log('capabilityStatement', data);
      Session.set('displayText', data);
    });  

    // console.log('metadataAutoscan....');
    // Meteor.call('metadataAutoscan', Session.get('oauthBaseUrl'), function(error, result){
    //   if(result){
    //     console.log('result', result)
    //     Session.set('displayText', result)
    //   }
    // })

  }
  async queryEndpoint(scope, modality){
    console.log('queryEndpoint', scope.data.endpoint + scope.data.fhirQueryUrl + scope.data.apiKey)

    await Meteor.call("queryEndpoint", scope.data.endpoint + scope.data.fhirQueryUrl + scope.data.apiKey, function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        let parsedResults = JSON5.parse(result.content, function(key, value){
          console.log('key   - ' + key);
          console.log('value - ' + value);
          return value;
        });
        console.log('parsedResults', parsedResults);


        Session.set('displayText', parsedResults);
  
        let measures = Session.get('measuresArray');
        switch (modality) {
          case "endoscopy":
            measures[4].numerator = parsedResults.total;
            measures[4].denominator = parsedResults.total;
            measures[4].score =  ((measures[4].numerator /  measures[4].denominator) * 100) + '%';
            break;
          case "mri":
            measures[3].numerator = parsedResults.total;
            measures[3].denominator = parsedResults.total;
            measures[3].score = (( measures[3].numerator /  measures[3].denominator) * 100) + '%';
            break;
          case "echo":
            measures[2].numerator = parsedResults.total;
            measures[2].denominator = parsedResults.total;
            measures[2].score = (( measures[2].numerator /  measures[2].denominator) * 100) + "%";
            break;
          case "angio":
            measures[5].numerator = parsedResults.total;
            measures[5].denominator = parsedResults.total;
            measures[5].score = (( measures[5].numerator /  measures[5].denominator) * 100) + "%";
            break;
          case "patient":
            // measures[0].denominator = parsedResults.total;
            // measures[1].denominator = parsedResults.total;
            // measures[2].denominator = parsedResults.total;
            // measures[3].denominator = parsedResults.total;
            // measures[4].denominator = parsedResults.total;
            // measures[5].denominator = parsedResults.total;
            measures[6].denominator = parsedResults.total;
            measures[7].denominator = parsedResults.total;
            measures[8].denominator = parsedResults.total;
            measures[9].denominator = parsedResults.total;
            measures[10].denominator = parsedResults.total;
            measures[11].denominator = parsedResults.total;
            measures[12].denominator = parsedResults.total;
            measures[13].denominator = parsedResults.total;
  
            // measures[2].score = (( measures[2].numerator /  measures[2].denominator) * 100) + "%";
            // measures[3].score = (( measures[3].numerator /  measures[3].denominator) * 100) + "%";
            // measures[4].score = (( measures[4].numerator /  measures[4].denominator) * 100) + "%";
            // measures[5].score = (( measures[5].numerator /  measures[5].denominator) * 100) + "%";
            break;
  
            default:
            break;
        }
        Session.set('measuresArray', measures);
      }      
    })

  }
  // queryEndoscopy(){
  //   console.log('queryEndoscopy')

  //   let dateQuery = this.generateDateQuery('_has:Procedure');   

  //   Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=112790001&' + dateQuery + '&apikey=');
  //   this.queryEndpoint(this, 'endoscopy');
  // }
  // queryEchocardiograms(){
  //   console.log('queryEchocardiograms')

  //   let dateQuery = this.generateDateQuery('_has:Procedure');   
    
  //   Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=40701008&apikey=');
  //   this.queryEndpoint(this, 'echo');
  // }
  // queryAngiography(){
  //   console.log('queryAngiography')
    
  //   let dateQuery = this.generateDateQuery('_has:Procedure');   
    
  //   Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=33367005&apikey=');
  //   this.queryEndpoint(this, 'angio');
  // }
  // queryCardiacMris(){
  //   console.log('queryCardiacMris')
    
  //   let dateQuery = this.generateDateQuery('_has:Procedure');   
    
  //   Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=241620005&apikey=');
  //   this.queryEndpoint(this, 'mri');
  // }
  queryPatients(){
    console.log('queryPatients')
    Session.set('fhirQueryUrl', '/Patient?apikey=');
    this.queryEndpoint(this, 'patient');
    this.queryEndpoint(this, 'patient');
  }

  //=============================================================================================
  async queryHeartfailureEncounters(){
    console.log('queryHeartfailureEncounters')

    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    let dateQuery = this.generateDateQuery() + '&';    

    let heartfailureEncounterUrl = "";
    let reasonCodes = "84114007,161505003";  // Heart failure

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      reasonCodes = reasonCodes + ",74400008" // Appendicitis
    }

    if(Session.equals('fhirVersion') === "R4"){
      // R4
      heartfailureEncounterUrl = this.data.endpoint + '/Encounter?reason-code=' + reasonCodes + '&' + dateQuery + '_count=1000&apikey=' + this.data.apiKey;
    } else {
      // STU3
      heartfailureEncounterUrl = this.data.endpoint + '/Encounter?reason=' + reasonCodes + '&' + dateQuery + '_count=1000&apikey=' + this.data.apiKey;
    }


    console.log('heartfailureEncounterUrl', heartfailureEncounterUrl);

    let encounters_inpatients_with_heartfailure = 0;
    let encounters_emergency_with_heartfailure = 0;
    let encounters_observational_with_heartfailure = 0;
    let encounters_ambulatory_with_heartfailure = 0;

    await Meteor.call("queryEndpoint", heartfailureEncounterUrl, function(error, result){
      let parsedResults = JSON5.parse(result.content);
      console.log('Heartfailure Encounters:  ', parsedResults)
      Session.set('encounters_discharged_with_heartfailure', parsedResults.total);

      Encounters.remove({});
      parsedResults.entry.forEach(function(entry){
        if(get(entry, 'resource.class.code') === "ambulatory"){
          encounters_ambulatory_with_heartfailure++;
        }
        if(get(entry, 'resource.class.code') === "emergency"){
          encounters_observational_with_heartfailure++;
        }
        if(get(entry, 'resource.class.code') === "EMERGENCY"){
          encounters_emergency_with_heartfailure++;
        }
        if(get(entry, 'resource.class.code') === "inpatient"){
          encounters_inpatients_with_heartfailure++;
        }
        console.log('encounter', get(entry, 'resource'));
        Encounters.insert(get(entry, 'resource'));
      })

      Session.set('encounters_with_heartfailure', {
        ambulatory: encounters_ambulatory_with_heartfailure,
        observational: encounters_observational_with_heartfailure,
        emergency: encounters_emergency_with_heartfailure, 
        inpatient: encounters_inpatients_with_heartfailure
      })
    })

  }
  async queryHeartfailurePatients(scope){
    console.log('queryHeartfailurePatients')

    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    let dateQuery = this.generateDateQuery() + '&';    

    let heartfailureUrl = "";

    if(Session.equals('fhirVersion') === "R4"){
      // R4
      heartfailureUrl = this.data.endpoint + '/Patient?_has:Encounter:reason-code=84114007,161505003&' + dateQuery + '_count=1000&apikey=' + this.data.apiKey;      
    } else {
      // STU3
      heartfailureUrl = this.data.endpoint + '/Patient?_has:Encounter:reason=84114007,161505003&' + dateQuery + '_count=1000&apikey=' + this.data.apiKey;      
    }

    console.log('heartfailureUrl', heartfailureUrl);

    await Meteor.call("queryEndpoint", heartfailureUrl, function(error, result){
      let parsedResults = JSON5.parse(result.content);
      console.log('Heartfailure Patients:  ', parsedResults)
      Session.set('patients_heartfailure', parsedResults.total);
    })    
  }
  async queryPatientStats(scope){
    console.log('queryPatientStats');

    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    // https://www.hl7.org/fhir/v3/ActEncounterCode/vs.html

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=IMP&_count=1000&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON5.parse(result.content);
      console.log('Inpatients:  ', parsedResults)
      Session.set('encounter_observational', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=AMB&_count=1000&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON5.parse(result.content);
      console.log('Ambulatory:  ', parsedResults)
      Session.set('encounter_inpatient', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=OBSENC&_count=1000&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON5.parse(result.content);
      console.log('Observations:  ', parsedResults)
      Session.set('encounter_ambulatory', parsedResults.total);
    })
  }
  generateDateQuery(chainPrefix){
    let dateQuery = '';

    if(chainPrefix){
      dateQuery = chainPrefix;
    }
    if(Session.get('start_date')){
      dateQuery = dateQuery + 'date=gt' + Session.get('start_date')
    }
    if(Session.get('start_date') && Session.get('end_date')){
      dateQuery = dateQuery + '&';
    }
    if(chainPrefix){
      dateQuery = dateQuery + chainPrefix;
    }

    if(Session.get('end_date')){
      dateQuery = dateQuery + 'date=lt' + Session.get('end_date')
    }
    if(Session.get('start_date') || Session.get('end_date')){
      dateQuery = dateQuery;
    }

    return dateQuery;
  }
  async queryAllEncountersForDaterange(){
    console.log('queryAllEncountersForDaterange');

    // get our start and end dates
    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    // generate the url to fetch the encounters for a particular date range
    let dateQuery = this.generateDateQuery();    
    let encounterUrl = this.data.endpoint + '/Encounter?' + dateQuery + '&_count=1000&apikey=' + this.data.apiKey;

    this.recursiveEncounterQuery(encounterUrl);
  }
  async recursiveEncounterQuery(queryUrl){
    console.log('queryUrl', queryUrl);

    let self = this;
    await Meteor.call("queryEndpoint", queryUrl, function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        // received some data
        console.log('result', result);

        let parsedResults = JSON5.parse(result.content);

        console.log('Encounters:  ', parsedResults)

        // first we right the entries to the Encounter collection
        if(get(parsedResults, 'entry')){
          parsedResults.entry.forEach(function(entry){      
            // checking for duplicates along the way
            if(!Encounters.findOne({id: get(entry, 'resource.id')})){
              Encounters._collection.insert(get(entry, 'resource'));
            }    
          });
        }

        // then we check if we have a pagination link
        if(get(parsedResults, 'link')){
          parsedResults.link.forEach(function(link){
            // if we have a link to a next page
            if(get(link, 'relation') === "next"){
              // recursively call this function again on the new page
              self.recursiveEncounterQuery(get(link, 'url') + '&apikey=' + self.data.apiKey)
            }
          })
        }
      }
    })
  }
  parseEncounters(){
    console.log('parseEncounters')

    let dstu2 = {
      ambulatory: 0,
      emergency: 0,
      field: 0,
      home_health: 0,
      inpatient_encounter: 0,
      inpatient_accute: 0,
      inpatient_non_accute: 0,
      observation_encounter: 0,
      pre_admission: 0,
      short_stay: 0,
      virtual: 0
    }

    let encounters_discharged_with_heartfailure = 0;
    let encounters_discharged = 0;

    let reasonCodes = [];

    Encounters.find().forEach(function(encounter){
      switch (get(encounter, 'class.code')) {
        case "ambulatory":
          dstu2.ambulatory++;
          break;
        case "emergency":
          dstu2.emergency++;
          break;
        case "EMERGENCY":
          dstu2.observation_encounter++;
          break;
        case "field":
          dstu2.field++;
          break;
        case "homehealth":
         dstu2.home_health++;
          break;
        case "home health":
          dstu2.home_health++;              
          break;
        case "inpatient":
          dstu2.inpatient_encounter++;
          break;
        case "inpatient encounter":
          dstu2.inpatient_encounter++;              
          break;
        case "inpatient accute":
          dstu2.inpatient_accute++;              
          break;
        case "inpatient non-accute":
          dstu2.inpatient_non_accute++;
          break;
        case "observation encounter":
          dstu2.observation_encounter++;
          break;
        case "pre-admission":
          dstu2.pre_admission++;
          break;
        case "short stay":
          dstu2.short_stay++;
          break;                
        case "virtual":
          dstu2.virtual++;
          break;                                             
        default:
          break;
      }

      let dischargeDate = get(encounter, 'period.end');
      let startDate = Session.get('start_date');
      let endDate = Session.get('endDate');

      if(moment(dischargeDate).isBetween(startDate, endDate)){
        encounters_discharged++;

        if(get(encounter, 'reason[0].coding[0].code') === "84114007"){
          encounters_discharged_with_heartfailure++;
          console.log('Discharged patient with heartfailure', entry)
        }
      }
    });
    Session.set('encounters_discharged', encounters_discharged);
    Session.set('encounters_discharged_with_heartfailure', encounters_discharged_with_heartfailure);

    console.log('dstu2.ambulatory', dstu2.ambulatory);
    console.log('dstu2.emergency', dstu2.emergency);
    console.log('dstu2.field', dstu2.field);
    console.log('dstu2.home_health', dstu2.home_health);
    console.log('dstu2.inpatient_encounter', dstu2.inpatient_encounter);
    console.log('dstu2.inpatient_accute', dstu2.inpatient_accute);
    console.log('dstu2.inpatient_non_accute', dstu2.inpatient_non_accute);
    console.log('dstu2.observation_encounter', dstu2.observation_encounter);
    console.log('dstu2.pre_admission', dstu2.pre_admission);
    console.log('dstu2.short_stay', dstu2.short_stay);
    console.log('dstu2.virtual', dstu2.virtual);

    Session.set('encounter_inpatient', dstu2.inpatient_encounter);
    Session.set('encounter_ambulatory', dstu2.ambulatory);
    Session.set('encounter_emergency', dstu2.emergency);
    Session.set('encounter_observational', dstu2.observation_encounter);
    Session.set('encounter_field', dstu2.field);
    Session.set('encounter_homehealth', dstu2.home_health);

  }
  findHeartfailuresInEncounters(){
    console.log('findHeartfailuresInEncounters');

    let reasonCodes = "84114007,161505003";  // Heart failure
    let heartfailureCount = 0;

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      reasonCodes = reasonCodes + ",74400008" // Appendicitis
    }

    Encounters.find().forEach(function(encounter){
      if(reasonCodes.includes(get(encounter, 'reason[0].coding[0].code'))){
        heartfailureCount++;
      }
    })

    Session.set('encounters_discharged_with_heartfailure', heartfailureCount);
  }
  rowClick(id){
    //console.log('rowClick', id)
  }
  async runAction(identifier, foo, bar){
    //console.log('runAction', identifier)

    let self = this;

    let measures = Session.get('measuresArray');
    let encounters_with_heartfailure = Session.get('encounters_with_heartfailure');

    let dateQuery = this.generateDateQuery();    
    let procedureCodes;

    let reasonCode = "12345678"  // Heart Failure

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      reasonCode = "74400008" // Appendectomy
    }
    console.log('Searching for reason code ' + reasonCode)

    switch (identifier) {
      case "CM.M1":
        console.log('Running algorithm 1')   

        measures[0].numerator = Encounters.find({$and: [
          {'class.code': 'emergency'},
          {'reason.coding.code': reasonCode}
        ]}).count();

        measures[0].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[0].score =  ((measures[0].numerator /  measures[0].denominator) * 100).toFixed(2) + '%';
        break;
      case "CM.M2":
        console.log('Running algorithm 2')      

        measures[1].numerator = Encounters.find({$and: [
          {'class.code': 'inpatient'},
          {'reason.coding.code': reasonCode}
        ]}).count();

        // measures[1].numerator = encounters_with_heartfailure.inpatient;
        measures[1].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[1].score =  ((measures[1].numerator /  measures[1].denominator) * 100).toFixed(2) + '%';

        break;
      case "CM.M12a":
        console.log('Running algorithm 12a')
        console.log('Trying to find the number of Echocardiograms and Cardiac MRIs procedures...')

        // trying to find the number of Echocardiograms and Cardiac MRIs procedures

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results = {
          echocardiogramCount: 0,
          cardiacMriCount: 0,
          mixedCount: 0
        }

        // we also want to clear the Procedures collection, where we'll be storing the resources
        console.log('Removing procedures...')
        Procedures.remove({});

        // lets determine the procedure list to query
        let procedureList = "40701008,241620005";
        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          procedureList = procedureList + ",80146002" // Appendectomy
        }
        console.log('Generated procedure list to search for', procedureList)

        // we begin looping through each of the encounters
        Encounters.find().forEach(async function(encounter){
          console.log('Parsing an encounter...', get(encounter, 'id'));

          if(get(encounter, 'subject.reference')){
            console.log('Found a subject reference...', get(encounter, 'subject.reference'));

            let startDate = get(encounter, 'period.start')
            let endDate = get(encounter, 'period.end')          

            let patientProceduresUrl = self.data.endpoint +  "/Procedure?patient=" + get(encounter, 'subject.reference') + '&_count=1000&apikey=' + self.data.apiKey;
            console.log('Generating the patientProceduresUrl...', patientProceduresUrl);

            await Meteor.call("queryEndpoint", patientProceduresUrl, function(error, result){
              if(result){
                let parsedResults = JSON5.parse(result.content);
                console.log('Received a list of Procedures for this patient:  ', parsedResults)
                if(parsedResults.entry){
                  parsedResults.entry.forEach(function(procedureEntry){
  
                    if(get(procedureEntry, 'resource.code.coding[0].code') === "40701008"){
                      console.log('Found an echocardiogram.  Checking when it was performed....')     
                      if(get(procedureEntry, 'resource.context.reference') === ("Encounter/" + get(encounter, 'resource.id'))){
                        console.log('Found a valid echocardiogram...')                  
                        results.echocardiogramCount++;
                      }
                    }
                    if(get(procedureEntry, 'resource.code.coding[0].code') === "241620005"){
                      console.log('Found a Cardiac MRI.  Checking when it was performed....')     
                      if(get(procedureEntry, 'resource.context.reference') === ("Encounter/" + get(encounter, 'resource.id'))){
                        console.log('Found a valid Cardiac MRI...')                  
                        results.echocardiogramCount++;
                      }
                    }
    
                    // we want Cardiac MRI, Echochardiogram, and any other pseudocodes
                    if(procedureList.includes(get(procedureEntry, 'resource.code.coding[0].code'))){
                      console.log('Found a Cardiac MRI, Echocardiogram, or a Pseudocode.  Checking when it was performed....')                    
    
                      console.log("get(procedureEntry, 'resource.context.reference')", get(procedureEntry, 'resource.context.reference'))
                      console.log("get(encounter, 'resource.id')", "Encounter/" + get(encounter, 'resource.id'))
    
    
                      if(get(procedureEntry, 'resource.context.reference') === ("Encounter/" + get(encounter, 'id'))){
                        console.log('Echocardiogram or Cardiac MRI or Pseudocode is Valid!')                  
                        // skipping some things like 'Documentation of current medications'
                        if(!['428191000124101'].includes(get(procedureEntry, 'resource.code.coding[0].code'))){
                          
                          // lets check for duplicates; we may be receiving different versions of the resource
                          if(Procedures.findOne({id: get(procedureEntry, 'resource.id')})){
                            console.log('Upserting procedureEntry to Procedures collection: ', get(procedureEntry, 'resource'));
                            Procedures.upsert({id: get(procedureEntry, 'resource.id')}, {$set: get(procedureEntry, 'resource') });    
                          } else {
                            console.log('Adding entry to Procedures collection and updating count: ', get(procedureEntry, 'resource'));
                            results.mixedCount++;
                            Procedures.insert(get(procedureEntry, 'resource'));    
                          }
                        }
                      }
                    }
    
                    // // you can comment this section out
                    // if(!['428191000124101'].includes(get(procedureEntry, 'resource.code.coding[0].code'))){
    
                    //   // lets check for duplicates; we may be receiving different versions of the resource
                    //   if(Procedures.findOne({id: get(procedureEntry, 'resource.id')})){
                    //     console.log('Upserting procedureEntry to Procedures collection: ', get(procedureEntry, 'resource'));
                    //     Procedures.upsert({id: get(procedureEntry, 'resource.id')}, {$set: get(procedureEntry, 'resource') });    
                    //   } else {
                    //     console.log('Adding entry to Procedures collection and updating count: ', get(procedureEntry, 'resource'));
                    //     results.mixedCount++;
                    //     Procedures.insert(get(procedureEntry, 'resource'));    
                    //   }
                    // }
    
                  })    
                }
                
                measures[2].numerator = results.mixedCount;
                measures[2].denominator =  Session.get('encounters_discharged_with_heartfailure');
                measures[2].score =  ((measures[2].numerator /  measures[2].denominator) * 100).toFixed(2) + '%';
  
                measures[3].numerator = results.echocardiogramCount;
                measures[3].denominator =  Session.get('encounters_discharged_with_heartfailure');
                measures[3].score =  ((measures[3].numerator /  measures[3].denominator) * 100).toFixed(2) + '%';
  
                measures[4].numerator = results.echocardiogramCount;
                measures[4].denominator =  Session.get('encounters_discharged_with_heartfailure');
                measures[4].score =  ((measures[4].numerator /  measures[4].denominator) * 100).toFixed(2) + '%';
  
                Session.set('measuresArray', measures); 
              }
            })
          }
        }) 

        break;
      case "CM.M12b":
        console.log('Running algorithm 12b')      
        measures[3].numerator = 0;
        measures[3].denominator =  encounters_with_heartfailure.inpatient;
        measures[3].score =  ((measures[3].numerator /  measures[3].denominator) * 100).toFixed(2) + '%';

        // this.queryCardiacMris();         
        break;
      case "CM.M12c":
        console.log('Running algorithm 12c')  

        measures[4].numerator = 0;
        measures[4].denominator =  encounters_with_heartfailure.inpatient;
        measures[4].score =  ((measures[4].numerator /  measures[4].denominator) * 100).toFixed(2) + '%';

        // this.queryEndoscopy();         
        break;
      case "CM.M15":
        console.log('Running algorithm 15')                    
        console.log('Door to ECG time Median time from arrival to ECG performed.s...')

        console.log('Door to therapy time for nitroglycerin or other vasodilator during early stabilization...')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results15 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        procedureCodes = "169690007"; // ECG (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          // procedureCodes = procedureCodes + ",74016001,168594001,268425006" // Radiology
          procedureCodes = procedureCodes + ",271442997" // Fetal Anatomy Count
          // procedureCodes = procedureCodes + ",74016001" // Radiology
          // procedureCodes = procedureCodes + ",66348005" // Childbirth
        }

        let ecgEncounterUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        console.log('Generating the ecgEncounterUrl...', ecgEncounterUrl);

        await Meteor.call("queryEndpoint", ecgEncounterUrl, function(error, result){
          if(result){
            let parsedResults = JSON5.parse(result.content);
            console.log('Received ' + parsedResults.total + ' matching procedures.')
            measures[6].numerator = parsedResults.total;
  
            if(parsedResults.entry){
              parsedResults.entry.forEach(async function(procedure){
  
                let ecgProcedureUrl = self.data.endpoint +  "/" + get(procedure, 'resource.context.reference') + "?apikey=" + self.data.apiKey;
                console.log('ecgProcedureUrl', ecgProcedureUrl);
  
                Meteor.setTimeout(await Meteor.call("queryEndpoint", ecgProcedureUrl, function(error, result){
                  if(result){
                    let vasoEncounter = JSON5.parse(result.content);
                    console.log('vasoEncounter', vasoEncounter)
                    console.log('vasoProcedure', procedure)
    
                    let encounterStartTime = moment(get(vasoEncounter, 'period.start'));
                    let procedureStartTime = moment(get(procedure, 'resource.performedPeriod.start'));
    
                    console.log('  -- encounter start time:  ' + encounterStartTime);
                    console.log('  -- procedure start time:  ' + procedureStartTime);
    
                    let duration = moment.duration(encounterStartTime.diff(procedureStartTime));
                    console.log('  -- duration:              ' + duration);
    
                    let minutes = duration.asMinutes();
                    let hours = duration.asHours();
    
                    console.log('  -- minutes:               ' + minutes);
                    console.log('  -- hours:                 ' + hours);
    
                    results15.minutes = results15.minutes + minutes;
                    results15.hours = results15.hours + hours;
                    results15.duration = results15.duration + duration;
                    results15.count = results15.count + 1;
  
  
                    let measuresArray15 = Session.get('measuresArray');
                    console.log('measuresArray15', measuresArray15)
  
                    measuresArray15[5].numerator = parsedResults.total;
                    measuresArray15[5].denominator =  "";
                    measuresArray15[5].score =  (results15.minutes / results15.count).toFixed(0) + ' mins'; // this is just a basic average
          
                    Session.set('measuresArray', measuresArray15);
          
                  }
                }), 50);              
              })  
            }
          }
        })

        // // so let's set up some counters;
        // console.log('Setting up counters...')
        // let results15 = {
        //   duration: 0,
        //   hours: 0,
        //   minutes: 0,
        //   count: 0
        // }

        // // we begin looping through each of the encounters
        // Encounters.find().forEach(async function(encounter){
        //   //console.log('Parsing an encounter...', get(encounter, 'id'));

        //   let encounterProceduresUrl = self.data.endpoint +  "/Procedure?encounter=Encounter/" + get(encounter, 'id') + '&_count=1000&apikey=' + self.data.apiKey;
        //   //console.log('Generating the encounterProceduresUrl...', encounterProceduresUrl);

        //   await Meteor.call("queryEndpoint", encounterProceduresUrl, function(error, result){
        //     let parsedResults = JSON5.parse(result.content);
        //     //console.log('Received a list of Procedures for this encounter:  ', parsedResults)

        //     console.log(parsedResults.total + ' procedures in encounter ' + get(encounter, 'id'));
        
        //     if(parsedResults.entry){

        //       parsedResults.entry.forEach(function(procedure){

        //         let startTime = moment(get(encounter, 'period.start'));
        //         let endTime = moment(get(procedure, 'resource.performedPeriod.start'));

        //         console.log('  -- encounter start time:  ' + startTime);
        //         console.log('  -- procedure start time:  ' + endTime);
  
        //         let duration = moment.duration(endTime.diff(startTime));
        //         console.log('  -- duration:              ' + duration);

        //         let minutes = duration.asMinutes();
        //         let hours = duration.asHours();

        //         console.log('  -- minutes:               ' + minutes);
        //         console.log('  -- hours:                 ' + hours);

        //         results15.minutes = results15.minutes + minutes;
        //         results15.hours = results15.hours + hours;
        //         results15.duration = results15.duration + duration;
        //         results15.count = results15.count + 1;

        //       })  
        //     }

        //     measures[5].numerator = results15.minutes;
        //     measures[5].denominator =  results15.count;
        //     measures[5].score =  (results15.minutes / results15.count).toFixed(0) + ' mins'; // this is just a basic average

        //     Session.set('measuresArray', measures);
        //   })
        // })

        break;
      case "CM.M17":
        console.log('Running algorithm 17')   
        console.log('Door to therapy time for nitroglycerin or other vasodilator during early stabilization...')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results17 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        procedureCodes = "80146002"; // vasodialator (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          // procedureCodes = procedureCodes + ",74016001,168594001,268425006" // Radiology
          procedureCodes = procedureCodes + ",74016001" // Radiology
          // procedureCodes = procedureCodes + ",66348005" // Childbirth
        }

        let vasodilaterUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        console.log('Generating the vasodilaterUrl...', vasodilaterUrl);

        await Meteor.call("queryEndpoint", vasodilaterUrl, function(error, result){
          if(result){
            let parsedResults = JSON5.parse(result.content);
            console.log('Received ' + parsedResults.total + ' matching procedures.')
            measures[6].numerator = parsedResults.total;

            if(parsedResults.entry){
              parsedResults.entry.forEach(async function(procedure){

                let vasoEncounterUrl = self.data.endpoint +  "/" + get(procedure, 'resource.context.reference') + "?apikey=" + self.data.apiKey;
                console.log('vasoEncounterUrl', vasoEncounterUrl);

                Meteor.setTimeout(await Meteor.call("queryEndpoint", vasoEncounterUrl, function(error, result){
                  if(result){
                    let vasoEncounter = JSON5.parse(result.content);
                    console.log('vasoEncounter', vasoEncounter)
                    console.log('vasoProcedure', procedure)
    
                    let encounterStartTime = moment(get(vasoEncounter, 'period.start'));
                    let procedureStartTime = moment(get(procedure, 'resource.performedPeriod.start'));
    
                    console.log('  -- encounter start time:  ' + encounterStartTime);
                    console.log('  -- procedure start time:  ' + procedureStartTime);
    
                    let duration = moment.duration(encounterStartTime.diff(procedureStartTime));
                    console.log('  -- duration:              ' + duration);
    
                    let minutes = duration.asMinutes();
                    let hours = duration.asHours();
    
                    console.log('  -- minutes:               ' + minutes);
                    console.log('  -- hours:                 ' + hours);
    
                    results17.minutes = results17.minutes + minutes;
                    results17.hours = results17.hours + hours;
                    results17.duration = results17.duration + duration;
                    results17.count = results17.count + 1;


                    let measuresArray17 = Session.get('measuresArray');
                    console.log('measuresArray17', measuresArray17)

                    measuresArray17[6].numerator = parsedResults.total;
                    measuresArray17[6].denominator =  "";
                    measuresArray17[6].score =  (results17.minutes / results17.count).toFixed(0) + ' mins'; // this is just a basic average
          
                    Session.set('measuresArray', measuresArray17);
          
                  }
                }), 50);              
              })  
            }
          }          
        })

        break;
      case "CM.M18":
        console.log('Running algorithm 18')   
        console.log('Door to IV therapy time for diuretic during early stabilization...')


        // so let's set up some counters;
        console.log('Setting up counters...')
        let results18 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        procedureCodes = "80146002"; // IV Therapy (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          // procedureCodes = procedureCodes + ",74016001,168594001,268425006" // Radiology
          //procedureCodes = procedureCodes + ",74016001" // Radiology
          procedureCodes = procedureCodes + ",44608003" // BloodTyping
        }

        let ivTherapyUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        console.log('Generating the ivTherapyUrl...', ivTherapyUrl);

        await Meteor.call("queryEndpoint", ivTherapyUrl, function(error, result){
          if(result){
            let parsedResults = JSON5.parse(result.content);
            console.log('Received ' + parsedResults.total + ' matching procedures.')
            measures[6].numerator = parsedResults.total;
  
            if(parsedResults.entry){
              parsedResults.entry.forEach(async function(procedure){
  
                let ivEncounterUrl = self.data.endpoint +  "/" + get(procedure, 'resource.context.reference') + "?apikey=" + self.data.apiKey;
                console.log('ivEncounterUrl', ivEncounterUrl);
  
                Meteor.setTimeout(await Meteor.call("queryEndpoint", ivEncounterUrl, function(error, result){
                  if(result){
                    let vasoEncounter = JSON5.parse(result.content);
                    console.log('vasoEncounter', vasoEncounter)
                    console.log('vasoProcedure', procedure)
    
                    let encounterStartTime = moment(get(vasoEncounter, 'period.start'));
                    let procedureStartTime = moment(get(procedure, 'resource.performedPeriod.start'));
    
                    console.log('  -- encounter start time:  ' + encounterStartTime);
                    console.log('  -- procedure start time:  ' + procedureStartTime);
    
                    let duration = moment.duration(encounterStartTime.diff(procedureStartTime));
                    console.log('  -- duration:              ' + duration);
    
                    let minutes = duration.asMinutes();
                    let hours = duration.asHours();
    
                    console.log('  -- minutes:               ' + minutes);
                    console.log('  -- hours:                 ' + hours);
    
                    results18.minutes = results18.minutes + minutes;
                    results18.hours = results18.hours + hours;
                    results18.duration = results18.duration + duration;
                    results18.count = results18.count + 1;
  
  
                    let measuresArray18 = Session.get('measuresArray');
                    console.log('measuresArray18', measuresArray18)
  
                    measuresArray18[7].numerator = parsedResults.total;
                    measuresArray18[7].denominator =  "";
                    measuresArray18[7].score =  (results18.minutes / results18.count).toFixed(0) + ' mins'; // this is just a basic average
          
                    Session.set('measuresArray', measuresArray18);
          
                  }
                }), 50);              
              })  
            }
          }
        })
        
        
        break;
      case "CM.M24":
        console.log('Running algorithm 24');
        
        console.log('Observation patients receiving a Cardiology consult...')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results24 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        // procedureCodes = "80146002"; // vasodialator (TBD)

        // if(Session.get('usePseudoCodes')){
        //   console.log('Using psueduo codes.  To disable; please edit the settings file.')
        //   // procedureCodes = procedureCodes + ",74016001,168594001,268425006" // Radiology
        //   procedureCodes = procedureCodes + ",74016001" // Radiology
        //   // procedureCodes = procedureCodes + ",66348005" // Childbirth
        // }

        procedureCodes = "12345678"; // Cardiology Consult (TBD)
        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          procedureCodes = procedureCodes + ",51990-0" // Basic Metabolic Panel
        }

        // search the observation patients
        Encounters.find({'class.code': 'EMERGENCY'}).forEach(function(){
          console.log('encounter.patient', get(encounter, 'subject.reference'));

          let patientIdString = get(encounter, 'subject.reference');
          let patientId = patientIdString.split("/")[1];

          DiagnosticReports.find({"id": patientId}).forEach(function(report){
            console.log('heart failure report: ', report)
          })
          // find the Cardiology Consults
        })


        // let cardioConsultUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        // console.log('Generating the cardioConsultUrl...', cardioConsultUrl);

        // await Meteor.call("queryEndpoint", cardioConsultUrl, function(error, result){
        //   if(result){
        //     let parsedResults = JSON5.parse(result.content);
        //     console.log('Received ' + parsedResults.total + ' matching procedures.')
        //     measures[6].numerator = parsedResults.total;

        //     if(parsedResults.entry){
        //       parsedResults.entry.forEach(async function(procedure){

          
        //       })  
        //     }

        //     let measuresArray24 = Session.get('measuresArray');
        //     console.log('measuresArray24', measuresArray24)

        //     measuresArray24[8].numerator = parsedResults.total;
        //     measuresArray24[8].denominator =  "";
        //     measuresArray24[8].score =  (results18.minutes / results18.count).toFixed(0) + ' mins'; // this is just a basic average
  
        //     Session.set('measuresArray', measuresArray24);
        //   }          
        // })


        break;
      case "CM.M27":
        console.log('Running algorithm 27');
        console.log('Screening completion for CRT/CRT-D during Inpatient level of care stay..')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results27 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        procedureCodes = "80146002"; // CRT/CRT-D (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          procedureCodes = procedureCodes + ",74400008" // Appendicitis
        }

        // search the observation patients
        Encounters.find({'class.code': 'inpatient'}).forEach(function(){
          console.log('encounter.patient', get(encounter, 'subject.reference'));

          let patientIdString = get(encounter, 'subject.reference');
          let patientId = patientIdString.split("/")[1];

          Procedures.find({"id": patientId}).forEach(function(report){
            console.log('heart failure report: ', report)
          })
          // find the Cardiology Consults
        })

        // let crtProcedureUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        // console.log('Generating the crtProcedureUrl...', crtProcedureUrl);

        // await Meteor.call("queryEndpoint", crtProcedureUrl, function(error, result){
        //   if(result){
        //     let parsedResults = JSON5.parse(result.content);
        //     console.log('Received ' + parsedResults.total + ' matching procedures.')
        //     measures[6].numerator = parsedResults.total;

        //     if(parsedResults.entry){
        //       parsedResults.entry.forEach(async function(procedure){
                         
        //       })  
        //     }
        //   }          
        // })   

        break;
      case "CM.M28c":
        console.log('Running algorithm 28');
        console.log('Documented daily weight complete....')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results28 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        procedureCodes = "80146002"; // vasodialator (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          procedureCodes = procedureCodes + ",74016001" // Radiology
        }

        let dailyWeightUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        console.log('Generating the dailyWeightUrl...', dailyWeightUrl);

        await Meteor.call("queryEndpoint", dailyWeightUrl, function(error, result){
          if(result){
            let parsedResults = JSON5.parse(result.content);
            console.log('Received ' + parsedResults.total + ' matching procedures.')
            measures[6].numerator = parsedResults.total;

            if(parsedResults.entry){
              parsedResults.entry.forEach(async function(procedure){
                         
              })  
            }
          }          
        })        
        break;
      case "CM.M29":
        console.log('Running algorithm 29');
        console.log('Cardiology consult...')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results29 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }


        procedureCodes = "12345678"; // Cardiology Consult (TBD)
        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          procedureCodes = procedureCodes + ",51990-0" // Basic Metabolic Panel
        }


        let cardiologyConsultUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        console.log('Generating the cardiologyConsultUrl...', cardiologyConsultUrl);

        await Meteor.call("queryEndpoint", cardiologyConsultUrl, function(error, result){
          if(result){
            let parsedResults = JSON5.parse(result.content);
            console.log('Received ' + parsedResults.total + ' matching procedures.')
            measures[6].numerator = parsedResults.total;

            if(parsedResults.entry){
              parsedResults.entry.forEach(async function(procedure){
                         
              })  
            }

            // let measuresArray18 = Session.get('measuresArray');
            // console.log('measuresArray18', measuresArray18)

            // measuresArray18[7].numerator = parsedResults.total;
            // measuresArray18[7].denominator =  "";
            // measuresArray18[7].score =  (results18.minutes / results18.count).toFixed(0) + ' mins'; // this is just a basic average
  
            // Session.set('measuresArray', measuresArray18);
          }          
        })           
        break;
      case "CM.M31":
        console.log('Running algorithm 31')           
        console.log('Daily assessment of renal and electrolyte function. Proportion of patients having documented daily assessment of electrolytes and renal function...')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results31 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        procedureCodes = "80146002"; // vasodialator (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          procedureCodes = procedureCodes + ",74016001" // Radiology
        }

        let renalAssessmentUrl = self.data.endpoint +  "/Procedure?code=" + procedureCodes + "&" + dateQuery + "&_count=1000&apikey=" + self.data.apiKey;
        console.log('Generating the renalAssessmentUrl...', renalAssessmentUrl);

        await Meteor.call("queryEndpoint", renalAssessmentUrl, function(error, result){
          if(result){
            let parsedResults = JSON5.parse(result.content);
            console.log('Received ' + parsedResults.total + ' matching procedures.')
            measures[6].numerator = parsedResults.total;

            if(parsedResults.entry){
              parsedResults.entry.forEach(async function(procedure){
                         
              })  
            }
          }          
        })
        break;                                        
      default:
        break;
    }

    Session.set('measuresArray', measures);
  }
  relayAction(identifier, foo, bar){
    console.log('runAction', identifier)
  }
  changeEndDate(foo, date){
    console.log('changeEndDate', date)
    if(date){
      Session.set('end_date', moment(date).format('YYYY-MM-DD'));
    }
  }
  changeStartDate(foo, date){
    console.log('changeStartDate', date)
    if(date){
      Session.set('start_date', moment(date).format('YYYY-MM-DD'));
    }
  }
  render() {
    let tableRows = [];
    for (var i = 0; i < this.data.measures.length; i++) {

      let rowStyle = {
        cursor: 'pointer',
        textAlign: 'left'
      }

      let styles = {
        row: {
          cursor: 'pointer',
          textAlign: 'left'  
        },
        actionButton: {
          height: '24px',
          lineHeight: '24px'
        }
      }

      tableRows.push(
        <tr key={i} className="patientRow" style={rowStyle} onClick={ this.rowClick.bind(this, this.data.measures[i]._id)} >
          <td><FlatButton style={ styles.actionButton } onClick={this.runAction.bind(this, this.data.measures[i].identifier)} >Run</FlatButton></td>
          <td>{this.data.measures[i].identifier }</td>
          <td>{this.data.measures[i].description }</td>
          <td>{ this.data.measures[i].numerator }</td>
          <td>{ this.data.measures[i].denominator }</td>
          <td>{ this.data.measures[i].score }</td>
          <td>{ this.data.measures[i].passfail }</td>
          <td><FlatButton style={ styles.actionButton } onClick={this.relayAction.bind(this, this.data.measures[i].identifier)} >Relay</FlatButton></td>
        </tr>
      );
    }

    let codeSection;

    if(this.data.showJson){
      codeSection = <pre style={{height: '200px', backgroundColor: "#eeeeee", border: '1px dashed gray', padding: '10px', marginTop: '10px', marginBottom: '10px'}}>
        { JSON5.stringify(this.data.displayText, null, ' ')  }
      </pre>
    }


    return (
      <div id='indexPage'>
        <FullPageCanvas>
          <GlassCard height='auto'>
            <CardTitle 
              title="Cardiac Accreditation Scorecard" 
              subtitle={ this.data.endpoint + this.data.fhirQueryUrl + this.data.apiKey }
              style={{fontSize: '100%'}} />
            <CardText style={{fontSize: '100%'}}>



             <hr />
             <DatePicker defaultDate={ new Date("2018", "07", "01") } hintText="Start" mode="landscape" className='start_date' name='start_date' style={{width: '200px', marginRight: '80px', float: 'left'}} onChange={this.changeStartDate.bind(this)} />
             <DatePicker defaultDate={ new Date("2018", "07", "01") } hintText="End" mode="landscape" className='end_date' name='end_date' style={{width: '200px', marginRight: '80px', float: 'left'}} onChange={this.changeEndDate.bind(this)} />

             {/* <RaisedButton label="§ Heartfailure Encounters" onClick={this.queryHeartfailureEncounters.bind(this)} style={{marginRight: '20px'}} />              */}

              <div style={{width: '100%'}}>
                {/* <RaisedButton disabled label="Metadata" onClick={this.fetchMetadata.bind(this, client)} style={{marginRight: '20px'}} />      
                <RaisedButton disabled label="Show JSON" onClick={this.toggleDisplayJson.bind(this)} style={{marginRight: '20px'}} />

                <RaisedButton disabled label="§ Patients" onClick={this.queryPatients.bind(this)} style={{marginRight: '20px'}} />             
                <RaisedButton disabled label="§ Patient Stats" onClick={this.queryPatientStats.bind(this)} style={{marginRight: '20px'}} />             

                <RaisedButton disabled label="§ Heartfailure Patients" onClick={this.queryHeartfailurePatients.bind(this)} style={{marginRight: '20px'}} />              */}

                <RaisedButton label="1. Fetch Encounters" onClick={this.queryAllEncountersForDaterange.bind(this)} style={{marginRight: '20px'}} />                             
                <RaisedButton label="2. Parse Encounters" onClick={this.parseEncounters.bind(this)} style={{marginRight: '20px'}} />                             
                <RaisedButton label="3. Find Heartfailures" onClick={this.findHeartfailuresInEncounters.bind(this)} style={{marginRight: '20px'}} />                             
              </div>



             <hr />
         
             <div style={{width: '100%', height: '60px', position: 'absolute'}}>
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.total') } 
                  subtitle="Encounters (Total)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.inpatients') } 
                  subtitle="§ Inpatients"
                  style={{fontSize: '100%', float: 'left', width: '180px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.observations') } 
                  subtitle="§ Observational"
                  style={{fontSize: '100%', float: 'left', width: '180px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.ambulatory') } 
                  subtitle="§ Ambulatory"
                  style={{fontSize: '100%', float: 'left', width: '180px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.emergency') } 
                  subtitle="§ Emergency"
                  style={{fontSize: '100%', float: 'left', width: '180px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.discharged') } 
                  subtitle="§ Discharged Date"
                  style={{fontSize: '100%', float: 'left', width: '180px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.discharged_with_heartfailure') } 
                  subtitle="$ Heartfailure Reasons"
                  style={{fontSize: '100%', float: 'left', width: '180px'}} 
                />  
             </div>
             <div style={{width: '100%', height: '60px', position: 'relative'}}>              
             <CardTitle 
                  title={ get(this, 'data.totals.documentReferences.total') } 
                  subtitle="Document References"
                  style={{fontSize: '100%', float: 'right', width: '180px'}} 
                />                                
              <CardTitle 
                  title={ get(this, 'data.totals.diagnosticReports.total') } 
                  subtitle="Diagnostic Reports"
                  style={{fontSize: '100%', float: 'right', width: '180px'}} 
                />    
              <CardTitle 
                  title={ get(this, 'data.totals.observations.total') } 
                  subtitle="Observations"
                  style={{fontSize: '100%', float: 'right', width: '180px'}} 
                />                
              <CardTitle 
                  title={ get(this, 'data.totals.procedures.total') } 
                  subtitle="Procedures"
                  style={{fontSize: '100%', float: 'right', width: '180px'}} 
                />                
              <CardTitle 
                  title={ get(this, 'data.totals.patients.total') } 
                  subtitle="Patients"
                  style={{fontSize: '100%', float: 'right', width: '180px'}} 
                />                
             </div>
            <br />

             {/* <RaisedButton label="Query Endoscopy" onClick={this.queryEndoscopy.bind(this)} style={{marginRight: '20px'}} />             
             <RaisedButton label="Query Echocardiograms" onClick={this.queryEchocardiograms.bind(this)} style={{marginRight: '20px'}} />
             <RaisedButton label="Query Angiography" onClick={this.queryAngiography.bind(this)} style={{marginRight: '20px'}} />
             <RaisedButton label="Query Cardiac MRIs" onClick={this.queryCardiacMris.bind(this)} /><br /><br /> */}


              { codeSection }
              
              <Table hover style={{position: 'relative', top: '100px'}}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Identifier</th>
                    <th>Measure Description</th>
                    <th>Numerator</th>
                    <th>Denominator</th>
                    <th>Score</th>
                    <th>Pass / Fail</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  { tableRows }
                </tbody>
              </Table>
 
            </CardText>
          </GlassCard>
        </FullPageCanvas>
      </div>
    );
  }




  openLink(url){
    console.log("openLink", url);
    browserHistory.push(url);
  }
}



ReactMixin(AccreditationScorecardPage.prototype, ReactMeteorData);

export default AccreditationScorecardPage;