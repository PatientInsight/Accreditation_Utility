import SimpleSchema from 'simpl-schema';

  
  // create the object using our BaseModel
  Measures = BaseModel.extend();
  
  //Assign a collection so the object knows how to perform CRUD operations
  Measures.prototype._collection = Measuress;
  
  // Create a persistent data store for addresses to be stored.
  // HL7.Resources.Patients = new Mongo.Collection('HL7.Resources.Patients');
  Measuress = new Mongo.Collection('Measuress');
  
  //Add the transform to the collection since Meteor.users is pre-defined by the accounts package
  Measuress._transform = function (document) {
    return new Measures(document);
  };
  
  
  
  MeasuresSchema = new SimpleSchema({
    "resourceType" : {
      type: String,
      defaultValue: "Measures"
    },
    "tags" : {
      optional: true,
      type: Array
    }, 
    "tags.$" : {
      optional: true,
      type: String 
    }, 
    "Measures" : {
      optional: true,
      type: String
    }
  });
  Measuress.attachSchema(MeasuresSchema);
  




//=================================================================
// FHIR Methods

Measuress.fetchBundle = function (query, parameters, callback) {
    var MeasuresArray = Measuress.find(query, parameters, callback).map(function(Measures){
      Measures.id = Measures._id;
      delete Measures._document;
      return Measures;
    });
  
    // console.log("MeasuresArray", MeasuresArray);
  
    // var result = Bundle.generate(MeasuresArray);
    var result = MeasuresArray;
    
    // console.log("result", result.entry[0]);
  
    return result;
  };
  
  
  /**
   * @summary This function takes a FHIR resource and prepares it for storage in Mongo.
   * @memberOf Measuress
   * @name toMongo
   * @version 1.6.0
   * @returns { Measures }
   * @example
   * ```js
   *  let Measuress = Measuress.toMongo('12345').fetch();
   * ```
   */
  
  Measuress.toMongo = function (originalMeasures) {
    return originalMeasures;
  };
  
  
  /**
   * @summary Similar to toMongo(), this function prepares a FHIR record for storage in the Mongo database.  The difference being, that this assumes there is already an existing record.
   * @memberOf Measuress
   * @name prepForUpdate
   * @version 1.6.0
   * @returns { Object }
   * @example
   * ```js
   *  let Measuress = Measuress.findMrn('12345').fetch();
   * ```
   */
  
  Measuress.prepForUpdate = function (Measures) {
    return Measures;
  };
  
  
  /**
   * @summary Scrubbing the Measures; make sure it conforms to v1.6.0
   * @memberOf Measuress
   * @name scrub
   * @version 1.2.3
   * @returns {Boolean}
   * @example
   * ```js
   *  let Measuress = Measuress.findMrn('12345').fetch();
   * ```
   */
  
  Measuress.prepForFhirTransfer = function (Measures) {
    process.env.DEBUG && console.log("Measuress.prepForBundle()");
  
    console.log("Measuress.prepForBundle()", Measures);  
    return Measures;
  };
  