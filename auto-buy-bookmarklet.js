(function() {
    let autoBuyInterval = null;

    function getCheapestBuilding() {
        let cheapest = null;
        let cheapestPrice = Infinity;

        Game.ObjectsById.forEach(building => {
            if (building.price < cheapestPrice) {
                cheapest = building;
                cheapestPrice = building.price;
            }
        });

        return cheapest;
    }

    function getCheapestUpgrades() {
        let cheapestUpgrades = [];
        let cheapestPrice = Infinity;

        Game.UpgradesById.forEach(upgrade => {
            if (upgrade.unlocked && !upgrade.bought && upgrade.basePrice <= cheapestPrice) {
                if (upgrade.basePrice < cheapestPrice) {
                    cheapestUpgrades = [upgrade]; // Reset list if we found a cheaper upgrade
                    cheapestPrice = upgrade.basePrice;
                } else if (upgrade.basePrice === cheapestPrice) {
                    cheapestUpgrades.push(upgrade); // Add to list if price is the same
                }
            }
        });

        return cheapestUpgrades;
    }

    function getBestUpgrade(upgrades) {
        let bestUpgrade = null;
        let bestCpsGain = 0;

        upgrades.forEach(upgrade => {
            let cpsBefore = Game.cookiesPs;
            upgrade.buy();
            let cpsAfter = Game.cookiesPs;
            upgrade.bought = 0; // Undo purchase for testing
            let cpsGain = cpsAfter - cpsBefore;

            if (cpsGain > bestCpsGain) {
                bestCpsGain = cpsGain;
                bestUpgrade = upgrade;
            }
        });

        return bestUpgrade;
    }

    function autoBuy() {
        let cheapestBuilding = getCheapestBuilding();
        let cheapestUpgrades = getCheapestUpgrades();

        if (!cheapestBuilding) {
            console.log("❌ No valid buildings found.");
            return;
        }

        if (cheapestUpgrades.length === 0) {
            console.log("❌ No valid upgrades found.");
            return;
        }

        console.log(`🏗️ Cheapest Building: ${cheapestBuilding.name} - ${cheapestBuilding.price}`);
        console.log(`🔼 Possible Cheapest Upgrades:`, cheapestUpgrades.map(u => u.name).join(", "));

        let buildingPrice = cheapestBuilding.price;
        let bestUpgrade = getBestUpgrade(cheapestUpgrades);

        if (bestUpgrade && bestUpgrade.basePrice <= buildingPrice * 2) {
            if (Game.cookies >= bestUpgrade.basePrice) {
                bestUpgrade.buy();
                console.log(`✅ Bought upgrade: ${bestUpgrade.name} (Best CPS Gain)`);
            }
        } else {
            if (Game.cookies >= buildingPrice) {
                cheapestBuilding.buy();
                console.log(`✅ Bought building: ${cheapestBuilding.name}`);
            }
        }
    }

    function toggleAutoBuy() {
        if (autoBuyInterval) {
            clearInterval(autoBuyInterval);
            autoBuyInterval = null;
            console.log("⏹️ Auto-buying stopped.");
        } else {
            autoBuyInterval = setInterval(autoBuy, getAutoBuyInterval());
            console.log("▶️ Auto-buying started.");
        }
    }

    function getAutoBuyInterval() {
        return parseInt(localStorage.getItem("autoBuyInterval")) || 1000;
    }

    function getAutoBuyHotkey() {
        return localStorage.getItem("autoBuyHotkey") || "F9";
    }

    function saveSettings() {
        const intervalInput = document.getElementById("autoBuyInterval");
        const hotkeyInput = document.getElementById("autoBuyHotkey");

        const settings = {
            interval: intervalInput.value,
            hotkey: hotkeyInput.value
        };

        localStorage.setItem("autoBuySettings", JSON.stringify(settings));
        console.log("✅ Settings saved:", settings);
    }

    function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("autoBuySettings"));

    if (settings) {
        document.getElementById("autoBuyInterval").value = settings.interval || 1000;
        document.getElementById("autoBuyHotkey").value = settings.hotkey || "F9";
    } else {
        // Set default values in case there's nothing saved yet
        document.getElementById("autoBuyInterval").value = 1000;
        document.getElementById("autoBuyHotkey").value = "F9";
    }

    console.log("🔄 Settings loaded:", settings);
}


    function createGUI() {
    if (document.getElementById("autoBuySettingsContainer")) return;

    const container = document.createElement("div");
    container.id = "autoBuySettingsContainer";

    // Load settings or set defaults
    const savedSettings = JSON.parse(localStorage.getItem("autoBuySettings"));
    const defaultSettings = { interval: 1000, hotkey: "F9" };
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
        alert("Settings saved!");
    });
}

    document.addEventListener("keydown", (event) => {
        if (event.key.toUpperCase() === getAutoBuyHotkey()) {
            toggleAutoBuy();
        }
    });

    Game.registerMod("autoBuyMod", {
        init: function() {
            console.log("✅ Auto-Buy Script Loaded!");
            createGUI();
        }
    });
})();
