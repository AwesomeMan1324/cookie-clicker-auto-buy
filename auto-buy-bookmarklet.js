(function() {
    if (window.autoBuyScriptLoaded) return;
    window.autoBuyScriptLoaded = true;

    console.log("🔄 Auto-Buy Script Loading...");

    // Save Settings
    function saveSettings() {
        const intervalInput = document.getElementById("autoBuyInterval").value;
        const hotkeyInput = document.getElementById("autoBuyHotkey").value.toUpperCase(); // Always store hotkey in uppercase

        const settings = {
            interval: parseInt(intervalInput),
            hotkey: hotkeyInput
        };

        localStorage.setItem("autoBuySettings", JSON.stringify(settings));
        console.log("✅ Settings saved:", settings);
    }

    // Load Settings
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem("autoBuySettings"));

        if (savedSettings) {
            document.getElementById("autoBuyInterval").value = savedSettings.interval;
            document.getElementById("autoBuyHotkey").value = savedSettings.hotkey;
            console.log("🔄 Settings loaded:", savedSettings);
        }
    }

    // Create GUI
    function createGUI() {
        if (document.getElementById("autoBuySettingsContainer")) return;

        const container = document.createElement("div");
        container.id = "autoBuySettingsContainer";

        // Load settings or set defaults
        const savedSettings = JSON.parse(localStorage.getItem("autoBuySettings"));
        const defaultSettings = { interval: 1000, hotkey: "T" }; // Default hotkey is "T"
        const settings = savedSettings || defaultSettings;

        container.innerHTML = `
            <div style="padding: 10px; background: rgba(0, 0, 0, 0.8); color: white; border: 1px solid white; margin-top: 10px;">
                <h3>Auto-Buy Settings</h3>
                <label>Interval (ms):</label>
                <input type="number" id="autoBuyInterval" value="${settings.interval}">
                <br>
                <label>Hotkey:</label>
                <input type="text" id="autoBuyHotkey" value="${settings.hotkey}">
                <br>
                <button id="saveAutoBuySettings">Save Settings</button>
            </div>
        `;

        document.getElementById("menu").appendChild(container);

        document.getElementById("saveAutoBuySettings").addEventListener("click", () => {
            saveSettings();
            alert("✅ Settings saved!");
        });

        // Ensure the settings are properly loaded on creation
        loadSettings();
    }

    // Auto-Buy Function
    function autoBuy() {
        if (!Game || !Game.ObjectsById || !Game.UpgradesById) {
            console.error("❌ Auto-Buy: Game not loaded.");
            return;
        }

        let buildings = Game.ObjectsById;
        let upgrades = Game.UpgradesById;

        let cheapestBuilding = null;
        let cheapestBuildingPrice = Infinity;

        let cheapestUpgrade = null;
        let cheapestUpgradePrice = Infinity;

        // Find cheapest building
        for (let key in buildings) {
            let building = buildings[key];
            if (building.price < cheapestBuildingPrice) {
                cheapestBuilding = building;
                cheapestBuildingPrice = building.price;
            }
        }

        // Find cheapest upgrade
        for (let key in upgrades) {
            let upgrade = upgrades[key];
            if (upgrade.unlocked && !upgrade.bought && upgrade.basePrice < cheapestUpgradePrice) {
                cheapestUpgrade = upgrade;
                cheapestUpgradePrice = upgrade.basePrice;
            }
        }

        // Decide what to buy
        if (cheapestBuilding && cheapestUpgrade) {
            let doubleBuildingPrice = cheapestBuildingPrice * 2;

            if (cheapestUpgradePrice <= doubleBuildingPrice) {
                if (cheapestUpgrade.canBuy()) {
                    cheapestUpgrade.buy();
                    console.log(`🔹 Bought Upgrade: ${cheapestUpgrade.name} for ${cheapestUpgradePrice}`);
                }
            } else {
                if (cheapestBuilding.canBuy()) {
                    cheapestBuilding.buy();
                    console.log(`🏗️ Bought Building: ${cheapestBuilding.name} for ${cheapestBuildingPrice}`);
                }
            }
        } else if (cheapestBuilding) {
            if (cheapestBuilding.canBuy()) {
                cheapestBuilding.buy();
                console.log(`🏗️ Bought Building: ${cheapestBuilding.name} for ${cheapestBuildingPrice}`);
            }
        } else if (cheapestUpgrade) {
            if (cheapestUpgrade.canBuy()) {
                cheapestUpgrade.buy();
                console.log(`🔹 Bought Upgrade: ${cheapestUpgrade.name} for ${cheapestUpgradePrice}`);
            }
        }
    }

    // Start/Stop Auto-Buy with Hotkey
    let autoBuyInterval = null;

    function toggleAutoBuy() {
        if (autoBuyInterval) {
            clearInterval(autoBuyInterval);
            autoBuyInterval = null;
            console.log("⏹️ Auto-Buy Stopped.");
        } else {
            let settings = JSON.parse(localStorage.getItem("autoBuySettings")) || { interval: 1000 };
            autoBuyInterval = setInterval(autoBuy, settings.interval);
            console.log(`▶️ Auto-Buy Started (Interval: ${settings.interval}ms)`);
        }
    }

    // Listen for Hotkey
    document.addEventListener("keydown", (event) => {
        let settings = JSON.parse(localStorage.getItem("autoBuySettings")) || { hotkey: "T" };
        if (event.key.toUpperCase() === settings.hotkey) {
            toggleAutoBuy();
        }
    });

    // Run GUI
    createGUI();

    console.log("✅ Auto-Buy Script Loaded Successfully!");
})();
