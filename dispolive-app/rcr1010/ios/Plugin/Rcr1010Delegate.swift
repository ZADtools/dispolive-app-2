//
//  Rcr1010Delegate.swift
//  Plugin
//
//  Created by Mathias Krüger on 22.09.21.
//  Copyright © 2021 Max Lynch. All rights reserved.
//

import Foundation

public protocol Rcr1010Delegate: NSObject {
    func rcr1010PairingSucceeded(identity: UUID)
    func rcr1010CardDownloaded(identity: UUID, patientCard: PatientCard!, error: CardError)
    func rcr1010DebugOutput(message: Any)
}
