Package.describe({
    name: 'patientinsight:accreditation-utility',
    version: '0.2.1',
    summary: 'PatientInsight - Accreditation Utility (Cardiac)',
    git: 'https://github.com/symptomatic/accreditation-utility  ',
    documentation: 'README.md'
});
  
Package.onUse(function(api) {
    api.versionsFrom('1.4');
    
    api.use('meteor-base@1.4.0');
    api.use('ecmascript@0.12.4');
    api.use('react-meteor-data@0.2.15');
    api.use('mongo');
    api.use('session');
    api.use('http');

    // api.use('clinical:base-model@1.5.0');
    // api.use('clinical:user-model@1.7.0');
    // api.imply('clinical:user-model');

    // // if(Package['clinical:fhir-vault-server']){
    // //     api.use('clinical:fhir-vault-server@0.0.3', ['client', 'server'], {weak: true});
    // // }
     
    // // api.use('clinical:hl7-resource-observation');

    // api.use('aldeed:collection2@3.0.0');
    // api.use('clinical:hl7-resource-datatypes@4.0.0');
    // api.use('clinical:hl7-resource-bundle@1.5.5');
    // api.use('simple:json-routes@2.1.0');
    // api.use('momentjs:moment@2.17.1');
    // api.use('clinical:extended-api@2.5.0');
    // api.use('matb33:collection-hooks@0.7.15');  

    // api.addFiles('lib/collection.js');

    // api.addFiles('server/methods.js', 'server');

    // api.addFiles('server/rest.js', 'server');
    // api.addFiles('assets/asclepius.png', "client", {isAsset: true});    
    
    api.mainModule('index.jsx', 'client');
});


Npm.depends({
    "moment": "2.20.1",
    "moment-timezone": "0.5.26",
    "lodash": "4.17.4",
    "nivo": "0.31.0",
    "@nivo/core": "0.59.1",
    "@nivo/sankey": "0.59.1",
    "@nivo/pie": "0.59.1",
    "@nivo/bar": "0.59.1",
    "@nivo/parallel-coordinates": "0.59.2",
    'react-katex': '2.0.2',
    "simpl-schema": "1.5.3",
    "fhir-kit-client": "1.4.0",
    "lossless-json": "1.0.3",
    "json5": "2.1.0"
})