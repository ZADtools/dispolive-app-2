//
//  KVK.swift
//  Plugin
//
//  Created by Mathias Krüger on 22.09.21.
//  Copyright © 2021 Max Lynch. All rights reserved.
//

import Foundation

public class KVK: PatientCard
{
    public var VKNR: String!;
    public var Hauptversichertenstatus: String!;
    public var StatusErgaenzung: String!;
    
    public init(data: Array<UInt8>)
    {
        super.init();
        
        
        let applicationData: Dictionary<UInt8, Array<UInt8>> = ParseData(data: data, offset: 0, length: data.count);
        
        let patientData: Dictionary<UInt8, String> = ParseDataAsStrings(data: applicationData[0x60]!, offset: 0, length: applicationData[0x60]!.count);
        
        self.Kassenname = patientData[0x80];
        self.Kostentraegerkennung = patientData[0x81];
        self.VKNR = patientData[0x8F];
        self.Versichertennummer = patientData[0x82]
        self.Hauptversichertenstatus = patientData[0x83]
        self.StatusErgaenzung = patientData[0x90];
        self.Titel = patientData[0x84]
        self.Vorname = patientData[0x85]
        self.Namenszusatz = patientData[0x86]
        self.Nachname = patientData[0x87]
        
        let formatter = DateFormatter()
        formatter.dateFormat = "ddMMyyyy"
        formatter.timeZone = TimeZone(abbreviation: "UTC")
        let dob = patientData[0x88]
        self.Geburtsdatum = formatter.date(from: dob!)
        self.Strasse = patientData[0x89];
        self.Land = patientData[0x8A];
        self.Postleitzahl = patientData[0x8B];
        self.Ort = patientData[0x8C];
    }
    
    func ParseData(data: Array<UInt8>, offset: Int, length: Int) -> Dictionary<UInt8, Array<UInt8>>
    {
        var result = Dictionary<UInt8, Array<UInt8>>();
        
        var pos: Int = offset;
        while (true)
        {
            if ((length - (pos - offset)) < 2) { break; }
            let tag: UInt8 = data[pos]; pos += 1;
            if (data[pos] == 0x81) { pos += 1; }
            let elementLength = Int(data[pos]); pos += 1;
            if ((length - (pos - offset)) < elementLength) { break; }
            
            result[tag] = Array(data[pos..<(pos + elementLength)])
            pos += Int(elementLength);
        }
        
        return result;
    }
    
    func ParseDataAsStrings(data: Array<UInt8>, offset: Int, length: Int) -> Dictionary<UInt8, String>
    {
        var result = Dictionary<UInt8, String>();
        
        let charTable: Array<String> = [ " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ",
            " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ",
            " ", " ", " ", " ", " ", " ", "&", "`", "(", ")", " ", "+", " ", "-", ".", "/",
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", " ", " ", " ", " ", " ",
            " ", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
            "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Ä", "Ö", "Ü", " ", "_",
            " ", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
            "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ä", "ö", "ü", "ß", " ",
            " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ",
            " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ",
            " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
        ];
        
        let binaryResult = ParseData(data: data, offset: offset, length: data.count);
        
        for (key, data) in binaryResult
        {
            var tmp: String = "";
            for (c) in data
            {
                tmp += charTable[Int(c)]
            }
            result[key] = tmp;
        }
        
        return result;
    }
}
