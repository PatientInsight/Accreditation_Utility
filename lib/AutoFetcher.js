import JSON5 from 'json5';
import { get } from 'lodash';

AutoFetcher = {
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
  },
  async recursiveEncounterQuery(queryUrl, apiKey){
    console.log('AutoFetcher.recursiveEncounterQuery.queryUrl', queryUrl);

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
              self.recursiveEncounterQuery(get(link, 'url') + '&apikey=' + apiKey, apiKey)
            }
          })
        }
      }
    })
  },
  async recursiveProceduresQuery(queryUrl, apiKey){
    console.log('AutoFetcher.recursiveProceduresQuery.queryUrl', queryUrl, apiKey)

    let self = this;
    await Meteor.call("queryEndpoint", queryUrl, function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        // received some data
        let parsedResults = JSON5.parse(result.content);
        // console.log('procedureResults', parsedResults);

        // first we right the entries to the Encounter collection
        if(get(parsedResults, 'entry')){
          parsedResults.entry.forEach(function(entry){      
            // checking for duplicates along the way
            if(!Procedures.findOne({id: get(entry, 'resource.id')})){
              Procedures._collection.insert(get(entry, 'resource'));
            }    
          });
        }

        // then we check if we have a pagination link
        if(get(parsedResults, 'link')){
          parsedResults.link.forEach(function(link){
            // if we have a link to a next page
            if(get(link, 'relation') === "next"){
              // recursively call this function again on the new page
              self.recursiveProceduresQuery(get(link, 'url') + '&apikey=' + apiKey, apiKey)
            }
          })
        }
      }
    })
  },
  async recursivePatientQuery(queryUrl, apiKey){
    console.log('AutoFetcher.recursivePatientQuery.queryUrl', queryUrl, apiKey)

    let self = this;
    await Meteor.call("queryEndpoint", queryUrl, function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        // received some data
        let parsedResults = JSON5.parse(result.content);
        console.log('patient results: ', parsedResults);

        // checking for duplicates along the way
        if(!Patients.findOne({id: get(parsedResults, 'id')})){
          Patients._collection.insert(parsedResults);
        }    
      }
    })
  },
  async recursiveObservationsQuery(queryUrl, apiKey){
    console.log('AutoFetcher.recursiveObservationsQuery.queryUrl', queryUrl, apiKey)

    let self = this;
    await Meteor.call("queryEndpoint", queryUrl, function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        // received some data
        let parsedResults = JSON5.parse(result.content);
        console.log('observation results: ', parsedResults);
       
        // first we right the entries to the Encounter collection
        if(get(parsedResults, 'entry')){
          parsedResults.entry.forEach(function(entry){      
            // checking for duplicates along the way
            if(!Observations.findOne({id: get(entry, 'resource.id')})){
              Observations._collection.insert(get(entry, 'resource'));
            }    
          });
        }

        // then we check if we have a pagination link
        if(get(parsedResults, 'link')){
          parsedResults.link.forEach(function(link){
            // if we have a link to a next page
            if(get(link, 'relation') === "next"){
              // recursively call this function again on the new page
              self.recursiveObservationsQuery(get(link, 'url') + '&apikey=' + apiKey, apiKey)
            }
          })
        }

      }
    })
  },
  async recursiveDiagnosticReportsQuery(queryUrl, apiKey){
    console.log('AutoFetcher.recursiveDiagnosticReportsQuery.queryUrl', queryUrl, apiKey)
    
    let self = this;
    await Meteor.call("queryEndpoint", queryUrl, function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        // received some data
        let parsedResults = JSON5.parse(result.content);
        console.log('diagnostic reports query: ', parsedResults);
       
        // first we right the entries to the Encounter collection
        if(get(parsedResults, 'entry')){
          parsedResults.entry.forEach(function(entry){      
            // checking for duplicates along the way
            if(!DiagnosticReports.findOne({id: get(entry, 'resource.id')})){
              DiagnosticReports._collection.insert(get(entry, 'resource'));
            }    
          });
        }

        // then we check if we have a pagination link
        if(get(parsedResults, 'link')){
          parsedResults.link.forEach(function(link){
            // if we have a link to a next page
            if(get(link, 'relation') === "next"){
              // recursively call this function again on the new page
              self.recursiveDiagnosticReportsQuery(get(link, 'url') + '&apikey=' + apiKey, apiKey)
            }
          })
        }
      }
    })
  },
  async recursiveDocumentReferenceQuery(queryUrl, apiKey){
    console.log('AutoFetcher.recursiveDocumentReferenceQuery.queryUrl', queryUrl, apiKey)
    
    let self = this;
    await Meteor.call("queryEndpoint", queryUrl, function(error, result){
      if(error){
        console.log('error', error)
      }
      if(result){
        // received some data
        let parsedResults = JSON5.parse(result.content);
        console.log('document reference query: ', parsedResults);
       
        // first we right the entries to the Encounter collection
        if(get(parsedResults, 'entry')){
          parsedResults.entry.forEach(function(entry){      
            // checking for duplicates along the way
            if(!DocumentReferences.findOne({id: get(entry, 'resource.id')})){
              DocumentReferences._collection.insert(get(entry, 'resource'));
            }    
          });
        }

        // then we check if we have a pagination link
        if(get(parsedResults, 'link')){
          parsedResults.link.forEach(function(link){
            // if we have a link to a next page
            if(get(link, 'relation') === "next"){
              // recursively call this function again on the new page
              self.recursiveDocumentReferenceQuery(get(link, 'url') + '&apikey=' + apiKey, apiKey)
            }
          })
        }
      }
    })

  }
}

export default AutoFetcher;