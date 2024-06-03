# Powermeter widget

This is a simple widget for Scriptable that displays current power consumption data from your powermeter.

![IMG_1333](https://github.com/TurboDuke77/powermeter-widget/assets/38126777/580d946a-ea2f-4c97-8fb3-f79339e860cf)


## Setup

To set up the widget, follow these steps:

1. Load the `powermeter.js` file into Scriptable.
2. Update the `ip-adress` variable with the IP address or URL of your tasmota ir reader AND JSON variables.
3. Run the widget. Upon the first run, an `powermeter-config.json` file is created inside the Scriptable folder of your iCloud. 
4. If desired, you may customize the thresholds section as well to configure how the Power value is colored.

### JSON Output Tasmota device

depending on the variables used in the tasmota script, the designation “m60” or “power” must also be adapted. in my case, the output in the browser with the address http://IP-adress/cm?cmnd=status%208 looks like this

{"StatusSNS":{"Time":"2024-06-03T06:24:23","M60":{"E_in":2367.678,"E_out":41.915,"Power":46}}} <br><br>
see line in script: <br>
return parseFloat(powerDrawData.StatusSNS["M60"]["Power"]) || 0;


## Please note

Due to power saving specifications from Apple iOS, the widget update rate cannot be triggered by the script, it is performed by iOS. The time since the last update is therefore displayed.

## Accessing the widget from the Internet

It is strongly recommended **not** to completely expose your Tasmota device to the internet due to security reasons.
For additional security, you might want to set up HTTP Basic authentication for the URLs. The widget provides support for that as well (c.f. above).

## Links

- [Scriptable](https://scriptable.app/)
- [Tasmota Smart Meter Interface](https://tasmota.github.io/docs/Smart-Meter-Interface/)
- [Smartmeter Reader](https://www.ebay.de/sch/i.html?_from=R40&_nkw=smartmeter+tasmota+ir+reader&_sacat=0) find smartmeter reader with tasmota firmware
