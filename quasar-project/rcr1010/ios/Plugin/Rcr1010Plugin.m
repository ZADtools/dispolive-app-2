#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(Rcr1010Plugin, "Rcr1010",
           CAP_PLUGIN_METHOD(isPaired, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isPairing, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isScanning, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startScan, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(stopScan, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(startPairing, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopPairing, CAPPluginReturnNone);
)
