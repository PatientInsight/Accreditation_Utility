# patientinsight:accreditation-utility

This is an example plugin for Meteor on FHIR (and Symptomatic) that illustrates how to create a REST endpoint, database collection, server side publication, client side subscription, and a reactive user interface.  When implemented, you can ping the REST endpoint, and it will automatically update the user interface.  


#### Clone the Example Plugin      

```bash
# download GPL base build
git clone https://github.com/meteor-on-fhir 
cd meteor-on-fhir/webapp/packages

# download MIT packages
git clone https://github.com/clinical-meteor/hl7-resource-encounter 
git clone https://github.com/clinical-meteor/hl7-resource-patient
git clone https://github.com/clinical-meteor/hl7-resource-procedure
git clone https://github.com/clinical-meteor/hl7-resource-observation
git clone https://github.com/clinical-meteor/hl7-resource-document-reference
git clone https://github.com/clinical-meteor/hl7-resource-diagnostic-report
git clone https://github.com/clinical-meteor/hl7-resource-organization

# download licensed Symptomatic packages (do not release)
git clone https://github.com/symptomatic/theming
git clone https://github.com/symptomatic/smart-on-fhir-client
git clone https://github.com/symptomatic/continuity-of-care
git clone https://github.com/symptomatic/hl7-clinical-document-architecture

# download proprietary plugin
git clone https://github.com/patientinsight/accreditation-utility  
```

#### Run Meteor on FHIR with your plugin  

```bash
# add your package
meteor add patientinsight:accreditation-utility
meteor npm install

# run with a custom settings file
meteor --settings packages/accreditation-utility/configs/settings.localhost.hapi.json

# run with licensed packages
meteor --settings packages/accreditation-utility/configs/settings.localhost.hapi.json --extra-packages symptomatic:theming,symptomatic:smart-on-fhir-client,symptomatic:continuity-of-care,symptomatic:hl7-clinical-document-architecture,patientinsight:accreditation-utility,clinical:hl7-resource-document-reference
```

#### Compile to desktop app

```bash
# add licensed packages
meteor add symptomatic:theming symptomatic:smart-on-fhir-client symptomatic:continuity-of-care symptomatic:hl7-clinical-document-architecture clinical:hl7-resource-document-reference

# add your proprietary packages
meteor add patientinsight:accreditation-utility

# install dependences
meteor npm install

# run with a custom settings file
meteor --settings packages/accreditation-utility/configs/settings.example.json
```



#### Generating a synthetic dataset

```bash
# download synthea
# this version of synthea is configured with cardiac data
# and exports DSTU2 files
git clone https://github.com/PatientInsight/synthea.git
cd synthea

# build the utility
./gradlew build check test

# edit the congestive_heart_failure module as needed
nano modules/congestive_heart_failure.json

# rebuild the utility with the updated modules
./gradlew build check test

# run synthea and create a few thousand test patients
./run_synthea -s 12345 -m *heart* -p 1000 California "Los Angeles"
```


#### Set up a test server

```bash
# install the hapi server (requires java)
brew install hapi-fhir-cli

# run the hapi server using DSTU2 
# most EHRs from 2015 include this supprot
hapi-fhir-cli run-server -v dstu2 -p 3100

# load the output directory into the HAPI server
node index.js -d ../synthea/output/fhir_dstu2/ -t 'hello hapi' -w -S http://localhost:3100/baseDstu2/

# confirm that data is loaded correctly
curl http://localhost:8080/baseDstu2/Patient?_count=100
curl http://localhost:8080/baseDstu2/Encounter?_count=100
```



