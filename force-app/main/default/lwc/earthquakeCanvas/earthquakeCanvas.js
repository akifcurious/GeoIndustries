import { LightningElement, track } from "lwc";
import getEarthquakes from "@salesforce/apex/GEO_Earthquake_Callout.getEarthquakes";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class EarthquakeCanvas extends LightningElement {
  earthquakeMainList = "{} [] ()";
  dateToday;
  dateTodayMinusThree;
  dateTodayPlusOne;
  magnitudeOptions = ["4+", "5+", "6+", "7+", "8+"];
  isFilterOptionsShown;

  renderedCallback() {
    this.calculateDates();
    this.makecall();
  }

  calculateDates() {
    const dateNow = new Date();
    const dateTodayFormatted = dateNow.toISOString().split("T")[0];
    console.log(
      "earthquakeCanvas.js | calculateDates() - 0: ",
      dateTodayFormatted
    );
    this.dateToday = dateTodayFormatted;

    const dateNowForConversionToTomorrow = new Date();
    dateNowForConversionToTomorrow.setDate(dateNow.getDate() + 1);
    const dateTomorrowFormatted = dateNowForConversionToTomorrow
      .toISOString()
      .split("T")[0];
    console.log(
      "earthquakeCanvas.js | calculateDates() - 1: ",
      dateTomorrowFormatted
    );
    this.dateTodayPlusOne = dateTomorrowFormatted;

    const dateNowForConversion = new Date();
    dateNowForConversion.setDate(dateNow.getDate() - 3);
    const dateThreeDaysAgoFormatted = dateNowForConversion
      .toISOString()
      .split("T")[0];
    console.log(
      "earthquakeCanvas.js | calculateDates() - 2: ",
      dateThreeDaysAgoFormatted
    );

    this.dateTodayMinusThree = dateThreeDaysAgoFormatted;
  }

  async makecall() {
    const response = await getEarthquakes({
      dateTodayPlusOne: this.dateTodayPlusOne,
      dateTodayMinusThree: this.dateTodayMinusThree
    });
    const responseParsed = JSON.parse(response).features;
    console.log("LIST OF EARTHQUAKES: ", responseParsed);
    //this.earthquakeMainList = responseParsed;
    this.template
      .querySelector("c-earthquake-main-map")
      .prepareMapValues(responseParsed);
  }
  handlMagnitudeChange() {}

  showFilterOptions() {
    this.isFilterOptionsShown = !this.isFilterOptionsShown;
  }

  handleRefreshMap() {
    this.makecall();
    this.showRefreshToast();
  }

  showRefreshToast() {
    const event = new ShowToastEvent({
      title: "Map Refreshed!",
      variant: "success"
    });
    this.dispatchEvent(event);
  }
}