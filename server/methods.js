import { HTTP } from 'meteor/http';

Meteor.methods({
    async queryEndpoint(fhirUrl){
        check(fhirUrl, String)
        console.log('queryEndpoint', fhirUrl)
        var self = this;
  
        var queryResult;
  
        return await HTTP.get(fhirUrl, { headers: {
            'Accept': ['application/json', 'application/json+fhir'],
            'Access-Control-Allow-Origin': '*'          
          }});
    },
    async metadataAutoscan(oauthBaseUrl){
        check(oauthBaseUrl, String)
        console.log('metadataAutoscan')
        var self = this;
  
        var metadataRoute = oauthBaseUrl + '/metadata' + formatSuffix;
        console.log('metadata route', metadataRoute)

  
        const conformance = await HTTP.get(metadataRoute, { headers: {
            'Accept': ['application/json', 'application/json+fhir'],
            'Access-Control-Allow-Origin': '*'          
        }});

        return conformance;
    },
    createNewNote: function(text){
        check(text, String);        
        console.log('createNewNote()', text);

        Notes.insert({
            resourceType: 'Note',
            note: text
        });
    }
});

