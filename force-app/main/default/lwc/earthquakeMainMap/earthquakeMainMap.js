import { LightningElement, api, track, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import EARTHQUAKE_MS from "@salesforce/messageChannel/earthquake__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class EarthQuakeMap extends LightningElement {
  @api earthquakeMainList;
  mapMarkers = [];

  @wire(MessageContext)
  messageContext;

  renderedCallback() {
    //this.prepareMapValues();
  }

  @api prepareMapValues(responseParsed) {
    console.log("is perapareMapValues a function?");
    const tempMarkers = responseParsed.map((eq) => {
      const titleRaw = String(eq.properties.title);
      const titleUpperCase = titleRaw.toUpperCase();
      const titleWithMagnitude = `${titleUpperCase} | M:${eq.properties.mag}`;
      return {
        title: titleUpperCase,
        location: {
          Latitude: eq.geometry.coordinates[1],
          Longitude: eq.geometry.coordinates[0]
        },
        value: eq,
        description: `Magnitude:${eq.properties.mag} | Time:${eq.properties.time} `
      };
    });
    console.log("earthquakeMainMap.js | tempMarkers: ", tempMarkers);
    this.mapMarkers = tempMarkers.slice(0, 10);
  }

  handleMarkerSelect(event) {
    const payload = event.target.selectedMarkerValue;
    console.log("earthquakeMainMap.js | handleMarkerSelect(): ", payload);
    publish(this.messageContext, EARTHQUAKE_MS, payload);
  }
}
