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
  description: "Proportion of patients receiving Echocardiogram",
  score: 0
}, {
  identifier: "CM.M12b",
  description: "Proportion of patients receiving Cardiac MRI",
  score: 0
}, {
  identifier: "CM.M12c",
  description: "Proportion of patients receiving Endoscopy",
  score: 0
}, {
  identifier: "CM.M12d",
  description: "Proportion of patients receiving Coronary Angiography",
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



Session.setDefault('start_date', '');
Session.setDefault('end_date', '');

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
          total: Session.get('encounters_total'),
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
          total: Session.get('encounters_total'),
          discharged: Session.get('encounters_discharged'),
          discharged_with_heartfailure: Session.get('encounters_discharged_with_heartfailure')
        }
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
        let parsedResults = JSON.parse(result.content);
        console.log('result', parsedResults)
        // console.log('content', parsedResults)
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
  queryEndoscopy(){
    console.log('queryEndoscopy')

    let dateQuery = this.generateDateQuery('_has:Procedure');   

    Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=112790001&' + dateQuery + '&apikey=');
    this.queryEndpoint(this, 'endoscopy');
  }
  queryEchocardiograms(){
    console.log('queryEchocardiograms')

    let dateQuery = this.generateDateQuery('_has:Procedure');   
    
    Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=40701008&apikey=');
    this.queryEndpoint(this, 'echo');
  }
  queryAngiography(){
    console.log('queryAngiography')
    
    let dateQuery = this.generateDateQuery('_has:Procedure');   
    
    Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=33367005&apikey=');
    this.queryEndpoint(this, 'angio');
  }
  queryCardiacMris(){
    console.log('queryCardiacMris')
    
    let dateQuery = this.generateDateQuery('_has:Procedure');   
    
    Session.set('fhirQueryUrl', '/Patient?_count=1000&_has:Procedure:subject:code=241620005&apikey=');
    this.queryEndpoint(this, 'mri');
  }
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
      let parsedResults = JSON.parse(result.content);
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
      let parsedResults = JSON.parse(result.content);
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
      let parsedResults = JSON.parse(result.content);
      console.log('Inpatients:  ', parsedResults)
      Session.set('encounter_observational', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=AMB&_count=1000&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON.parse(result.content);
      console.log('Ambulatory:  ', parsedResults)
      Session.set('encounter_inpatient', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=OBSENC&_count=1000&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON.parse(result.content);
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
  async queryEncounters(){
    console.log('queryEncounters');


    console.log('start_date', Session.get('start_date'));
    console.log('end_date', Session.get('end_date'));

    let dateQuery = this.generateDateQuery() + '&';    

    let encounterUrl = this.data.endpoint + '/Encounter?' + dateQuery + '_count=1000&apikey=' + this.data.apiKey;

    console.log('encounterUrl', encounterUrl);

    await Meteor.call("queryEndpoint", encounterUrl, function(error, result){
    //await Meteor.call("queryEndpoint", this.data.endpoint + '/Encounter?apikey=' + this.data.apiKey, function(error, result){
        if(error){
        console.log('error', error)
      }
      if(result){
        let parsedResults = JSON.parse(result.content);
        console.log('Encounters:  ', parsedResults)
        Session.set('encounters_total', parsedResults.total);  

        let ambulatory = 0;
        let emergency = 0;
        let field = 0;
        let home_health = 0;
        let inpatient_encounter = 0;
        let inpatient_accute = 0;
        let inpatient_non_accute = 0;
        let observation_encounter = 0;
        let pre_admission = 0;
        let short_stay = 0;
        let virtual = 0;

        if(parsedResults.entry){
          let encounters_discharged_with_heartfailure = 0;
          let encounters_discharged = 0;

          let reasonCodes = [];

          parsedResults.entry.forEach(function(entry){
            reasonCodes.push({
              display: get(entry, 'resource.reason[0].coding[0].display'),
              code: get(entry, 'resource.reason[0].coding[0].code')
            })
            
            switch (get(entry, 'resource.class.code')) {
              case "ambulatory":
                  ambulatory++;
                break;
              case "emergency":
                emergency++;
                break;
              case "EMERGENCY":
                observation_encounter++;
                break;
              case "field":
                field++;
                break;
              case "homehealth":
                home_health++;
                break;
              case "home health":
                home_health++;              
                break;
              case "inpatient":
                inpatient_encounter++;
                break;
              case "inpatient encounter":
                inpatient_encounter++;              
                break;
              case "inpatient accute":
                inpatient_accute++;              
                break;
              case "inpatient non-accute":
                inpatient_non_accute++;
                break;
              case "observation encounter":
                observation_encounter++;
                break;
              case "pre-admission":
                pre_admission++;
                break;
              case "short stay":
                short_stay++;
                break;                
              case "virtual":
                virtual++;
                break;                                             
              default:
                break;
            }

            let dischargeDate = get(entry, 'resource.period.end');
            let startDate = Session.get('start_date');
            let endDate = Session.get('endDate');

            if(moment(dischargeDate).isBetween(startDate, endDate)){
              encounters_discharged++;

              if(get(entry, 'resource.reason[0].coding[0].code') === "84114007"){
                encounters_discharged_with_heartfailure++;
                console.log('Discharged patient with heartfailure', entry)
              }
            }
          })

          console.log('reasonCodes', uniqBy(reasonCodes, 'code'));

          Session.set('encounters_discharged', encounters_discharged);
          Session.set('encounters_discharged_with_heartfailure', encounters_discharged_with_heartfailure);
        }



        console.log('ambulatory', ambulatory);
        console.log('emergency', emergency);
        console.log('field', field);
        console.log('home_health', home_health);
        console.log('inpatient_encounter', inpatient_encounter);
        console.log('inpatient_accute', inpatient_accute);
        console.log('inpatient_non_accute', inpatient_non_accute);
        console.log('observation_encounter', observation_encounter);
        console.log('pre_admission', pre_admission);
        console.log('short_stay', short_stay);
        console.log('virtual', virtual);

        Session.set('encounter_inpatient', inpatient_encounter);
        Session.set('encounter_ambulatory', ambulatory);
        Session.set('encounter_emergency', emergency);
        Session.set('encounter_observational', observation_encounter);
        Session.set('encounter_field', field);
        Session.set('encounter_homehealth', home_health);
      }
    });

  }
  rowClick(id){
    //console.log('rowClick', id)
  }
  runAction(identifier, foo, bar){
    //console.log('runAction', identifier)

    let measures = Session.get('measuresArray');
    let encounters_with_heartfailure = Session.get('encounters_with_heartfailure');

    switch (identifier) {
      case "CM.M1":
        console.log('Running algorithm 1')   
        
        measures[0].numerator = encounters_with_heartfailure.observational;
        measures[0].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[0].score =  ((measures[0].numerator /  measures[0].denominator) * 100).toFixed(2) + '%';
        break;
      case "CM.M2":
        console.log('Running algorithm 2')      

        measures[1].numerator = encounters_with_heartfailure.inpatient;
        measures[1].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[1].score =  ((measures[1].numerator /  measures[1].denominator) * 100).toFixed(2) + '%';

        break;
      case "CM.M12a":
        console.log('Running algorithm 12a')

        measures[2].numerator = 0;
        measures[2].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[2].score =  ((measures[2].numerator /  measures[2].denominator) * 100).toFixed(2) + '%';


        // this.queryEchocardiograms();
        break;
      case "CM.M12b":
        console.log('Running algorithm 12b')      
        measures[3].numerator = 0;
        measures[3].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[3].score =  ((measures[3].numerator /  measures[3].denominator) * 100).toFixed(2) + '%';

        // this.queryCardiacMris();         
        break;
      case "CM.M12c":
        console.log('Running algorithm 12c')  

        measures[4].numerator = 0;
        measures[4].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[4].score =  ((measures[4].numerator /  measures[4].denominator) * 100).toFixed(2) + '%';

        // this.queryEndoscopy();         
        break;
      case "CM.M12d":
        console.log('Running algorithm 12d')       

        measures[5].numerator = 0;
        measures[5].denominator = get(this, 'data.totals.encounters.discharged_with_heartfailure')
        measures[5].score =  ((measures[5].numerator /  measures[5].denominator) * 100).toFixed(2) + '%';

        // this.queryAngiography();
        break;
      case "CM.M15":
        console.log('Running algorithm 15')                    
        break;
      case "CM.M17":
        console.log('Running algorithm 17')                          
        break;
      case "CM.M18":
        console.log('Running algorithm 18')                            
        break;
      case "CM.M24":
        console.log('Running algorithm 24')                                  
        break;
      case "CM.M27":
        console.log('Running algorithm 27')         
        break;
      case "CM.M28c":
        console.log('Running algorithm 28')           
        break;
      case "CM.M29":
        console.log('Running algorithm 29')           
        break;
      case "CM.M31":
        console.log('Running algorithm 31')           
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
        { JSON.stringify(this.data.displayText, null, ' ')  }
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
             <DatePicker hintText="Start" mode="landscape" className='start_date' name='start_date' style={{width: '200px', marginRight: '80px', float: 'left'}} onChange={this.changeStartDate.bind(this)} />
             <DatePicker hintText="End" mode="landscape" className='end_date' name='end_date' style={{width: '200px', marginRight: '80px', float: 'left'}} onChange={this.changeEndDate.bind(this)} />

             <RaisedButton label="§ Heartfailure Encounters" onClick={this.queryHeartfailureEncounters.bind(this)} style={{marginRight: '20px'}} />             

              <div style={{float: 'right'}}>
                <RaisedButton disabled label="Metadata" onClick={this.fetchMetadata.bind(this, client)} style={{marginRight: '20px'}} />      
                <RaisedButton disabled label="Show JSON" onClick={this.toggleDisplayJson.bind(this)} style={{marginRight: '20px'}} />

                <RaisedButton disabled label="§ Patients" onClick={this.queryPatients.bind(this)} style={{marginRight: '20px'}} />             
                <RaisedButton disabled label="§ Patient Stats" onClick={this.queryPatientStats.bind(this)} style={{marginRight: '20px'}} />             

                <RaisedButton disabled label="§ Heartfailure Patients" onClick={this.queryHeartfailurePatients.bind(this)} style={{marginRight: '20px'}} />             
                <RaisedButton label="§ Encounters" onClick={this.queryEncounters.bind(this)} style={{marginRight: '20px'}} />                             
              </div>



             <hr />


             <div style={{width: '100%', height: '60px'}}>
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.total') } 
                  subtitle="Encounters (Total)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.inpatients') } 
                  subtitle="Encounters (Inpatients)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.observations') } 
                  subtitle="Encounters (Observational)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.ambulatory') } 
                  subtitle="Encounters (Ambulatory)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.emergency') } 
                  subtitle="Encounters (Emergency)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.discharged') } 
                  subtitle="Encounters (Discharged)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />
                <CardTitle 
                  title={ get(this, 'data.totals.encounters.discharged_with_heartfailure') } 
                  subtitle="Encounters (Heartfailure)"
                  style={{fontSize: '100%', float: 'left', width: '200px'}} 
                />                
             </div>
            <br />

             {/* <RaisedButton label="Query Endoscopy" onClick={this.queryEndoscopy.bind(this)} style={{marginRight: '20px'}} />             
             <RaisedButton label="Query Echocardiograms" onClick={this.queryEchocardiograms.bind(this)} style={{marginRight: '20px'}} />
             <RaisedButton label="Query Angiography" onClick={this.queryAngiography.bind(this)} style={{marginRight: '20px'}} />
             <RaisedButton label="Query Cardiac MRIs" onClick={this.queryCardiacMris.bind(this)} /><br /><br /> */}


              { codeSection }
              
              <Table hover >
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