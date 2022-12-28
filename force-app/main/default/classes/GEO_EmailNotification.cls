public with sharing class GEO_EmailNotification {
  @AuraEnabled
  public static String sendNotificationEmail() {
    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

    String[] toAddresses = new List<String>{ 'akifexperiments@gmail.com' };

    mail.setToAddresses(toAddresses);
    mail.setReplyTo('akifexperiments+reply@gmail.com');
    mail.setSenderDisplayName('Globe Watch Center');
    mail.setSubject('Earthquake Notification');
    mail.setBccSender(false);
    mail.setHtmlBody('A new erthquake TEST LOREM IPSUM');
    Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ mail });

    return 'Email sent!';
  }
}
