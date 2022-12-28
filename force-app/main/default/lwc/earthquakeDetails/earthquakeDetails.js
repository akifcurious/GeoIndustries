import { LightningElement, wire, track } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import EARTHQUAKE_MS from "@salesforce/messageChannel/earthquake__c";
import saveEarthquakeRecord from "@salesforce/apex/GEO_Earthquake_Save.saveEarthquakeRecord";
import isEarthquakeSaved from "@salesforce/apex/GEO_Earthquake_Save.isEarthquakeSaved";
import sendNotificationEmail from "@salesforce/apex/GEO_EmailNotification.sendNotificationEmail";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";

export default class EarthquakeDetails extends NavigationMixin(
  LightningElement
) {
  earthquakeTitle;
  earthquakeDetails;
  earthquakeDateTime;
  earthquakeLongitude;
  earthquakeLatitude;
  earthquakeDepth;
  earthquakeExternalId;

  @track isRecordAlreadySaved;

  // is being replaced by isRecordAlreadySaved;
  @track isDetailsSaved;

  @wire(MessageContext)
  messageContext;

  @track insertedRecordId;

  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      EARTHQUAKE_MS,
      (message) => this.handleMessage(message)
    );
  }

  handleMessage(message) {
    console.log("earthquakeDetails.js | handleMessage(): ", message);
    this.earthquakeDetails = message;
    this.earthquakeExternalId = message.id;
    const dateTime = message.properties.time;
    this.earthquakeDateTime = new Date(dateTime).toString();
    this.earthquakeLongitude = message.geometry.coordinates[0];
    this.earthquakeLatitude = message.geometry.coordinates[1];
    this.earthquakeDepth = message.geometry.coordinates[2];
    this.earthquakeTitle = String(message.properties.place).toUpperCase();
    this.isDetailsSaved = false;
    this.checkIfRecordSaved();
  }

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  async handleSaveButton(event) {
    const tempEarthquakeId = this.earthquakeDetails.id;
    const tempEarthquakeMag = this.earthquakeDetails.properties.mag;
    const tempEarthquakeAlert = this.earthquakeDetails.properties.alert;
    const tempEarthquakePlace = this.earthquakeDetails.properties.place;
    const tempEarthquakeLongitude =
      this.earthquakeDetails.geometry.coordinates[0];
    const tempEarthquakeLatitude =
      this.earthquakeDetails.geometry.coordinates[1];
    const tempEarthquakeDepth = this.earthquakeDetails.geometry.coordinates[2];
    const tempEarthquakeLink = this.earthquakeDetails.properties.url;

    const tempEarthquakeObject = {
      id: tempEarthquakeId,
      mag: tempEarthquakeMag,
      alert: tempEarthquakeAlert,
      place: tempEarthquakePlace,
      longitude: tempEarthquakeLongitude,
      latitude: tempEarthquakeLatitude,
      depth: tempEarthquakeDepth,
      url: tempEarthquakeLink
    };

    const earthquakeDetailsString = JSON.stringify(tempEarthquakeObject);
    console.log(tempEarthquakeObject);
    const returnedRecordId = await saveEarthquakeRecord({
      earthquakeDetailsString: earthquakeDetailsString
    });
    this.insertedRecordId = returnedRecordId;
    console.log(`New Earthquake__c record Id: ${returnedRecordId}`);
    this.showSavedToast();
    this.isDetailsSaved = true;
    this.isRecordAlreadySaved = true;
  }

  async checkIfRecordSaved() {
    const isSavedServerResponse = await isEarthquakeSaved({
      earthquakeUsgsId: this.earthquakeExternalId
    });

    if (isSavedServerResponse.length > 0) {
      this.isRecordAlreadySaved = true;
      this.insertedRecordId = isSavedServerResponse[0].Id;
      console.log("INSTERTED RECORDID: ", this.insertedRecordId);
    } else {
      this.isRecordAlreadySaved = false;
    }

    console.log("ISSAVED: ", isSavedServerResponse);
  }

  showSavedToast() {
    const event = new ShowToastEvent({
      title: "Earthquake Details saved!",
      variant: "success"
    });
    this.dispatchEvent(event);
  }

  // @wire(isEarthquakeSaved, { recordId: "$recordId" })
  // record;

  async handleSendNotificationButton() {
    console.log("Send Notification Clicked!");
    const result = await sendNotificationEmail();
    console.log(result);
  }

  goToRecordPage() {}

  goToRecordPage() {
    // View a custom object record.
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.insertedRecordId,
        //objectApiName: 'namespace__ObjectName', // objectApiName is optional
        actionName: "view"
      }
    });
  }
}
