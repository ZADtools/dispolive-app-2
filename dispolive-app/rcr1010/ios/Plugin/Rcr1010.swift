import Foundation
import CoreBluetooth
import CryptoSwift

@objc
@objcMembers
public class Rcr1010: NSObject, CBCentralManagerDelegate, CBPeripheralDelegate {
    
    var manager:CBCentralManager!
    var peripheral:CBPeripheral!
    var iv: Array<UInt8>!
    var characteristic: CBCharacteristic!
    var slotBuffers = [Int: [Int: Array<UInt8>]]()
    var slotLength = [Int: Int]()
    var pairingKey: Array<UInt8>!
    var delegate: Rcr1010Delegate!;
    var bleState: CBManagerState!;
    var timer: Timer!;
    var lastPacket: Int64 = 0;
    
    public init (delegate: Rcr1010Delegate) {
        super.init();
        
        self.delegate = delegate;
        self.bleState = CBManagerState.unknown;
        self.manager = CBCentralManager(delegate: self, queue: nil)
        self.timer = Timer.scheduledTimer(timeInterval: 0.1, target: self, selector: #selector(self.checkForRestart), userInfo: nil, repeats: true);
    }
    
    @objc
    public var isScanning: Bool {
        get {
          return ((self.pairingKey == nil) && (manager.isScanning));
        }
    }
    
    @objc
    public var isPaired: Bool {
        get {
            return (UserDefaults.standard.string(forKey: "rcr1010UUID") != nil);
        }
    }
    
    @objc
    public var isPairing: Bool {
        get {
            return (self.pairingKey != nil)
        }
    }
    
    public func centralManagerDidUpdateState(_ central: CBCentralManager) {
        bleState = central.state;
    }
    
    public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        do {
            let manufacturerData = advertisementData[CBAdvertisementDataManufacturerDataKey]
            if (manufacturerData == nil) { return; }
            let advNSData: NSData =  manufacturerData as! NSData
            var advData = [UInt8](repeating: 0, count: advNSData.length)
            advNSData.getBytes(&advData, length:advNSData.length)
            if ((advData[0] == 0x00) && (advData[1] == 0x00) && (advData[2] == 0xFF) && (self.pairingKey != nil)) // Pairing-Request
            {
                let encKey: Array<UInt8> = Array(advData[4..<20])
                let aes = try AES(key: self.pairingKey, blockMode: ECB())
                let key = try aes.decrypt(encKey)
                let cmpCRC = UInt16(advData[20]) << 8 | UInt16(advData[21])
                if (key.crc16() == cmpCRC)
                {
                    let keyVersion = advData[3]
                    let uuid = peripheral.identifier
                    UserDefaults.standard.set(Int(keyVersion), forKey: "rcr1010KeyVersion")
                    UserDefaults.standard.set(key, forKey: "rcr1010Key")
                    UserDefaults.standard.set(peripheral.identifier.uuidString, forKey: "rcr1010UUID")
                    //delegate.rcr1010DebugOutput(message: "Pairing SUCCESS: "+uuid.uuidString+", keyVersion="+keyVersion.description);
                    delegate.rcr1010PairingSucceeded(identity: uuid);
                }
                manager.stopScan();
            }
            else if ((advData[0] == 0x00) && (advData[1] == 0x00) && (advData[2] == 0x00)) // Download-Request
            {
                let pairedRCR = UserDefaults.standard.string(forKey: "rcr1010UUID")
                if ((pairedRCR != nil) && (peripheral.identifier.uuidString == pairedRCR))
                {
                    let keyVersion = Int(advData[3])
                    if (keyVersion == UserDefaults.standard.integer(forKey: "rcr1010KeyVersion"))
                    {
                        let numberOfCards = advData[4]
                        delegate.rcr1010DebugOutput(message: "Trying to download "+numberOfCards.description+" cards from "+peripheral.identifier.uuidString)
                        self.peripheral = peripheral;
                        self.peripheral.delegate = self;
                        manager.connect (self.peripheral, options: nil)
                    } else {
                        delegate.rcr1010DebugOutput(message: "Removing Pairing because of wrong KeyVersion of "+peripheral.identifier.uuidString)
                        UserDefaults.standard.removeObject(forKey: "rcr1010KeyVersion")
                        UserDefaults.standard.removeObject(forKey: "rcr1010Key")
                        UserDefaults.standard.removeObject(forKey: "rcr1010UUID")
                    }
                } else {
                    //delegate.rcr1010DebugOutput(message: "Ignoring unknown RCR1010")
                }
            }
        } catch
        {
            delegate.rcr1010DebugOutput(message: "ERROR");
        }
    }
    
    public func centralManager(_ central: CBCentralManager,
                               didConnect peripheral: CBPeripheral)
    {
        delegate.rcr1010DebugOutput(message: "Connected to "+peripheral.identifier.uuidString);
        peripheral.discoverServices(nil)
    }
    
    
    public func peripheral(_ peripheral: CBPeripheral,
                           didDiscoverServices error: Error?)
    {
        for service in peripheral.services!
        {
            //let thisService = service as CBService
            
            if service.uuid == CBUUID(string: "66a7575a-8c1d-41b4-a5e7-de037a4d9b09")
            {
                delegate.rcr1010DebugOutput(message: "Found service of "+peripheral.identifier.uuidString);
                peripheral.discoverCharacteristics(nil, for: service)
            }
        }
    }
    
    public func peripheral(_ peripheral: CBPeripheral,
                           didDiscoverCharacteristicsFor service: CBService,
                           error: Error?)
    {
        for characteristic in service.characteristics!
        {
            let thisCharacteristic = characteristic as CBCharacteristic
            
            if thisCharacteristic.uuid == CBUUID(string: "0a73cdb1-765d-48d8-8a47-20793d51bd37") {
                delegate.rcr1010DebugOutput(message: "Found Characteristic of "+peripheral.identifier.uuidString);
                self.characteristic = characteristic;
                self.peripheral.setNotifyValue(
                    true,
                    for: thisCharacteristic
                )
            }
        }
    }
    
    public func startScan()
    {
        manager.scanForPeripherals(withServices: nil, options: nil);
    }
    
    public func stopScan()
    {
        delegate.rcr1010DebugOutput(message: "Stop scanning....");
        manager.stopScan();
    }
    
    public func startPairing(withKey: Array<UInt8>) -> Bool
    {
        delegate.rcr1010DebugOutput(message: "Start pairing....");
        
        if (bleState != CBManagerState.poweredOn)
        {
            return false;
        }
        
        self.pairingKey = withKey;
        manager.stopScan();
        manager.scanForPeripherals(withServices: nil, options: nil);
        return true;
    }
    
    public func stopPairing()
    {
        delegate.rcr1010DebugOutput(message: "Stop pairing....");
        manager.stopScan();
        self.pairingKey = nil;
    }
    
    
    public func startPairing(with2DCode: String) -> Bool
    {
        let pattern = "PCD:([0-9A-Za-z-=]+)";
        let regex = try! NSRegularExpression(pattern: pattern, options: [])
        let matches = regex.matches(in: with2DCode, options: [], range: NSRange(location: 0, length: with2DCode.count))
        if (matches.count == 1)
        {
            let nsString = with2DCode as NSString
            let code = nsString.substring(with: matches.first!.range(at: 1))
            let key = Array(String2Binary(charset: "-=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", string: code)[0..<16]);
            return startPairing(withKey: key);
        }
        return false;
    }
    
    public func startPairing(withCode: String) -> Bool
    {
        let key = Array(String2Binary(charset: "ABCDEFGHKLMNPQRS", string: withCode)[0..<16]);
        return startPairing(withKey: key);
    }
    
    func String2Binary(charset: String, string: String) -> Array<UInt8>!
    {
        let charLen = log2(Double(charset.count));
        if (charLen != Double(Int(charLen))) { return nil; }
        
        var result = Array<UInt8>();
        var bytepos = 0;
        var bitpos = 0;
        
        result.append(0x00);
        for (c) in string
        {
            var tmp = charset.indexDistance(of: c);
            if (tmp == nil) { return nil; }
            for (_) in 0..<Int(charLen)
            {
                if (bytepos < string.count)
                {
                    result[bytepos] = result[bytepos] >> 1;
                    if ((Int(tmp!) & 0x01) != 0)
                    {
                        result[bytepos] |= 0x80;
                    }
                    tmp = tmp! >> 1;
                    bitpos += 1;
                    if (bitpos == 8)
                    {
                        result.append(0x00);
                        bytepos += 1;
                        bitpos = 0;
                    }
                }
            }
        }
        return result;
    }
    
    func getCurrentMillis()->Int64{
        return  Int64(NSDate().timeIntervalSince1970 * 1000)
    }
    
    @objc private func checkForRestart()
    {
        if (self.lastPacket != 0)
        {
            if (Int64(getCurrentMillis() - self.lastPacket) > 2000)
            {
                sendCommandBuffer(data: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
                self.lastPacket = 0;
                delegate.rcr1010DebugOutput(message: "Retrying download after 2000ms");

            }
        }
    }
    
    public func peripheral(_ peripheral: CBPeripheral,
                           didUpdateValueFor characteristic: CBCharacteristic,
                           error: Error?)
    {
        let value = [UInt8](characteristic.value!)
        self.lastPacket = getCurrentMillis();
        switch(value[0])
        {
        case 0x0A: // KPIs
            let kpiStarts = UInt16(value[2]) | UInt16(value[3]) << 8
            let kpiEGK = UInt16(value[4]) | UInt16(value[5]) << 8
            let kpiKVK = UInt16(value[6]) | UInt16(value[7]) << 8
            let kpiDownloads = UInt16(value[8]) | UInt16(value[9]) << 8
            let kpiPairings = UInt16(value[10]) | UInt16(value[11]) << 8
            let kpiVoltage = Double(UInt16(value[12]) | UInt16(value[13]) << 8) / 204.8
            let firmware = UInt16(value[14]) | UInt16(value[15]) << 8
            delegate.rcr1010DebugOutput(message: String(format: "Starts=%d, EGK=%d, KVK=%d, Downloads=%d, Pairings=%d, Voltage=%.2f, Firmware=%d", kpiStarts, kpiEGK, kpiKVK, kpiDownloads, kpiPairings, kpiVoltage, firmware));
        case 0x0B: // IV
            self.slotBuffers.removeAll();
            self.slotLength.removeAll();
            self.iv = Array(value[1..<17])
            sendCommandBuffer(data: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
            break;
        case 0x10: // Data packet
            let slot = Int(value[1]);
            let packet = Int(value[2]);
            let lastPacket = ((value[3] & 0x01) == 0x01);
            
            if (self.slotBuffers[slot] == nil)
            {
                self.slotBuffers[slot] = [Int: Array<UInt8>]();
            }
            if (lastPacket)
            {
                self.slotLength[slot] = packet + 1
            }

            self.slotBuffers[slot]?[packet] = Array(value[4..<value.count])
            delegate.rcr1010DebugOutput(message: "Received Slot " + slot.description + ", Packet " + packet.description)
            break;
        case 0x11: // End of packets
            for (slotNr) in self.slotBuffers.keys
            {
                if ((self.slotLength[slotNr] == nil) ||
                    (self.slotBuffers[slotNr]?.count != self.slotLength[slotNr]))
                {
                    delegate.rcr1010DebugOutput(message: "Missing Packet, restarting");
                    sendCommandBuffer(data: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
                    return;
                }
            }
            
            for (slotNr, buffer) in self.slotBuffers
            {
                var slotBuffer = Array<UInt8>();
                let len: Int = self.slotLength[slotNr]!
                for index in 0...len-1
                {
                    let data: Array<UInt8> = buffer[index]!
                    slotBuffer.append(contentsOf: data)
                }
                do {
                    let header = try PCHeader(data: slotBuffer);
                    let card = PCHeader.Parse(header: header, data: slotBuffer)
                    if (card != nil)
                    {
                        delegate.rcr1010CardDownloaded(identity: peripheral.identifier, patientCard: card!, error: CardError.NoError);
                    } else {
                        delegate.rcr1010CardDownloaded(identity: peripheral.identifier, patientCard: nil, error: CardError.CRCError);
                    }
                }
                catch
                {
                }
            }
            
            sendCommandBuffer(data: [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]);
            self.lastPacket = 0;
            self.manager.stopScan()
            self.manager.scanForPeripherals(withServices: nil, options: nil)
            break;
        default:
            break;
        }
    }
    
    func sendCommandBuffer(data: Array<UInt8>)
    {
        if (data.count != 16) { return };
        
        do
        {
            let key: Array<UInt8> = UserDefaults.standard.array(forKey: "rcr1010Key") as! Array<UInt8>
            let aes = try AES(key: key, blockMode: ECB())
            
            var encryptedBuffer = [UInt8](repeating: 0, count: 18)
            
            let crc = data.crc16();
            encryptedBuffer[16] = UInt8(crc >> 8);
            encryptedBuffer[17] = UInt8(crc & 0xFF);
            
            var dataBuffer = data;
            for index in 0...15
            {
                dataBuffer[index] ^= self.iv[index];
            }
            
            let encryptedData = try aes.encrypt(dataBuffer);
            
            for index in 0...15
            {
                encryptedBuffer[index] = encryptedData[index];
            }
            self.peripheral.writeValue(Data(encryptedBuffer), for: self.characteristic, type: CBCharacteristicWriteType.withoutResponse);
        }
        catch
        {
        }
    }
}

extension String {
    func indexDistance(of character: Character) -> Int? {
        guard let index = firstIndex(of: character) else { return nil }
        return distance(from: startIndex, to: index)
    }
}
