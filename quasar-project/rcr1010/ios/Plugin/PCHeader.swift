//
//  PCHeader.swift
//  Plugin
//
//  Created by Mathias Krüger on 22.09.21.
//  Copyright © 2021 Max Lynch. All rights reserved.
//

import Foundation
import CryptoSwift

enum CardType: UInt8 {
    case None = 0
    case EGK = 1
    case KVK = 2
}

enum PCHeaderError: Error {
    case recordTooShort
    case invalidCRC
}

class PCHeader
{
    public var CRC: UInt16 = 0
    public var Timestamp: UInt32 = 0
    public var Card: CardType
    public var CardSerial: Array<UInt8> = []
    public var DataCrc: UInt16 = 0
    public var KeyVersion: UInt16 = 0
    public var IV: Array<UInt8> = []
    public var DataLength: UInt16 = 0
    
    init (data: Array<UInt8>) throws
    {
        if (data.count < 41) { throw PCHeaderError.recordTooShort};
        
        self.CRC = UInt16(data[0]) | UInt16(data[1]) << 8 ;
        
        let cmpCrc = Array(data[2..<41]).crc16();
        if (cmpCrc != self.CRC) { throw PCHeaderError.invalidCRC};
        
        self.Timestamp = UInt32(data[2]) | UInt32(data[3]) << 8 | UInt32(data[4]) << 16 | UInt32(data[5]) << 24;
        self.Card = CardType(rawValue: data[6])!
        self.CardSerial = Array(data[7..<19])
        self.DataCrc = UInt16(data[19]) | UInt16(data[20]) << 8 ;
        self.KeyVersion = UInt16(data[21]) | UInt16(data[22]) << 8 ;
        self.IV = Array(data[23..<39])
        self.DataLength = UInt16(data[39]) | UInt16(data[40]) << 8 ;
    }
    
    public static func Parse(header: PCHeader, data: Array<UInt8>) -> PatientCard?
    {
        let cardData = Array(data[41..<data.count]);
        switch (header.Card)
        {
        case CardType.EGK:
            return DecryptEGK(header: header, data: cardData);
        case CardType.KVK:
            return DecryptKVK(header: header, data: cardData);
        default:
            break;
        }
        return nil;
    }
    
    static func DecryptKVK(header: PCHeader, data: Array<UInt8>) -> KVK?
    {
        if (data.count != 256 + 2) { return nil; }
        
        do {
            
            let key: Array<UInt8> = UserDefaults.standard.array(forKey: "rcr1010Key") as! Array<UInt8>
            let aes = try AES(key: key, blockMode: CBC(iv: header.IV))
            
            let plaintext = try aes.decrypt(data[0..<256]);
            
            return KVK(data: Array(plaintext[30..<256]));
        } catch
        {
        }
        return nil;
    }
    
    static func DecryptEGK(header: PCHeader, data: Array<UInt8>) -> eGK?
    {
        do {
            
            let key: Array<UInt8> = UserDefaults.standard.array(forKey: "rcr1010Key") as! Array<UInt8>
            let aes = try AES(key: key, blockMode: CBC(iv: header.IV))
            
            var pd = Array<UInt8>()
            var vd = Array<UInt8>()
            
            var pos: Int = 0;
            while(pos < data.count)
            {
                let length = UInt16(data[pos]) | UInt16(data[pos+1]) << 8 ; pos += 2;
                let crc = UInt16(data[pos]) | UInt16(data[pos+1]) << 8 ; pos += 2;
                let type = data[pos]; pos += 1;
                
                let elementData = data[pos..<(pos + Int(length))]; pos += Int(length);
                let plaintext = try aes.decrypt(elementData);
                
                if (crc != plaintext.crc16())
                {
                    return nil;
                }
                
                switch(type)
                {
                case 1:
                    pd = plaintext;
                    break;
                case 2:
                    vd = plaintext;
                    break;
                default:
                    break;
                }
            }
            return eGK(personalData: pd, insuranceData: vd);
        } catch {
            print("Unexpected error: \(error).")
        }
        
        return nil;
    }
}

