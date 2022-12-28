public with sharing class GEO_Earthquake_Save extends GEO_Base {
  public class EQBlueprintx {
    public String id;
    public Double mag;
    public String alert;
    public String place;
    public Double longitude;
    public Double latitude;
    public Double depth;
    public String url;
  }

  public class NoteBluprint {
    public String text1;
    public String earthquakeId;
  }

  @AuraEnabled
  public static string saveEarthquakeRecord(String earthquakeDetailsString) {
    EQBlueprintx eqObject = (EQBlueprintx) JSON.deserializeStrict(
      earthquakeDetailsString,
      EQBlueprintx.class
    );

    Earthquake__c eq = new Earthquake__c();

    eq.USGS_ID__c = eqObject.id;
    eq.Magnitude__c = eqObject.mag;
    eq.Place__c = eqObject.place;
    eq.Alert_Level__c = eqObject.alert;
    eq.Depth__c = eqObject.depth;
    eq.USGS_Link__c = eqObject.url;
    eq.Geolocation__longitude__s = eqObject.longitude;
    eq.Geolocation__latitude__s = eqObject.latitude;

    system.debug(eqObject);

    insert eq;

    return eq.Id;
  }

  @AuraEnabled
  public static string saveEarthquakeNoteRecord(String earthquakeNoteString) {
    NoteBluprint noteObject = (NoteBluprint) JSON.deserializeStrict(
      earthquakeNoteString,
      NoteBluprint.class
    );

    Earthquake_Note__c en = new Earthquake_Note__c();
    en.Text_Field__c = noteObject.text1;
    en.Earthquake__c = noteObject.earthquakeId;

    insert en;

    return 'Success! Earthquake Note record';
  }

  @AuraEnabled(cacheable=true)
  public static List<Earthquake__c> isEarthquakeSaved(String earthquakeUsgsId) {
    return [
      SELECT Id
      FROM Earthquake__c
      WHERE USGS_ID__c = :earthquakeUsgsId
    ];
  }

  @AuraEnabled(cacheable=true)
  public static List<Earthquake_Note__c> retrieveNotes(
    String earthquakeId,
    Integer wireMethodActivation
  ) {
    Integer testNumber = wireMethodActivation;
    return [
      SELECT
        Id,
        Text_Field__c,
        CreatedDate,
        CreatedById,
        Earthquake__r.Id,
        CreatedBy.Name
      FROM Earthquake_Note__c
      WHERE Earthquake__c = :earthquakeId
      ORDER BY CreatedDate DESC
    ];
  }
}
