(function() {
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

// Run autoBuy every second (or user-defined interval)
setInterval(autoBuy, 1000);

    let purchaseSpeed = 1000;
    let toggleHotkey = "T";
    let autoBuyInterval = null;

    function toggleAutoBuy() {
        if (autoBuyInterval) {
            clearInterval(autoBuyInterval);
            autoBuyInterval = null;
            console.log("⛔ Auto-buy stopped.");
            alert("Auto-buy stopped.");
        } else {
            autoBuyInterval = setInterval(buyCheapest, purchaseSpeed);
            console.log("▶️ Auto-buy started at speed:", purchaseSpeed, "ms");
            alert("Auto-buy started at speed: " + purchaseSpeed + " ms");
        }
    }

    document.addEventListener("keydown", function(event) {
        if (event.key.toUpperCase() === toggleHotkey) {
            toggleAutoBuy();
        }
    });

    function createGUI() {
        if (document.getElementById("autoBuyGUI")) return;

        let container = document.createElement("div");
        container.id = "autoBuyGUI";
        container.style.padding = "10px";
        container.style.marginTop = "10px";
        container.style.border = "2px solid #888";
        container.style.background = "#222";
        container.style.color = "#fff";

        let title = document.createElement("h3");
        title.innerText = "Auto-Buy Settings";
        container.appendChild(title);

        let speedLabel = document.createElement("label");
        speedLabel.innerText = "Purchase Speed (ms): ";
        container.appendChild(speedLabel);

        let speedInput = document.createElement("input");
        speedInput.type = "number";
        speedInput.value = 1000;
        speedInput.style.marginBottom = "10px";
        speedInput.onchange = function() {
            purchaseSpeed = parseInt(speedInput.value) || 1000;
        };
        container.appendChild(speedInput);

        container.appendChild(document.createElement("br"));

        let hotkeyLabel = document.createElement("label");
        hotkeyLabel.innerText = "Toggle Hotkey: ";
        container.appendChild(hotkeyLabel);

        let hotkeyInput = document.createElement("input");
        hotkeyInput.type = "text";
        hotkeyInput.value = "T";
        hotkeyInput.style.textTransform = "uppercase";
        hotkeyInput.maxLength = 1;
        hotkeyInput.onchange = function() {
            toggleHotkey = hotkeyInput.value.toUpperCase() || "T";
        };
        container.appendChild(hotkeyInput);

        container.appendChild(document.createElement("br"));

        let saveButton = document.createElement("button");
        saveButton.innerText = "Save Settings";
        saveButton.style.marginTop = "10px";
        saveButton.onclick = function() {
            alert("Settings saved! Purchase Speed: " + purchaseSpeed + " ms, Hotkey: " + toggleHotkey);
        };
        container.appendChild(saveButton);

        let menu = document.querySelector('#menu');
        if (menu) {
            menu.appendChild(container);
            console.log("✅ Auto-Buy GUI added to Options tab.");
        } else {
            console.error("⚠️ Options menu not found.");
        }
    }

    let originalUpdateMenu = Game.UpdateMenu;
    Game.UpdateMenu = function() {
        originalUpdateMenu.apply(this, arguments);
        if (Game.onMenu === 'prefs') {
            createGUI();
        }
    };

    let checkInterval = setInterval(function() {
        if (typeof Game !== 'undefined' && Game.ready) {
            clearInterval(checkInterval);
            Game.UpdateMenu();
            console.log("✅ Auto-Buy GUI initialized successfully!");
        }
    }, 500);
})();
