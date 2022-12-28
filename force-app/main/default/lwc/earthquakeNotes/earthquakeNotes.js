import { LightningElement, api, track, wire } from "lwc";
import saveEarthquakeNoteRecord from "@salesforce/apex/GEO_Earthquake_Save.saveEarthquakeNoteRecord";
import retrieveNotes from "@salesforce/apex/GEO_Earthquake_Save.retrieveNotes";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class EarthquakeNotes extends LightningElement {
  textAreaText;
  @api insertedEarthquakeRecordId;
  showPreviousNotes;
  @track notes;
  @track notesPlusTest;
  wireMethodActivation = 0;
  parsedNotes;
  renderedCallback() {}

  async handleSubmit() {
    this.textAreaText = this.template.querySelector("lightning-textarea").value;
    console.log(this.insertedEarthquakeRecordId);
    const tempEarthquakeNoteObject = {
      text1: this.textAreaText,
      earthquakeId: this.insertedEarthquakeRecordId
    };
    const earthquakeNoteString = JSON.stringify(tempEarthquakeNoteObject);
    const result = await saveEarthquakeNoteRecord({
      earthquakeNoteString: earthquakeNoteString
    });
    console.log(result);
    this.showNoteSavedToast();

    this.handleClear();

    this.wireMethodActivation++;
  }

  handleClear() {
    console.log("earthquakeNotes.js | handleClear()");
    this.template.querySelector("lightning-textarea").value = null;
  }

  handleChange() {}

  @wire(retrieveNotes, {
    earthquakeId: "$insertedEarthquakeRecordId",
    wireMethodActivation: "$wireMethodActivation"
  })
  notesPlus({ error, data }) {
    if (data) {
      console.log("WIREDNOTES: ", data);
      this.notesPlusTest = data;

      this.parsedNotes = data.map((record) => {
        const dateFormatted = record.CreatedDate.replace("T", " ").split(
          "."
        )[0];
        return {
          Id: record.Id,
          note: record.Text_Field__c,
          createdDateAndBy: `${dateFormatted} | ${record.CreatedBy.Name}`
        };
      });

      if (data.length > 0) {
        this.showPreviousNotes = true;
      }
    } else if (error) {
      this.error = error;
    }
  }

  showNoteSavedToast() {
    const event = new ShowToastEvent({
      title: "New note saved!",
      variant: "success"
    });
    this.dispatchEvent(event);
  }
}
