import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(Rcr1010Plugin)
public class Rcr1010Plugin: CAPPlugin, Rcr1010Delegate {
    
    var rcr1010: Rcr1010!;
    
    @objc public func isPaired(_ call: CAPPluginCall) {
        if (self.rcr1010 == nil) {
            self.rcr1010 = Rcr1010.init(delegate: self);
        }
        
        call.resolve([
            "value": self.rcr1010.isPaired
        ])
    }
    
    @objc public func isPairing(_ call: CAPPluginCall) {
        if (self.rcr1010 == nil) {
            self.rcr1010 = Rcr1010.init(delegate: self);
        }
        
        call.resolve([
            "value": self.rcr1010.isPairing
        ])
    }
    
    @objc public func isScanning(_ call: CAPPluginCall) {
        if (self.rcr1010 == nil) {
            self.rcr1010 = Rcr1010.init(delegate: self);
        }
        
        call.resolve([
            "value": self.rcr1010.isScanning
        ])
    }
    
    
    @objc public func startScan(_ call: CAPPluginCall) {
        if (self.rcr1010 == nil) {
            self.rcr1010 = Rcr1010.init(delegate: self);
        }
        
        if (!self.rcr1010.isScanning) {
            self.rcr1010.startScan();
        }
        
        call.resolve();
    }
    
    @objc public func stopScan(_ call: CAPPluginCall) {
        if (self.rcr1010 == nil) {
            self.rcr1010 = Rcr1010.init(delegate: self);
        }
        
        if (self.rcr1010.isScanning) {
            self.rcr1010.stopScan();
        }
        
        call.resolve();
    }
    
    @objc public func stopPairing(_ call: CAPPluginCall) {
        if (self.rcr1010 == nil) {
            self.rcr1010 = Rcr1010.init(delegate: self);
        }
        
        if (self.rcr1010.isPairing) {
            self.rcr1010.stopPairing();
        }
        
        call.resolve();
    }

    @objc public func startPairing(_ call: CAPPluginCall) {
        if (self.rcr1010 == nil) {
            self.rcr1010 = Rcr1010.init(delegate: self);
        }
        
        let code2D = call.getString("code") ?? ""
        
        let result = self.rcr1010.startPairing(with2DCode: code2D);
        
        call.resolve([
            "value": result
        ])
    }
    
    @objc public func startPairing(code2D: String) -> Bool {
        return self.rcr1010.startPairing(with2DCode: code2D);
    }
    
    @objc public func startPairing(code: String) -> Bool {
        return self.rcr1010.startPairing(withCode: code);
    }
    
    @objc public func rcr1010PairingSucceeded(identity: UUID) {
        self.notifyListeners("pairingSucceeded", data: ["uuid": identity.uuidString])
    }
    
    public func rcr1010CardDownloaded(identity: UUID, patientCard: PatientCard!, error: CardError) {
        var errorAsString: String? = nil;
        let eGK = (patientCard as? eGK);
        let pGK = (patientCard as? KVK);
        
        if error == CardError.NoError {
            errorAsString = "NoError"
        } else if error == CardError.CRCError {
            errorAsString = "CRCError"
        } else if error == CardError.FormatError {
            errorAsString = "FormatError"
        }
        
        var json = [
            "uuid" : identity.uuidString,
            "error" : errorAsString
        ]
        
        if (error == CardError.NoError) {
            let dateFormatter = DateFormatter();
            dateFormatter.dateFormat = "dd-MM-yyyy";
            
            json["geburtsdatum"] = dateFormatter.string(from: patientCard.Geburtsdatum)
            json["geschlecht"] = patientCard.Geschlecht == Gender.Male ? "männlich" : "weiblich"
            json["hausnummer"] = patientCard.Hausnummer
            json["kassenname"] = patientCard.Kassenname
            json["kostentraegerkennung"] = patientCard.Kostentraegerkennung
            json["land"] = patientCard.Land
            json["nachname"] = patientCard.Nachname
            json["namenszusatz"] = patientCard.Namenszusatz
            json["ort"] = patientCard.Ort
            json["postleitzahl"] = patientCard.Postleitzahl
            json["strasse"] = patientCard.Strasse
            json["titel"] = patientCard.Titel
            json["versichertenNummer"] = patientCard.Versichertennummer
            json["vorname"] = patientCard.Vorname
            
            if (pGK != nil) {
                json["privat"] = "true"
                json["versichertenStatus"] = pGK!.Hauptversichertenstatus;
            }
            
            if (eGK != nil) {
                json["privat"] = "false"
                json["versichertenStatus"] = eGK!.Versichertenstatus
                json["rawPersonalData"] = self.escapeString(text: eGK!.PersonalData)
                json["rawInsuranceData"] = self.escapeString(text: eGK!.InsuranceData)
            }
        }
        
        let data = try! JSONSerialization.data(withJSONObject: json, options: [])
        let convertedString = String(data: data, encoding: String.Encoding.utf8)
        
        self.notifyListeners("cardDownloaded", data: ["result": convertedString!])
    }
    
    func escapeString(text: String) -> String {
        var newString = text.replacingOccurrences(of: "\"", with: "\"\"")
        newString = text.replacingOccurrences(of: "\n", with: "")
        newString = text.replacingOccurrences(of: "\t", with: "")
        
        return newString
    }
    
    public func rcr1010DebugOutput(message: Any) {
        self.notifyListeners("debugOutput", data: ["message": message])
    }
}
