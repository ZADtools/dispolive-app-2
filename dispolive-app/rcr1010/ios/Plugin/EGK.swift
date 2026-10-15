//
//  EGK.swift
//  Plugin
//
//  Created by Mathias Krüger on 22.09.21.
//  Copyright © 2021 Max Lynch. All rights reserved.
//

import Foundation
import Gzip
import AEXML

public class eGK: PatientCard
{
    public var PersonalData: String!;
    public var InsuranceData: String!;
    
    init(personalData: Array<UInt8>, insuranceData: Array<UInt8>)
    {
        super.init();
        parsePersonalData(personalData: personalData);
        parseInsuranceData(insuranceData: insuranceData);
    }
    
    func parsePersonalData(personalData: Array<UInt8>)
    {
        let length: Int = Int(personalData[0]) << 8 | Int(personalData[1]);
        let pData = Array(personalData[2..<(2+length)])
        let zippedContent: Data = Data(bytes: pData, count: length);
        let unzippedData: Data = try! zippedContent.gunzipped()
        
        let options = AEXMLOptions()
        let xmlDoc = try! AEXMLDocument(xml: unzippedData, options: options)
        
        self.PersonalData = xmlDoc.xml.description
        
        self.Versichertennummer = xmlDoc.root["Versicherter"]["Versicherten_ID"].string
        self.Nachname = xmlDoc.root["Versicherter"]["Person"]["Nachname"].string
        self.Namenszusatz = xmlDoc.root["Versicherter"]["Person"]["Namenszusatz"].string
        self.Vorname = xmlDoc.root["Versicherter"]["Person"]["Vorname"].string
        self.Titel = xmlDoc.root["Versicherter"]["Person"]["Titel"].string
        switch (xmlDoc.root["Versicherter"]["Person"]["Geschlecht"].string)
        {
            case "M":
                self.Geschlecht = Gender.Male;
                break;
            case "W":
                self.Geschlecht = Gender.Female;
                break;
            default:
                break;
        }
        self.Postleitzahl = xmlDoc.root["Versicherter"]["Person"]["StrassenAdresse"]["Postleitzahl"].string
        self.Strasse = xmlDoc.root["Versicherter"]["Person"]["StrassenAdresse"]["Strasse"].string
        self.Hausnummer = xmlDoc.root["Versicherter"]["Person"]["StrassenAdresse"]["Hausnummer"].string
        self.Ort = xmlDoc.root["Versicherter"]["Person"]["StrassenAdresse"]["Ort"].string
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyyMMdd"
        formatter.timeZone = TimeZone(abbreviation: "UTC")
        self.Geburtsdatum = formatter.date(from: xmlDoc.root["Versicherter"]["Person"]["Geburtsdatum"].string)
    }
    
    func parseInsuranceData(insuranceData: Array<UInt8>)
    {
        let offset: Int = Int(insuranceData[0]) << 8 | Int(insuranceData[1]);
        let length: Int = Int(insuranceData[2]) << 8 | Int(insuranceData[3]);
        let pData = Array(insuranceData[offset..<(offset+length)])
        let zippedContent: Data = Data(bytes: pData, count: length);
        let unzippedData: Data = try! zippedContent.gunzipped()
        
        let options = AEXMLOptions()
        let xmlDoc = try! AEXMLDocument(xml: unzippedData, options: options)
        
        self.InsuranceData = xmlDoc.xml.description

        self.Versichertenstatus = xmlDoc.root["Versicherter"]["Zusatzinfos"]["ZusatzinfosGKV"]["Versichertenart"].string
        self.Kostentraegerkennung = xmlDoc.root["Versicherter"]["Versicherungsschutz"]["Kostentraeger"]["Kostentraegerkennung"].string
        self.Kassenname = xmlDoc.root["Versicherter"]["Versicherungsschutz"]["Kostentraeger"]["Name"].string
    }
}

