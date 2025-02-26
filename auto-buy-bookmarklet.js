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
            return savedSettings;
        }
        return { interval: 1000, hotkey: "T" }; // Default settings
    }

    // Create GUI
    function createGUI() {
        setTimeout(() => {
            const menu = document.getElementById("menu");
            if (!menu) {
                console.error("❌ Error: Options menu not found!");
                return;
            }

            if (document.getElementById("autoBuySettingsContainer")) return;

            const container = document.createElement("div");
            container.id = "autoBuySettingsContainer";

            const settings = loadSettings();

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

            menu.appendChild(container);

            document.getElementById("saveAutoBuySettings").addEventListener("click", () => {
                saveSettings();
                alert("✅ Settings saved!");
            });

            console.log("✅ Auto-Buy GUI created successfully!");
        }, 1000); // Small delay to ensure the Options menu is fully loaded
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
            let settings = loadSettings();
            autoBuyInterval = setInterval(autoBuy, settings.interval);
            console.log(`▶️ Auto-Buy Started (Interval: ${settings.interval}ms)`);
        }
    }

    // Listen for Hotkey
    document.addEventListener("keydown", (event) => {
        let settings = loadSettings();
        if (event.key.toUpperCase() === settings.hotkey) {
            toggleAutoBuy();
        }
    });

    // Run GUI
    createGUI();

    console.log("✅ Auto-Buy Script Loaded Successfully!");
})();
