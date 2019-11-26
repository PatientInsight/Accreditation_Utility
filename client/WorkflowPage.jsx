import { CardMedia, CardText, CardTitle, CardHeader } from 'material-ui/Card';
import { GlassCard, VerticalCanvas, FullPageCanvas, Glass, DynamicSpacer } from 'meteor/clinical:glass-ui';
import { Col, Grid, Row } from 'react-bootstrap';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { browserHistory } from 'react-router';

import { get, has } from 'lodash';
import { moment } from 'meteor/momentjs:moment';

import { Session } from 'meteor/session';
// import { ObservationsTable } from 'meteor/clinical:hl7-resource-observation';
import { Line } from 'nivo'
import { render } from 'react-dom'

import { ResponsiveSankey, Sankey } from '@nivo/sankey';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates'


const sankeyData = {
  "nodes": [
    {
      "id": "John",
      "color": "hsl(62, 70%, 50%)"
    },
    {
      "id": "Raoul",
      "color": "hsl(222, 70%, 50%)"
    },
    {
      "id": "Jane",
      "color": "hsl(174, 70%, 50%)"
    },
    {
      "id": "Marcel",
      "color": "hsl(38, 70%, 50%)"
    },
    {
      "id": "Ibrahim",
      "color": "hsl(201, 70%, 50%)"
    },
    {
      "id": "Junko",
      "color": "hsl(98, 70%, 50%)"
    }
  ],
  "links": [
    {
      "source": "Ibrahim",
      "target": "John",
      "value": 26
    },
    {
      "source": "Ibrahim",
      "target": "Raoul",
      "value": 163
    },
    {
      "source": "Ibrahim",
      "target": "Jane",
      "value": 96
    },
    {
      "source": "John",
      "target": "Jane",
      "value": 191
    },
    {
      "source": "John",
      "target": "Marcel",
      "value": 75
    },
    {
      "source": "Marcel",
      "target": "Junko",
      "value": 121
    },
    {
      "source": "Marcel",
      "target": "Jane",
      "value": 52
    },
    {
      "source": "Raoul",
      "target": "Marcel",
      "value": 132
    },
    {
      "source": "Raoul",
      "target": "John",
      "value": 185
    }
  ]
}

// export class WorkflowPage extends React.Component {
//   constructor(props) {
//     super(props);
//   }
//   getMeteorData() {

//     let imgHeight = (Session.get('appHeight') - 210) / 3;

//     let data = {
//       chart: {
//         width: Session.get('appWidth') * 0.5,  
//         height: 400
//       },
//       style: {              
//         title: Glass.darkroom(),
//         subtitle: Glass.darkroom()
//       },
//       organizations: {
//         image: "/pages/provider-directory/organizations.jpg"
//       },
//       bmi: {
//         height: 0,
//         weight: 0
//       }
//     };

//     data.style.indexCard = Glass.darkroom(data.style.indexCard);

//     // if (Session.get('appWidth') < 768) {
//     //   data.style.inactiveIndexCard.width = '100%';
//     //   data.style.inactiveIndexCard.marginBottom = '10px';
//     //   data.style.inactiveIndexCard.paddingBottom = '10px';
//     //   data.style.inactiveIndexCard.paddingLeft = '0px';
//     //   data.style.inactiveIndexCard.paddingRight = '0px';

//     //   data.style.spacer.display = 'none';
//     // }

//     if(Session.get('appHeight') > 1200){
//       data.style.page = {
//         top: '50%',
//         transform: 'translateY(-50%)',
//         position: 'relative'
//       }
//     }

//     if(Observations.find({'code.text': 'Weight'}).count() > 0){
//       let recentWeight = Observations.find({'code.text': 'Weight'}, {sort: {effectiveDateTime: 1}}).fetch()[0];
//       data.bmi.weight = get(recentWeight, 'valueQuantity.value', 0);
//     }
//     if(Observations.find({'code.text': 'Height'}).count() > 0){
//       let recentHeight = Observations.find({'code.text': 'Height'}, {sort: {effectiveDateTime: 1}}).fetch()[0];
//       data.bmi.height = get(recentHeight, 'valueQuantity.value', 0);
//     }

//     if(process.env.NODE_ENV === "test") console.log("WorkflowPage[data]", data);
//     return data;
//   }
//   render() {
//     const commonProperties = {
//       width: 900,
//       height: 400,
//       margin: { top: 0, right: 80, bottom: 0, left: 80 },
//       data: sankeyData,
//       colors: { scheme: 'category10' },
//     };
    
//     return (
//       <div id='indexPage'>
//         <FullPageCanvas>
//           <GlassCard height='auto' >
//             <CardTitle 
//               title="Workflow Analysis"
//               titleStyle={{fontSize: '240%'}}
//               subtitleStyle={{fontSize: '180%'}}
//               />
//             <CardText style={{fontSize: '180%', height: '400px'}}>
//               <div style={{height: '400px'}}>
//                 <Sankey {...commonProperties} />
//               </div>
//             </CardText>
//           </GlassCard>
//         </FullPageCanvas>
//       </div>
//     );
//   }




//   openLink(url){
//     console.log("openLink", url);
//     browserHistory.push(url);
//   }
// }
// ReactMixin(WorkflowPage.prototype, ReactMeteorData);

const commonProperties = {
  width: 900,
  height: 400,
  margin: { top: 0, right: 80, bottom: 0, left: 80 },
  data: sankeyData,
  colors: { scheme: 'category10' },
};

let pieData = [
  {
    "id": "sass",
    "label": "sass",
    "value": 483,
    "color": "hsl(97, 70%, 50%)"
  },
  {
    "id": "php",
    "label": "php",
    "value": 495,
    "color": "hsl(321, 70%, 50%)"
  },
  {
    "id": "erlang",
    "label": "erlang",
    "value": 158,
    "color": "hsl(314, 70%, 50%)"
  },
  {
    "id": "python",
    "label": "python",
    "value": 434,
    "color": "hsl(281, 70%, 50%)"
  },
  {
    "id": "java",
    "label": "java",
    "value": 122,
    "color": "hsl(19, 70%, 50%)"
  }
];

function WorkflowPage(props){
  return(
    <div id='workflowPage'>
      <FullPageCanvas>
        <Row>
          <Col md={12}>
            <GlassCard height='440px' >
              <CardTitle 
                title="Workflow Analysis"
                titleStyle={{fontSize: '240%'}}
                subtitleStyle={{fontSize: '180%'}}
                />
              <CardText style={{fontSize: '180%', height: '400px'}}>
                <div style={{height: '400px', width: '400px'}}>
                  <ResponsivePie
                    data={pieData}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={{ scheme: 'nivo' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
                    radialLabelsSkipAngle={10}
                    radialLabelsTextXOffset={6}
                    radialLabelsTextColor="#333333"
                    radialLabelsLinkOffset={0}
                    radialLabelsLinkDiagonalLength={16}
                    radialLabelsLinkHorizontalLength={24}
                    radialLabelsLinkStrokeWidth={1}
                    radialLabelsLinkColor={{ from: 'color' }}
                    slicesLabelsSkipAngle={10}
                    slicesLabelsTextColor="#333333"
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    defs={[
                        {
                            id: 'dots',
                            type: 'patternDots',
                            background: 'inherit',
                            color: 'rgba(255, 255, 255, 0.3)',
                            size: 4,
                            padding: 1,
                            stagger: true
                        },
                        {
                            id: 'lines',
                            type: 'patternLines',
                            background: 'inherit',
                            color: 'rgba(255, 255, 255, 0.3)',
                            rotation: -45,
                            lineWidth: 6,
                            spacing: 10
                        }
                    ]}
                    fill={[
                        {
                            match: {
                                id: 'ruby'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'c'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'go'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'python'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'scala'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'lisp'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'elixir'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'javascript'
                            },
                            id: 'lines'
                        }
                    ]}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            translateY: 56,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: '#999',
                            symbolSize: 18,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemTextColor: '#000'
                                    }
                                }
                            ]
                        }
                    ]}
                />
                </div>
              </CardText>
            </GlassCard>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <GlassCard>
              A
            </GlassCard>
          </Col>
          <Col md={4}>
            <GlassCard>
              B
            </GlassCard>
          </Col>
          <Col md={4}>
            <GlassCard>
              C
            </GlassCard>
          </Col>
        </Row>
      </FullPageCanvas>
    </div>
  );
}


export default WorkflowPage;