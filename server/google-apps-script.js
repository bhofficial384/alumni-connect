/**
 * =========================================================================
 * AlumniConnect - Google Apps Script Email Relay (For Render Free Tier)
 * =========================================================================
 * 
 * WHY IS THIS NEEDED FOR RENDER?
 * Render Free Tier blocks outbound SMTP ports 25, 465, and 587.
 * This Google Apps Script acts as an HTTPS endpoint (Port 443) that
 * Render CAN reach, and sends genuine Gmail emails with instant notifications!
 *
 * HOW TO DEPLOY IN 1 MINUTE:
 * 1. Open https://script.google.com in your browser (logged in as bhofficialcollege@gmail.com).
 * 2. Click "+ New project".
 * 3. Delete any template code and paste the doPost function below:
 *
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    GmailApp.sendEmail(data.to, data.subject, data.text, {
      htmlBody: data.html,
      name: "AlumniConnect"
    });
    return ContentService.createTextOutput(JSON.stringify({ delivered: true, success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ delivered: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
 *
 * 4. Click the blue "Deploy" button (top right) -> "New deployment".
 * 5. Click the Gear icon next to "Select type" -> choose "Web app".
 * 6. Configure:
 *    - Description: AlumniConnect Email Relay
 *    - Execute as: Me (bhofficialcollege@gmail.com)
 *    - Who has access: Anyone
 * 7. Click "Deploy" and grant permissions.
 * 8. Copy the "Web app URL" (starts with https://script.google.com/macros/s/.../exec).
 * 9. In your Render Dashboard:
 *    Go to your Web Service -> Environment -> Add:
 *    GOOGLE_SCRIPT_URL = <your copied web app URL>
 *
 * Once saved, emails will send INSTANTLY on Render over HTTPS Port 443!
 * =========================================================================
 */
