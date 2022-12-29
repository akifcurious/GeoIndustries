public with sharing class GEO_Earthquake_Callout {
  @AuraEnabled(cacheable=true)
  public static String getEarthquakes(
    String dateTodayPlusOne,
    String dateTodayMinusThree
  ) {
    String dateEnd = String.valueOf(dateTodayPlusOne);
    String dateStart = String.valueOf(dateTodayMinusThree);

    String endPoint =
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' +
      dateStart +
      '&endtime=' +
      dateEnd +
      '&minmagnitude=5';

    System.debug(endPoint);
    System.debug(dateEnd);

    String endPointTwo = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2022-12-07&endtime=2022-12-13&minmagnitude=5';

    HttpRequest req = new HttpRequest();
    req.setEndpoint(endPoint);
    req.setMethod('GET');

    String responseStr;

    try {
      Http http = new Http();
      HttpResponse res = http.send(req);
      if (res.getStatusCode() == 200) {
        responseStr = res.getBody();
      }
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }

    return responseStr;
  }
}