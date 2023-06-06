//
//  CardReaderResult.swift
//  Plugin
//
//  Created by Mathias Krüger on 22.09.21.
//  Copyright © 2021 Max Lynch. All rights reserved.
//

import Foundation

@objc
public class CardReaderResult: NSObject {
    
    public var uuid: String!
    public var error: String!
    public var Vorname: String!
    public var Nachname: String!
    public var Namenszusatz: String!
    public var Titel: String!
    public var Strasse: String!
    public var Hausnummer: String!
    public var Postleitzahl: String!
    public var Ort: String!
    public var Land: String!
    public var Geburtsdatum: Date!
    public var Versichertennummer: String!
    public var Geschlecht: Gender!
    public var Kostentraegerkennung: String!
    public var Kassenname: String!
    public var Versichertenstatus: String!
    
    override public var description: String {
        return "PatientCard: " + self.Nachname + ", " + self.Vorname;
    }
}

