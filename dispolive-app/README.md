# dispolive App (dispolive-app)

## Installieren
```bash
yarn
# or
npm install
```

### Entwicklermodus starten (Hot, reload etc.)
```bash
//Für IOS
quasar dev -m capacitor -T ios

//Für Android
quasar dev -m capacitor -T android
```

### Build starten (Hot, reload etc.)
```bash
//Für IOS
quasar build -m capacitor -T ios

//Für Android
quasar build -m capacitor -T android
```


### IOS Hinweise
Der Bundle Identifier muss Pro-App eindeutig sein. Dieser wird in XCode vergeben. Sollte diese App mit einem anderen Account compiliert werden muss dieser geändert werden. Das hochladen in den App-Store ist dann nicht möglich.

Aktuell wird der Account:

Accountname: freelancer@christoph-duengel.de verwendet (Admin Alexander Niesen)
Bundle Identifier: app.dispoliveZadTools.de
Die App wird über Testflight verteilt

#### Bundle erstellen und hochladen
Im Verzeichnis der App eingeben
```bash
quasar build -m capacitor -T ios
```

XCode öffnet sich

1. Click Product
2. Click Archive

Die App wird gebaut und ein Fenster öffnet sich

3. Click Distribute
4. Click App Store Connect
5. Click Distribute

Die App wird in den Appstore hochgeladen und kann dort dann über Testflight verteilt werden.

### ANDRIOD Hinweis
Aktuell wird eine APK erstellt für die Android App der benötigte Keystore befinet sich in der Nextcloud/dispolive/Development/Google Play Store/dispolive.keystore. Im Dokument Keyalias.docx befinden sich die Zugansdaten zum Keystore

#### Bundle erstellen und hochladen
Im Verzeichnis der App eingeben
```bash
quasar build -m capacitor -T android
```

Android Studio öffnet sich

1. Click Build
2. Click Generate signed App Bundle / APK...
3. Click APK
4. Click Next

Der benötigte Keystore befinet sich in der Nextcloud/dispolive/ in der docx sind alle Passwörter enthalten

5. Click next

Die App wird gebaut bitte das fensterbeobachten dort ist der Hinweis wo die App gespeichert wird.

Die Verteilung der APK findet über das WIKI statt