const configFileName = "powermeter-config.json"; // Name of the config file

// This function handles loading settings
async function loadSettings() {
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, configFileName);

  if (fm.fileExists(path)) {
    // Read existing settings file
    let raw = await fm.readString(path);
    return JSON.parse(raw);
  } else {
    // First time run, create a default settings file
    let defaultSettings = {
      powermeter: "tasmota",
      tasmotaApiUrl: "http://192.168.178.64/cm?cmnd=status%208",
      tasmotaUser: "changeme",
      tasmotaPass: "changeme",
      showPowerDraw: 1,
      powerDrawThreshold: 0,
      redThreshold: 220,
      yellowThreshold: 260,
      greenThreshold: 400,
    };
    await fm.writeString(path, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
}

let settings = await loadSettings(); // Load settings

// Fetch data from the API
  async function fetchData(apiUrl, username, password, timeoutMillis) {
  let request = new Request(`${apiUrl}`);

  // Add basic authentication
  const auth = `${username}:${password}`;
  const base64Auth = btoa(auth);
  request.headers = {
    Authorization: `Basic ${base64Auth}`,
  };

  request.timeoutInterval = timeoutMillis;

  try {
    let response = await request.loadJSON();
    return response;
  } catch (error) {
//      console.error(`Could not fetch data: ${error}`);
     return null;
  }
}

// Helper function to retrieve power draw value from the API response
function getPowerDrawValue(powerDrawData) {
  if (settings.powermeter === "tasmota") {
    // Handle Tasmota API response structure
//     if (
//       powerDrawData &&
//       powerDrawData.StatusSNS &&
//       powerDrawData.StatusSNS.hasOwnProperty("")
//     ) {
      return parseFloat(powerDrawData.StatusSNS["M60"]["Power"]) || 0;
//     }
  } 
  return 0;
}

// Create widget
async function createWidget(data, powerDrawData) {
  let widget = new ListWidget();

  // Define gradient background color
  let startColor = new Color("#434C5E"); // Light Gray
  let endColor = new Color("#2E3440"); // Black
  let gradient = new LinearGradient();
  gradient.colors = [startColor, endColor];
  gradient.locations = [0, 1];
  widget.backgroundGradient = gradient;

  let title = widget.addText("Powermeter");
  title.textColor = Color.white();
  title.font = Font.boldSystemFont(16);


  widget.addSpacer(4); // Add some space between title and data

  let gridStack = widget.addStack();
  gridStack.layoutHorizontally();

  let leftStack = gridStack.addStack();
  leftStack.layoutVertically();

  if (settings.showPowerDraw) {
    let rightStack = gridStack.addStack();
    rightStack.layoutVertically();
    let powerDrawDataValue = powerDrawData
      ? parseFloat(getPowerDrawValue(powerDrawData))
      : 0;

    let powerDrawLabel = rightStack.addText(`Power consumption: `);
    powerDrawLabel.textColor = Color.white();
    powerDrawLabel.font = Font.systemFont(8);
    let powerDrawText = rightStack.addText(
      `${powerDrawDataValue.toFixed(0)} W`
    );
    powerDrawText.font = Font.systemFont(28);
    // Adjust color based on power draw value
    if (powerDrawDataValue > settings.powerDrawThreshold) {
      powerDrawText.textColor = Color.yellow();
    } else {
      powerDrawText.textColor = Color.green();
    }
  }

  // Add last updated timestamp
  widget.addSpacer(); // Add some space before the timestamp
  let timeStampStack = widget.addStack();
  timeStampStack.layoutVertically();
  timeStampStack.addSpacer();
  let refreshText = timeStampStack.addText("last update before");
  refreshText.textColor = Color.white();
  refreshText.font = Font.systemFont(8);
  let dateText = timeStampStack.addDate(new Date());
  dateText.textColor = Color.white();
  dateText.applyRelativeStyle();
  dateText.font = Font.systemFont(8); // set font size on the date text
  let agoText = timeStampStack.addText(" ago");
  agoText.textColor = Color.white();
  agoText.font = Font.systemFont(8);

  return widget;
}

// Main script
async function run() {
  try {
      let data = await fetchData(
       10000
      );
    let powerDrawData = settings.showPowerDraw
      ? await fetchData(
            settings.tasmotaApiUrl,
            settings.tasmotaUser,
            settings.tasmotaPass 
        )
      : null;

    let widget = await createWidget(data, powerDrawData);

    if (config.runsInWidget) {
      Script.setWidget(widget);
    } else {
      widget.presentSmall();
    }
  } catch (error) {
    console.error(error.message);
    let widget = new ListWidget();
    widget.addText("Error: Unable to connect to powermeter");
    if (config.runsInWidget) {
      Script.setWidget(widget);
    } else {
      widget.presentSmall();
    }
  }
}

await run();
