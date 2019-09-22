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
  identifier: "CM.M21a",
  description: "Patients receiving documented medication reconciliation.",
  score: 0
}, {
  identifier: "CM.M24",
  description: "Patients receiving Cardiology Consult during Observation level of care.",
  score: 0
}, {
  identifier: "CM.M27",
  description: "Screening completion for cardiac resynchronization therapy CRT/CRT-D during Inpatient level of care stay.",
  score: 0
}, {
  identifier: "CM.M28a",
  description: "Documented daily physical exam.",
  score: 0
}, {
  identifier: "CM.M28b",
  description: "Documented daily assessment of intake/outtake (I/O).",
  score: 0
}, {
  identifier: "CM.M28c",
  description: "Documented daily weight complete.",
  score: 0
}, {
  identifier: "CM.M29",
  description: "Patients receiving Cardiology Consult during Inpatient level of care.",
  score: 0
}, {
  identifier: "CM.M31",
  description: "Daily assessment of renal and electrolyte function.   Proportion of patients having documented daily assessment of electrolytes and renal function. ",
  score: 0
}]);


Session.setDefault('usePseudoCodes', get(Meteor, 'settings.public.accreditation.usePseudoCodes'));


Session.setDefault('activeMeasure', {});
Session.setDefault('showJson', false);
Session.setDefault('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=112790001');

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


let apiKey = get(Meteor, 'settings.public.interfaces.default.auth.username', '');
let usePseudoCodes = get(Meteor, 'settings.public.accreditation.usePseudoCodes', false);
let fhirBaseUrl = get(Meteor, 'settings.public.interfaces.default.channel.endpoint', false);

spliceId = function(input){
  // console.log('spliceId.input', input)
  if(input){
    let spliced = input.split('/');
    if(spliced.length > 0){
      return spliced[1];
    }
  } else {
    return false;
  }
}
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
  isFhirServerThatRequiresApiKey(){
    if(["https://syntheticmass.mitre.org/v1/fhir"].includes(get(Meteor, 'settings.public.interfaces.default.channel.endpoint'))){
      return true;
    } else {
      return false
    }
  }
  async queryEndpoint(scope, modality){

    let localizedFhirQueryUrl = scope.data.fhirQueryUrl;
    if(this.isFhirServerThatRequiresApiKey()){
      localizedFhirQueryUrl = localizedFhirQueryUrl + '&apikey=' + scope.data.apiKey;
    }
    console.log('localizedFhirQueryUrl', localizedFhirQueryUrl)
    console.log('queryEndpoint', scope.data.endpoint + localizedFhirQueryUrl )

    await Meteor.call("queryEndpoint", scope.data.endpoint + localizedFhirQueryUrl, function(error, result){
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
  queryPatients(){
    console.log('queryPatients')
    Session.set('fhirQueryUrl', '/Patient');
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
    let encounterReasonCodes = "84114007,161505003";  // Heart failure

    if(get(Meteor, 'settings.public.accreditation.encounterReasonCodes')){
      encounterReasonCodes = get(Meteor, 'settings.public.accreditation.encounterReasonCodes');
    }

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      encounterReasonCodes = encounterReasonCodes + ",74400008,72892002" // Appendicitis, Normal Pregnancy
    }

    let apiKeySuffix = '';
    if(this.isFhirServerThatRequiresApiKey()){
      apiKeySuffix = '&apikey=' + this.data.apiKey;
    }

    if(Session.equals('fhirVersion') === "R4"){
      // R4
      heartfailureEncounterUrl = this.data.endpoint + '/Encounter?reason-code=' + encounterReasonCodes + '&' + dateQuery + '_count=1000' + apiKeySuffix;
    } else {
      // STU3
      heartfailureEncounterUrl = this.data.endpoint + '/Encounter?reason=' + encounterReasonCodes + '&' + dateQuery + '_count=1000' + apiKeySuffix;
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
        // DSTU2
        if(get(entry, 'resource.class') === "ambulatory"){
          encounters_ambulatory_with_heartfailure++;
        }
        if(["daytime", "home", "other"].includes(get(entry, 'resource.class'))){
          encounters_observational_with_heartfailure++;
        }
        if(get(entry, 'resource.class') === "emergency"){
          encounters_emergency_with_heartfailure++;
        }
        if(get(entry, 'resource.class') === "inpatient"){
          encounters_inpatients_with_heartfailure++;
        }

        // STU3
        if(get(entry, 'resource.class.code') === "ambulatory"){
          encounters_ambulatory_with_heartfailure++;
        }
        if(["daytime", "home", "other"].includes(get(entry, 'resource.class.code'))){
          encounters_observational_with_heartfailure++;
        }
        if(get(entry, 'resource.class.code') === "emergency"){
          encounters_emergency_with_heartfailure++;
        }
        if(get(entry, 'resource.class.code') === "inpatient"){
          encounters_inpatients_with_heartfailure++;
        }
        console.log('encounter', get(entry, 'resource'));
        Encounters._collection.insert(get(entry, 'resource'));
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

    let apiKeySuffix = '';
    if(this.isFhirServerThatRequiresApiKey()){
      apiKeySuffix = '&apikey=' + this.data.apiKey;
    }

    let encounterReasonCodes = "84114007,161505003";  // Heart failure

    if(get(Meteor, 'settings.public.accreditation.encounterReasonCodes')){
      encounterReasonCodes = get(Meteor, 'settings.public.accreditation.encounterReasonCodes');
    }

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      encounterReasonCodes = encounterReasonCodes + ",74400008,72892002" // Appendicitis, Normal Pregnancy
    }

    if(Session.equals('fhirVersion') === "R4"){
      // R4
      heartfailureUrl = this.data.endpoint + '/Patient?_has:Encounter:reason-code=' + encounterReasonCodes + '&' + dateQuery + '_count=1000' + apiKeySuffix;      
    } else {
      // STU3
      heartfailureUrl = this.data.endpoint + '/Patient?_has:Encounter:reason=' + encounterReasonCodes + '&' + dateQuery + '_count=1000' + apiKeySuffix;      
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

    let apiKeySuffix = '';
    if(this.isFhirServerThatRequiresApiKey()){
      apiKeySuffix = '&apikey=' + this.data.apiKey;
    }

    // https://www.hl7.org/fhir/v3/ActEncounterCode/vs.html

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=IMP&_count=1000' + apiKeySuffix, function(error, result){
      let parsedResults = JSON5.parse(result.content);
      console.log('Inpatients:  ', parsedResults)
      Session.set('encounter_observational', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=AMB&_count=1000' + apiKeySuffix, function(error, result){
      let parsedResults = JSON5.parse(result.content);
      console.log('Ambulatory:  ', parsedResults)
      Session.set('encounter_inpatient', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=OBSENC&_count=1000' + apiKeySuffix, function(error, result){
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

    let apiKeySuffix = '';
    if(this.isFhirServerThatRequiresApiKey()){
      apiKeySuffix = '&apikey=' + this.data.apiKey;
    }

    let encounterUrl = this.data.endpoint + '/Encounter?' + dateQuery + '&_count=1000' + apiKeySuffix;

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
      // STU3
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

      // DSTU2
      switch (get(encounter, 'class')) {
        case "ambulatory":
          dstu2.ambulatory++;
          break;
        case "emergency":
          dstu2.emergency++;
          break;
        case "daytime":
          dstu2.observation_encounter++;
          break;
        case "field":
          dstu2.field++;
          break;
        case "other":
          dstu2.observation_encounter++;              
          break;
        case "inpatient":
          dstu2.inpatient_encounter++;
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

    let heartfailureCount = 0;

    let encounterReasonCodes = [
      "84114007",
      "161505003", 
      "88805009"  // Chronic congestive heart failure (disorder)
    ];  // Heart failure

    if(get(Meteor, 'settings.public.accreditation.encounterReasonCodes')){
      encounterReasonCodes = get(Meteor, 'settings.public.accreditation.encounterReasonCodes');
    }

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      encounterReasonCodes.push("74400008"); // Appendicitis
      encounterReasonCodes.push("72892002"); // Normal Pregnancy

    }

    Encounters.find({'reason.coding.code': {$in: encounterReasonCodes }}).forEach(function(encounter){
      heartfailureCount++;
    })

    Session.set('encounters_discharged_with_heartfailure', heartfailureCount);
  }
  rowClick(id){
    //console.log('rowClick', id)
  }
  async runAction(identifier, foo, bar){
    //console.log('runAction', identifier)

    let self = this;

    let measures12a;

    let measures;
    let encounters_with_heartfailure = Session.get('encounters_with_heartfailure');

    let dateQuery = this.generateDateQuery();    
    let procedureCodes;

    let lengthOfStay;
    let totalObservations;
    let encounterUrl;


    let encounterReasonCodes = ["12345678"];  // Heart failure

    if(get(Meteor, 'settings.public.accreditation.encounterReasonCodes')){
      encounterReasonCodes = get(Meteor, 'settings.public.accreditation.encounterReasonCodes');
    }

    if(Session.get('usePseudoCodes')){
      console.log('Using psueduo codes.  To disable; please edit the settings file.')
      encounterReasonCodes.push("74400008"); // Appendicitis
      encounterReasonCodes.push("72892002"); // Normal Pregnancy
    }

    console.log('Searching for reason code ' + encounterReasonCodes)

    switch (identifier) {
      case "CM.M1":
        console.log('Running algorithm 1')   

        let measures1 = Session.get('measuresArray');

        measures1[0].numerator = Encounters.find({$and: [
          {'class.code': 'emergency'},
          {'reason.coding.code': {$in: encounterReasonCodes }}
        ]}).count();

        measures1[0].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures1[0].score =  ((measures1[0].numerator /  measures1[0].denominator) * 100).toFixed(2) + '%';

        Session.set('measuresArray', measures1);

        break;
      case "CM.M2":
        console.log('Running algorithm 2')      

        let measures2 = Session.get('measuresArray');

        measures2[1].numerator = Encounters.find({$and: [
          {'class.code': 'inpatient'},
          {'reason.coding.code': {$in: encounterReasonCodes }}
        ]}).count();

        // measures2[1].numerator = encounters_with_heartfailure.inpatient;
        measures2[1].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures2[1].score =  ((measures2[1].numerator /  measures2[1].denominator) * 100).toFixed(2) + '%';

        Session.set('measuresArray', measures2);

        break;
      case "CM.M12a":
        console.log('Running algorithm 12a')
        console.log('Trying to find the number of Echocardiograms and Cardiac MRIs procedures...')

        // trying to find the number of Echocardiograms and Cardiac MRIs procedures

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results12a = {
          echocardiogramCount: 0,
          cardiacMriCount: 0,
          mixedCount: 0
        }

        // we also want to clear the Procedures collection, where we'll be storing the resources
        console.log('Removing procedures...')
        // Procedures.remove({});

        // lets determine the procedure list to query
        let cardiacEchoProcedureList = ["40701008","241620005"];  // Cardiac MRI, Echocardiograph
        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          cardiacEchoProcedureList.push("80146002") // Appendectomy
        }
        console.log('Generated procedure list to search for', cardiacEchoProcedureList)

        // we begin looping through each of the encounters
        Encounters.find({$and: [
          {'class.code': 'inpatient'},
          {'reason.coding.code': {$in: encounterReasonCodes }}
        ]}).forEach(async function(encounter){
          console.log('Parsing an encounter...', get(encounter, 'id'));

          //if(get(encounter, 'subject.reference')){

            Procedures.find({$and: [
              {'context.reference': 'Encounter/' + get(encounter, 'id')},
              {'code.coding.code': {$in: cardiacEchoProcedureList }}
            ]}).forEach(function(procedure){
              console.log('Found a procedure matching the encounter...', get(encounter, 'subject.reference'), encounter);

              if(["40701008"].includes(get(procedure, 'code.coding[0].code'))){
                console.log('Found a valid echocardiogram...')                  
                results12a.echocardiogramCount++;
              }
              if(["241620005"].includes(get(procedure, 'code.coding[0].code'))){
                  console.log('Found a valid Cardiac MRI...')                  
                results12a.cardiacMriCount++;
              }

              if(cardiacEchoProcedureList.includes(get(procedure, 'code.coding[0].code'))){
                results12a.mixedCount++;
              }

              let measures12a = Session.get('measuresArray');

              measures12a[2].numerator = results12a.mixedCount;
              measures12a[2].denominator =  Encounters.find({$and: [
                {'class.code': 'inpatient'},
                {'reason.coding.code': {$in: encounterReasonCodes }}
              ]}).count();
              measures12a[2].score =  ((measures12a[2].numerator /  measures12a[2].denominator) * 100).toFixed(2) + '%';
      
              measures12a[3].numerator = results12a.echocardiogramCount;
              measures12a[3].denominator =  Encounters.find({$and: [
                {'class.code': 'inpatient'},
                {'reason.coding.code': {$in: encounterReasonCodes }}
              ]}).count();
              measures12a[3].score =  ((measures12a[3].numerator /  measures12a[3].denominator) * 100).toFixed(2) + '%';
      
              measures12a[4].numerator = results12a.cardiacMriCount;
              measures12a[4].denominator =  Encounters.find({$and: [
                {'class.code': 'inpatient'},
                {'reason.coding.code': {$in: encounterReasonCodes }}
              ]}).count();
              measures12a[4].score =  ((measures12a[4].numerator /  measures12a[4].denominator) * 100).toFixed(2) + '%';
      
              console.log('measures12a', measures12a)
              Session.set('measuresArray', measures12a); 
            })
        });


        break;
      case "CM.M12b":
        // console.log('Running algorithm 12b')      
        // measures[3].numerator = 0;
        // measures[3].denominator =  encounters_with_heartfailure.inpatient;
        // measures[3].score =  ((measures[3].numerator /  measures[3].denominator) * 100).toFixed(2) + '%';

        // this.queryCardiacMris();         
        break;
      case "CM.M12c":
        // console.log('Running algorithm 12c')  

        // measures[4].numerator = 0;
        // measures[4].denominator =  encounters_with_heartfailure.inpatient;
        // measures[4].score =  ((measures[4].numerator /  measures[4].denominator) * 100).toFixed(2) + '%';

        // this.queryEndoscopy();         
        break;
      case "CM.M15":
        console.log('Running algorithm 15')                    
        console.log('Door to ECG time Median time from arrival to ECG performed.s...')

        let measuresArray15;

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results15 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        let procedureCodes = ["169690007"];  // ECG (TBD)
        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          procedureCodes.push("80146002"); // Appendectomy
        }

        console.log('procedureCodes', procedureCodes)


        Procedures.find({'code.coding.code': {$in: procedureCodes }}).forEach(async function(procedure){

          let encounterUrl = fhirBaseUrl + '/'+ get(procedure, 'context.reference') + '?apikey=' + apiKey;
          await Meteor.call("queryEndpoint", encounterUrl, function(error, result){
            if(error){
              console.log('error', error)
            }
            if(result){
              // received some data
              console.log('result', result)
              let encounter = JSON5.parse(result.content);
              if(encounter){            
                console.log('procedure', procedure)
                console.log('encounter', encounter)

                if(encounter){
                  let encounterStartTime = moment(get(encounter, 'period.start'));
                  let procedureStartTime = moment(get(procedure, 'performedPeriod.start'));
      
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
      
      
                  // updating measures
                  let measuresArray15 = Session.get('measuresArray');
          
                  measuresArray15[5].numerator = results15.minutes.toFixed(0);
                  measuresArray15[5].denominator =  results15.count;
          
                  // we don't want to divide by 0
                  if(results15.count > 0){
                    measuresArray15[5].score =  (results15.minutes / results15.count).toFixed(0) + ' mins'; // this is just a basic average
                  } else {
                    measuresArray15[5].score =  '0 mins'; 
                  }
          
                  console.log('measuresArray15', measuresArray15)
                  Session.set('measuresArray', measuresArray15);
                }
              }
            }
          });
        })

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

        let nitroglycerinProcedureCodes = ["12345678"]; // nitroglycerin (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          nitroglycerinProcedureCodes.push("74016001") // Radiology
        }

        Procedures.find({'code.coding.code': {$in: nitroglycerinProcedureCodes }}).forEach(async function(procedure){

          let encounterUrl = fhirBaseUrl + '/'+ get(procedure, 'context.reference') + '?apikey=' + apiKey;
          await Meteor.call("queryEndpoint", encounterUrl, function(error, result){
            if(error){
              console.log('error', error)
            }
            if(result){
              // received some data

              console.log('result', result)
              let encounter = JSON5.parse(result.content);
              if(encounter){            
                console.log('procedure', procedure)
                console.log('encounter', encounter)
    
                let encounterStartTime = moment(get(encounter, 'period.start'));
                let procedureStartTime = moment(get(procedure, 'performedPeriod.start'));
    
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
    
                // updating measures
                let measuresArray17 = Session.get('measuresArray');
        
                measuresArray17[6].numerator = results17.minutes.toFixed(0);
                measuresArray17[6].denominator = results17.count;
        
                // we don't want to divide by 0
                if(results17.count > 0){
                  measuresArray17[6].score =  (results17.minutes / results17.count).toFixed(0) + ' mins'; // this is just a basic average
                } else {
                  measuresArray17[6].score =  '0 mins'; 
                }
        
                console.log('measuresArray17', measuresArray17)
                Session.set('measuresArray', measuresArray17);

              }
            }
          })
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

        let ivTherapyProcedureCodes = ["12345678"]; // IV Therapy (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          ivTherapyProcedureCodes.push("44608003") // BloodTyping
        }

                // 428191000124101 // Documentation of current medications

        Procedures.find({'code.coding.code': {$in: ivTherapyProcedureCodes }}).forEach(async function(procedure){

          let encounterUrl = fhirBaseUrl + '/'+ get(procedure, 'context.reference') + '?apikey=' + apiKey;
          await Meteor.call("queryEndpoint", encounterUrl, function(error, result){
            if(error){
              console.log('error', error)
            }
            if(result){
              // received some data

              console.log('result', result)
              let encounter = JSON5.parse(result.content);
              if(encounter){            
                console.log('procedure', procedure)
                console.log('encounter', encounter)

                let encounterStartTime = moment(get(encounter, 'period.start'));
                let procedureStartTime = moment(get(procedure, 'performedPeriod.start'));

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

                // updating measures
                let measuresArray18 = Session.get('measuresArray');
        
                measuresArray18[7].numerator = results18.minutes.toFixed(0);
                measuresArray18[7].denominator =  results18.count;
        
                // we don't want to divide by 0
                if(results18.count > 0){
                  measuresArray18[7].score =  (results18.minutes / results18.count).toFixed(0) + ' mins'; // this is just a basic average
                } else {
                  measuresArray18[7].score =  '0 mins'; 
                }
        
                console.log('measuresArray18', measuresArray18)
                Session.set('measuresArray', measuresArray18);
              }
            }
          });
        })

        break;
      case "CM.M21a":
          console.log('Running algorithm 18')   
          console.log('Door to IV therapy time for diuretic during early stabilization...')
  
  
          // so let's set up some counters;
          console.log('Setting up counters...')
          let results21a = {
            duration: 0,
            hours: 0,
            minutes: 0,
            count: 0
          }
  
          let medicationRecProcedures = ["428191000124101"]; // Documentation of current medications
  
          if(Session.get('usePseudoCodes')){
            console.log('Using psueduo codes.  To disable; please edit the settings file.')
            medicationRecProcedures.push("44608003") // BloodTyping
          }

          console.log('medicationRecProcedures', medicationRecProcedures)

          let medrecCount = 0;
          let hasMedRec = false;
          Encounters.find({'reason.coding.code': {$in: encounterReasonCodes }}).forEach(function(encounter){
            hasMedRec = false;

            Procedures.find({$and: [
              {'code.coding.code': {$in: medicationRecProcedures }},
              {'subject.reference': get(encounter, 'subject.reference')}
            ]}).forEach(function(procedure){
              hasMedRec = true;
            });      
            
            if(hasMedRec){
              medrecCount++
            }
          })

          let measures21a = Session.get('measuresArray');

          measures21a[8].numerator = medrecCount;
          measures21a[8].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
          measures21a[8].score =  ((measures21a[8].numerator /  measures21a[8].denominator) * 100).toFixed(2) + '%';

          Session.set('measuresArray', measures21a);

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

        let cardioConsultProcedureCodes = ["12345678"]; // Cardiology Consult (TBD)
        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          cardioConsultProcedureCodes.push("51990-0") // Basic Metabolic Panel
        }

        console.log('cardioConsultProcedureCodes', cardioConsultProcedureCodes)

        Encounters.find({$and: [
          {'class.code': 'emergency'},
          {'reason.coding.code': {$in: encounterReasonCodes }}
        ]}).forEach(function(encounter){
          console.log('encounter', encounter)
        });

        let measures24 = Session.get('measuresArray');
          measures24[9].numerator = 0;
          measures24[9].denominator = Encounters.find({$and: [
            {'class.code': 'emergency'},
            {'reason.coding.code': {$in: encounterReasonCodes }}
          ]}).count();
          measures24[9].score =  ((measures24[9].numerator /  measures24[9].denominator) * 100).toFixed(2) + '%';
        Session.set('measuresArray', measures24);

        break;
      case "CM.M27":
        console.log('Running algorithm 27');
        console.log('Screening completion for cardiac resynchronization therapy CRT/CRT-D during Inpatient level of care stay.')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results27 = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        let cardiacResyncProcedureCodes = ["80146002"]; // CRT/CRT-D (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          cardiacResyncProcedureCodes.push("74400008"); // Appendicitis
        }

        console.log('cardiacResyncProcedureCodes', cardiacResyncProcedureCodes)

        // // search the observation patients
        // Encounters.find({'class.code': 'inpatient'}).forEach(function(encounter){
        //   console.log('encounter.patient', get(encounter, 'subject.reference'));

        //   let patientIdString = get(encounter, 'subject.reference');
        //   // let patientId = patientIdString.split("/")[1];

        //   // console.log('patientId', patientId)

        //   Procedures.find({"subject": patientIdString}).forEach(function(procedure){
        //     console.log('heart failure procedure: ', procedure);
        //   })
        //   // find the Cardiology Consults
        // })

        let cardiacResyncCount = 0;
        Procedures.find({'code.coding.code': {$in: cardiacResyncProcedureCodes }}).forEach(function(procedure){
          // console.log('procedure', procedure)
          cardiacResyncCount++;
        });

        let measures27 = Session.get('measuresArray');

        measures27[10].numerator = cardiacResyncCount;

        // measures27[10].numerator = encounters_with_heartfailure.inpatient;
        measures27[10].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures27[10].score =  ((measures27[10].numerator /  measures27[10].denominator) * 100).toFixed(2) + '%';

        Session.set('measuresArray', measures27);

        break;
      case "CM.M28a":
        console.log('Running algorithm 28a');
        console.log('Documented physical exam complete....')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results28a = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        let physicalExamProcedureCodes = ["5880005"]; // Physical Exam

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          physicalExamProcedureCodes.push("74016001") // Knee X-Ray
        }
  
        console.log('physicalExamProcedureCodes', physicalExamProcedureCodes);

        lengthOfStay = 1;
        totalObservations = 0;
        let patientsWithDailyExam = 0;

        Encounters.find({$and: [
          {'class.code': 'emergency'},
          {'reason.coding.code': {$in: encounterReasonCodes }}
        ]}).forEach(function(encounter){
          console.log('encounter', encounter)

          Procedures.find({'context.reference': 'Encounter/' + get(encounter, 'id')}).forEach(function(procedure){
            console.log('procedure', procedure)
            console.log('encounter (count my days)', encounter);  // https://momentjs.com/docs/#/displaying/difference/
          })
        });

          
        let measures28a = Session.get('measuresArray');
          measures28a[11].numerator = patientsWithDailyExam;
          measures28a[11].denominator = Encounters.find({$and: [
            {'class.code': 'inpatient'},
            {'reason.coding.code': {$in: encounterReasonCodes }}
          ]}).count();
          measures28a[11].score =  ((measures28a[11].numerator /  measures28a[11].denominator) * 100).toFixed(2) + '%';
        Session.set('measuresArray', measures28a);
        break;
      case "CM.M28b":
        console.log('Running algorithm 28b');
        console.log('Documented daily assessment of intake/outtake (I/O).....')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results28b = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        let ioProcedureCodes = ["12345678"]; // intake/outtake (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          ioProcedureCodes.push("76601001") // Radiology
        }

        lengthOfStay = 1;
        totalObservations = 0;
        let patientsWithDailyIo = 0;

        Procedures.find({'code.coding.code': {$in: ioProcedureCodes }}).forEach(function(observation){
          console.log('observation', observation);
        })
        
        let measures28b = Session.get('measuresArray');
          measures28b[12].numerator = patientsWithDailyIo;
          measures28b[12].denominator = Encounters.find({$and: [
            {'class.code': 'inpatient'},
            {'reason.coding.code': {$in: encounterReasonCodes }}
          ]}).count();
          measures28b[12].score =  ((measures28b[12].numerator /  measures28b[12].denominator) * 100).toFixed(2) + '%';
        Session.set('measuresArray', measures28b);
        break;
      case "CM.M28c":
        console.log('Running algorithm 28c');
        console.log('Documented daily weight complete....')

        // so let's set up some counters;
        console.log('Setting up counters...')
        let results28c = {
          duration: 0,
          hours: 0,
          minutes: 0,
          count: 0
        }

        let weightProcedureCodes = ["29463-7"]; // vasodialator (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          weightProcedureCodes.push("39156-5") // Radiology
        }

        console.log('weightProcedureCodes', weightProcedureCodes)

        lengthOfStay = 1;
        totalObservations = 0;
        let patientsWithDailyWeights = 0;

        Encounters.find({$and: [
          {'class.code': 'inpatient'},
          {'reason.coding.code': {$in: encounterReasonCodes }}
        ]}).forEach(function(encounter){
          console.log('encounter', encounter)

          Observations.find({'context.reference': 'Encounter/' + get(encounter, 'id')}).forEach(function(observation){
            console.log('observation', observation)
          })
        })

        // Observations.find({'code.coding.code': {$in: weightProcedureCodes }}).forEach(function(observation){
        //   console.log('observation', observation);
        //   console.log('encounter', encounter);
        // })

        let measures28c = Session.get('measuresArray');
          measures28c[13].numerator = patientsWithDailyWeights;
          measures28c[13].denominator = Encounters.find({$and: [
            {'class.code': 'inpatient'},
            {'reason.coding.code': {$in: encounterReasonCodes }}
          ]}).count()
          measures28c[13].score =  ((measures28c[13].numerator /  measures28c[13].denominator) * 100).toFixed(2) + '%';
        Session.set('measuresArray', measures28c);
            
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

        let cardioConsultInpatientCodes = ["12345678"]; // Cardiology Consult (TBD)
        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          cardioConsultInpatientCodes.push("180325003") // Basic Metabolic Panel
        }

        console.log('cardioConsultInpatientCodes', cardioConsultInpatientCodes)

        let cardioConsultCount = 0;
        Procedures.find({'code.coding.code': {$in: cardioConsultInpatientCodes }}).forEach(function(procedure){
          console.log('procedure', procedure)
          cardioConsultCount++
        });

        console.log('cardioConsultCount', cardioConsultCount)

        let measures29 = Session.get('measuresArray');
          measures29[14].numerator = cardioConsultCount;
          measures29[14].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
          measures29[14].score =  ((measures29[14].numerator /  measures29[14].denominator) * 100).toFixed(2) + '%';
        Session.set('measuresArray', measures29);

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

        let renalProcedureCodes = ["12345678"]; // renal function (TBD)

        if(Session.get('usePseudoCodes')){
          console.log('Using psueduo codes.  To disable; please edit the settings file.')
          renalProcedureCodes.push("777-3") // Platelets
        }

        console.log('renalProcedureCodes', renalProcedureCodes)

        let renalCount = 0;
        Observations.find({'code.coding.code': {$in: renalProcedureCodes }}).forEach(function(procedure){
          console.log('procedure', procedure)
          renalCount++;
        });

        console.log('renalCount', renalCount);

        let measures31 = Session.get('measuresArray');
          measures31[15].numerator = renalCount;
          measures31[15].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
          measures31[15].score =  ((measures31[15].numerator /  measures31[15].denominator) * 100).toFixed(2) + '%';
        Session.set('measuresArray', measures31);
        
        break;                                        
      default:
        break;
    }

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
              subtitle={ this.data.endpoint + this.data.fhirQueryUrl + '&apikey=' + this.data.apiKey }
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