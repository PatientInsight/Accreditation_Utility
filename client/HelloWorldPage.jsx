import { CardMedia, CardText, CardTitle, CardHeader, RaisedButton, FlatButton } from 'material-ui';
import { GlassCard, FullPageCanvas, Glass } from 'meteor/clinical:glass-ui';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { browserHistory } from 'react-router';

import { get, has } from 'lodash';

import { Table } from 'react-bootstrap';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { EJSON } from 'meteor/ejson';

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
  description: "Heart failure specific admission rates to inpatient level of care Proportion of patients admitted to Inpatient level of care as their initial level of care. ",
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
Session.setDefault('activeMeasure', {});
Session.setDefault('showJson', false);
Session.setDefault('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=112790001&apikey=');

Session.setDefault('patient_has_encounter_observational', 0);
Session.setDefault('patient_has_encounter_inpatient', 0);
Session.setDefault('patient_has_encounter_ambulatory', 0);

// 40701008   Echocardiogram
// 241620005  Cardiac MRI

export class HelloWorldPage extends React.Component {
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
          inpatients: Session.get('patient_has_encounter_inpatient'),
          observations: Session.get('patient_has_encounter_observational'),
          ambulatory: Session.get('patient_has_encounter_ambulatory')
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

    if(process.env.NODE_ENV === "test") console.log("HelloWorldPage[data]", data);
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
    console.log('queryEndpoint')

    await Meteor.call("queryEndpoint", scope.data.endpoint + scope.data.fhirQueryUrl + scope.data.apiKey, function(error, result){
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
          measures[0].denominator = parsedResults.total;
          measures[1].denominator = parsedResults.total;
          measures[2].denominator = parsedResults.total;
          measures[3].denominator = parsedResults.total;
          measures[4].denominator = parsedResults.total;
          measures[5].denominator = parsedResults.total;
          measures[6].denominator = parsedResults.total;
          measures[7].denominator = parsedResults.total;
          measures[8].denominator = parsedResults.total;
          measures[9].denominator = parsedResults.total;
          measures[10].denominator = parsedResults.total;
          measures[11].denominator = parsedResults.total;
          measures[12].denominator = parsedResults.total;
          measures[13].denominator = parsedResults.total;

          measures[2].score = (( measures[2].numerator /  measures[2].denominator) * 100) + "%";
          measures[3].score = (( measures[3].numerator /  measures[3].denominator) * 100) + "%";
          measures[4].score = (( measures[4].numerator /  measures[4].denominator) * 100) + "%";
          measures[5].score = (( measures[5].numerator /  measures[5].denominator) * 100) + "%";
          break;

          default:
          break;
      }
      Session.set('measuresArray', measures);
    })

  }
  queryEndoscopy(){
    console.log('queryEndoscopy')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=112790001&apikey=');
    this.queryEndpoint(this, 'endoscopy');
  }
  queryEchocardiograms(){
    console.log('queryEchocardiograms')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=40701008&apikey=');
    this.queryEndpoint(this, 'echo');
  }
  queryAngiography(){
    console.log('queryAngiography')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=33367005&apikey=');
    this.queryEndpoint(this, 'angio');
  }
  queryCardiacMris(){
    console.log('queryCardiacMris')
    Session.set('fhirQueryUrl', '/Patient?_has:Procedure:subject:code=241620005&apikey=');
    this.queryEndpoint(this, 'mri');
  }
  queryPatients(){
    console.log('queryPatients')
    Session.set('fhirQueryUrl', '/Patient?apikey=');
    this.queryEndpoint(this, 'patient');
    this.queryEndpoint(this, 'patient');
  }
  async queryPatientStats(scope){
    console.log('queryPatientStats');

    // https://www.hl7.org/fhir/v3/ActEncounterCode/vs.html

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=IMP&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON.parse(result.content);
      console.log('Inpatients:  ', parsedResults)
      Session.set('patient_has_encounter_observational', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=AMB&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON.parse(result.content);
      console.log('Ambulatory:  ', parsedResults)
      Session.set('patient_has_encounter_inpatient', parsedResults.total);
    })

    await Meteor.call("queryEndpoint", this.data.endpoint + '/Patient?_has:Encounter:class=OBSENC&apikey=' + this.data.apiKey, function(error, result){
      let parsedResults = JSON.parse(result.content);
      console.log('Observations:  ', parsedResults)
      Session.set('patient_has_encounter_ambulatory', parsedResults.total);
    })


  }
  rowClick(id){
    //console.log('rowClick', id)
  }
  runAction(identifier, foo, bar){
    //console.log('runAction', identifier)

    switch (identifier) {
      case "CM.M1":
        console.log('Running algorithm 1')        
        break;
      case "CM.M2":
        console.log('Running algorithm 2')      
        break;
      case "CM.M12a":
        console.log('Running algorithm 12a')
        this.queryEchocardiograms();
        break;
      case "CM.M12b":
        console.log('Running algorithm 12b')      
        this.queryCardiacMris();         
        break;
      case "CM.M12c":
        console.log('Running algorithm 12c')  
        this.queryEndoscopy();         
        break;
      case "CM.M12d":
        console.log('Running algorithm 12d')       
        this.queryAngiography();
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

  }
  relayAction(identifier, foo, bar){
    console.log('runAction', identifier)

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
             <RaisedButton label="Metadata" onClick={this.fetchMetadata.bind(this, client)} style={{marginRight: '20px'}} />      
             <RaisedButton label="Show JSON" onClick={this.toggleDisplayJson.bind(this)} style={{marginRight: '20px'}} />

             <RaisedButton label="Query Patients" onClick={this.queryPatients.bind(this)} style={{marginRight: '20px'}} />             
             <RaisedButton label="Query Patient Stats" onClick={this.queryPatientStats.bind(this)} style={{marginRight: '20px'}} />             

             <hr />


             <CardTitle 
              title={this.data.totals.patients.inpatients} 
              subtitle="Inpatients"
              style={{fontSize: '100%', float: 'left', width: '300px'}} 
            />
            <CardTitle 
              title={this.data.totals.patients.observations} 
              subtitle="Observation"
              style={{fontSize: '100%', float: 'left', width: '300px'}} 
            />
            <CardTitle 
              title={this.data.totals.patients.ambulatory} 
              subtitle="Ambulatory"
              style={{fontSize: '100%', float: 'left', width: '300px'}} 
            />
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



ReactMixin(HelloWorldPage.prototype, ReactMeteorData);

export default HelloWorldPage;