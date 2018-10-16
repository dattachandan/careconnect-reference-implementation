import {Component, Input, OnInit} from '@angular/core';
import {FhirService} from "../../service/fhir.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-ed-encounter-card',
  templateUrl: './ed-encounter-card.component.html',
  styleUrls: ['./ed-encounter-card.component.css']
})
export class EdEncounterCardComponent implements OnInit {

  @Input()
  encounter : fhir.Encounter;

  heart : fhir.Observation = undefined;
  temp : fhir.Observation = undefined;
  resp : fhir.Observation = undefined;
  bp : fhir.Observation = undefined;
    news2 : fhir.Observation = undefined;
    o2 : fhir.Observation = undefined;
    alert : fhir.Observation = undefined;
    air : fhir.Observation = undefined;

  patient : fhir.Patient = undefined;
  encounters : fhir.Encounter[] = [];
  nrlsdocuments : fhir.DocumentReference[] = [];

  coords = undefined;
  plannedLocStatus : boolean = true;

    public positions=[];

    ambulanceLoc : fhir.Location = undefined;
    plannedLoc :fhir.Location = undefined;



    constructor(private fhirService : FhirService,
              private router : Router) { }

  ngOnInit() {

    this.fhirService.getResource('/'+this.encounter.subject.reference).subscribe(patient => {
      this.patient = patient;
        for(let identifier of patient.identifier) {
            if (identifier.system === 'https://fhir.nhs.uk/Id/nhs-number') {
                this.getNRLSData(identifier.value);
            }
        }

    })
    this.fhirService.get('/Encounter?_id='+this.encounter.id+'&_revinclude=*').subscribe( bundle => {
      this.encounters = [];
      for (let entry of bundle.entry) {
        let sub : fhir.Encounter = <fhir.Encounter> entry.resource;
        if (sub.id !== this.encounter.id) {
          //his.coords = sub.53.80634, -1.52304
          this.encounters.push(sub);
        }
      }
    },
        ()=>{

        }
        , ()=> {
            this.ambulanceLoc = undefined;
            this.plannedLoc = undefined;
            for (let enc of this.encounters) {

                // ambulance encounter is the only one we are interested in - the triage should be finished and handedover
                if (enc.status !=='finished' ) {
                    for (let enclocation of enc.location) {

                        if (enclocation.status == 'planned' || enclocation.status == 'active') {
                            this.fhirService.getResource('/' + enclocation.location.reference).subscribe(location => {
                               /* if (enc.type[0].coding[0].code === '245581009') {
                                    this.coords = location.position.latitude + ', ' + location.position.longitude;
                                } */
                               // this.positions.push([location.position.latitude, location.position.longitude]);
                                if (location.type.coding[0].code === 'AMB') {
                                    this.ambulanceLoc = location;

                                } else {
                                    this.plannedLoc = location;

                                    if (enclocation.status == 'active') {
                                        this.plannedLocStatus = true;
                                    } else {
                                        this.plannedLocStatus = false;
                                    }
                                }
                            })
                        }
                    }
                    this.getObs(enc.id);
                }
            }
        })
  }
  getLastName(patient :fhir.Patient) : String {
    if (patient == undefined) return "";
    if (patient.name == undefined || patient.name.length == 0)
      return "";

    let name = "";
    if (patient.name[0].family != undefined) name += patient.name[0].family.toUpperCase();
    return name;

  }

    getNRLSData(nhsNumber : string) {

      // Mock up using CCRI for now (EOLC not supported in NRLS until next phase

        this.fhirService.get('/DocumentReference?patient='+this.patient.id).subscribe( bundle => {
            if (bundle.entry !== undefined) {
                for (let entry of bundle.entry) {
                    let document: fhir.DocumentReference = <fhir.DocumentReference> entry.resource;
                    this.nrlsdocuments.push(document);

                }
            }
        })
    }

  getObs(encounterId) {
      this.fhirService.get('/Encounter?_id='+encounterId+'&_revinclude=*').subscribe(bundle => {
        //console.log(bundle);
          this.heart = undefined;
          this.temp = undefined;
          this.resp = undefined;
          this.bp = undefined;
          this.news2 = undefined;
          this.o2 = undefined;
          this.air = undefined;
          this.alert = undefined;

        for (let entry of bundle.entry) {
          if (entry.resource.resourceType === 'Observation') {
            let obs : fhir.Observation = <fhir.Observation> entry.resource;
            switch (obs.code.coding[0].code) {
                case '364075005':
                  this.heart = obs;
                  break;
                case '276885007':
                    this.temp = obs;
                    break;
                case '86290005':
                    this.resp = obs;
                    break;
                case "859261000000108":
                    this.news2 = obs;
                    break;
                case "365933000":
                    this.alert = obs;
                    break;
                case "75367002":
                    this.bp = obs;
                    break;
                case "431314004":
              case "866661000000106":
              case "866701000000100":
                    this.o2 = obs;
                    break;
                case "301282008":
                  this.air = obs;
                  break;
                default :
                    console.log(obs);
            }

          }
        }
      })
  }
  getFirstName(patient :fhir.Patient) : String {
    if (patient == undefined) return "";
    if (patient.name == undefined || patient.name.length == 0)
      return "";
    // Move to address
    let name = "";
    if (patient.name[0].given != undefined && patient.name[0].given.length>0) name += ", "+ patient.name[0].given[0];

    if (patient.name[0].prefix != undefined && patient.name[0].prefix.length>0) name += " (" + patient.name[0].prefix[0] +")" ;
    return name;

  }

  getNHSIdentifier(patient : fhir.Patient) : String {
    if (patient == undefined) return "";
    if (patient.identifier == undefined || patient.identifier.length == 0)
      return "";
    // Move to address
    var NHSNumber :String = "";
    for (var f=0;f<patient.identifier.length;f++) {
      if (patient.identifier[f].system.includes("nhs-number") )
        NHSNumber = patient.identifier[f].value;
    }
    return NHSNumber;

  }

  getValue(obs : fhir.Observation) {
      let value = "";

      if (obs.valueQuantity != undefined) {
        value = obs.valueQuantity.value.toString()
      }
    if (obs.valueCodeableConcept != undefined) {
      value = obs.valueCodeableConcept.coding[0].display;
    }
    if (obs.component!=undefined && obs.component.length > 1) {
      value = obs.component[0].valueQuantity.value.toString() + '/'+obs.component[1].valueQuantity.value.toString();
    }
      return value;
  }

  getColour(obs : fhir.Observation) {
      let colour : string = undefined;
    let value : number = undefined;

      if (obs.code.coding !== undefined) {
        switch (obs.code.coding[0].code) {
          case "859261000000108":
            // news2
            value = Number(this.getValue(obs));
            if (value > 6) {
              colour = 'warn';
            } else if (value > 4 ) {
              colour = 'accent';
            }
            /// how is a aggregate score of 3 identified
            break;

          case '364075005':
            // pulese
            value = Number(this.getValue(obs));

            if (value > 130 || value <40 ) {
              colour = 'warn';
            } else if (value > 110  ) {
              colour = 'accent';
            } else if (value > 90 || value< 51  ) {
              colour = 'accent'; // yellow
            }
            break;
          case '276885007':
            // temp
            value  = Number(this.getValue(obs));
            if (value <= 35 ) {
              colour = 'warn';
            } else if (value > 39  ) {
              colour = 'accent';
            } else if (value > 38 || value< 36.1  ) {
              colour = 'accent'; // yellow
            }
            break;
          case '86290005':
            // resp
            value = Number(this.getValue(obs));
            if (value > 24 || value <9 ) {
              colour = 'warn';
            } else if (value > 20  ) {
              colour = 'accent';
            } else if ( value< 12  ) {
              colour = 'accent'; // yellow
            }
            break;

          case "365933000":
            // alert
            if (obs.valueCodeableConcept.coding[0].code == '422768004') {
              colour = 'accent';
            }
            if (obs.valueCodeableConcept.coding[0].code == '130987000') {
              colour = 'accent';
            }
            break;
          case "75367002":
            // bp
            console.log('bp - '+value);
            value  = Number(obs.component[0].valueQuantity.value);
            if (value < 91 || value>219 ) {
              colour = 'warn';
            } else if (value < 101  ) {
              colour = 'accent';
            } else if ( value< 111  ) {
              colour = 'accent'; // yellow
            }
            break;

          case "431314004":
          case "866661000000106":
          case "866701000000100":
  // o2
            value = Number(this.getValue(obs));
            let onair :boolean = false;
            if (this.air !== undefined) {
              onair = this.air.valueCodeableConcept.coding[0].code == '371825009';
            }
            if (onair) {
              if (value < 84 || value > 96) {
                colour = 'warn';
              } else if (value < 86 || value > 94) {
                colour = 'accent';
              } else if (value < 88 || value > 92) {
                colour = 'accent'; // yellow
              }
            } else {
              if (value < 92) {
                colour = 'warn';
              } else if (value < 94) {
                colour = 'accent';
              } else if (value < 96) {
                colour = 'accent'; // yellow
              }
            }
            break;

          case "301282008":
            if (obs.valueCodeableConcept.coding[0].code == '371825009') {
              colour = 'accent';
            }
            break;
        }
      }

      return colour;
  }
  getSelected(obs : fhir.Observation) :boolean {
      let value = this.getColour(obs);

      if (value !== undefined ) {

        return true;
      } else return false;
  }

    onMapReady(map) {
        console.log('map', map);
        console.log('markers', map.markers);  // to get all markers as an array
    }
    onIdle(event) {
        console.log('map', event.target);
    }
    onMarkerInit(marker) {
        console.log('marker', marker);
    }
    onMapClick(event) {
        this.positions.push(event.latLng);
        event.target.panTo(event.latLng);
    }

    viewDetails(patient : fhir.Patient) {
        this.router.navigateByUrl('/ed/patient/'+patient.id);
    }
}
