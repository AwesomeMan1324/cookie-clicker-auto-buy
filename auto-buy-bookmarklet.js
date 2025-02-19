(function() {
    // Main buying function
    function buyCheapest() {
        let cheapestBuilding = null;
        let cheapestBuildingPrice = Infinity;
        
        // Check all buildings
        for (let i = 0; i < Game.ObjectsById.length; i++) {
            let building = Game.ObjectsById[i];
            
            // Check if you can afford the building and if it's the cheapest so far
            if (building.price <= Game.cookies && building.price < cheapestBuildingPrice) {
                cheapestBuilding = building;
                cheapestBuildingPrice = building.price;
            }
        }
        
        // Check all upgrades if no affordable building was found
        if (!cheapestBuilding) {
            let cheapestUpgrade = null;
            let cheapestUpgradePrice = Infinity;

            for (let i = 0; i < Game.UpgradesInStore.length; i++) {
                let upgrade = Game.UpgradesInStore[i];
                
                // Check if you can afford the upgrade and if it's the cheapest so far
                if (upgrade.getPrice() <= Game.cookies && upgrade.getPrice() < cheapestUpgradePrice) {
                    cheapestUpgrade = upgrade;
                    cheapestUpgradePrice = upgrade.getPrice();
                }
            }

            // If an upgrade is found, buy it
            if (cheapestUpgrade) {
                cheapestUpgrade.buy();
                console.log("Bought upgrade:", cheapestUpgrade.name);
                return;
            }
        }
        
        // If a building is found, buy it
        if (cheapestBuilding) {
            cheapestBuilding.buy();
            console.log("Bought building:", cheapestBuilding.name);
        }
    }
    
    // Initialize settings
    let purchaseSpeed = 1000;
    let toggleHotkey = "T";
    let autoBuyInterval = null;

    // Toggle the auto-buy script
    function toggleAutoBuy() {
        if (autoBuyInterval) {
            clearInterval(autoBuyInterval);
            autoBuyInterval = null;
            console.log("Auto-buy stopped.");
            alert("Auto-buy stopped.");
        } else {
            autoBuyInterval = setInterval(buyCheapest, purchaseSpeed);
            console.log("Auto-buy started at speed:", purchaseSpeed, "ms");
            alert("Auto-buy started at speed: " + purchaseSpeed + " ms");
        }
    }

    // Listen for hotkey press
    document.addEventListener("keydown", function(event) {
        if (event.key.toUpperCase() === toggleHotkey) {
            toggleAutoBuy();
        }
    });

    // Create GUI elements
    function createGUI() {
        // Check if the GUI already exists
        if (document.getElementById("autoBuyGUI")) return;

        // Create container
        let container = document.createElement("div");
        container.id = "autoBuyGUI";
        container.style.padding = "10px";
        container.style.marginTop = "10px";
        container.style.border = "2px solid #888";
        container.style.background = "#222";
        container.style.color = "#fff";

        // Title
        let title = document.createElement("h3");
        title.innerText = "Auto-Buy Settings";
        container.appendChild(title);

        // Speed input
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

        // Hotkey input
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

        // Save button
        let saveButton = document.createElement("button");
        saveButton.innerText = "Save Settings";
        saveButton.style.marginTop = "10px";
        saveButton.onclick = function() {
            alert("Settings saved! Purchase Speed: " + purchaseSpeed + " ms, Hotkey: " + toggleHotkey);
        };
        container.appendChild(saveButton);

        // Append to Options menu
        let menu = document.querySelector('#menu');
        if (menu) {
            menu.appendChild(container);
            console.log("Auto-Buy GUI added to Options tab.");
        } else {
            console.error("Options menu not found.");
        }
    }

    // Override Game's update menu to include our GUI
    let originalUpdateMenu = Game.UpdateMenu;
    Game.UpdateMenu = function() {
        originalUpdateMenu.apply(this, arguments);
        
        if (Game.onMenu === 'prefs') {
            createGUI();
        }
    };

    // Wait for the game to fully load, then initialize
    let checkInterval = setInterval(function() {
        if (typeof Game !== 'undefined' && Game.ready) {
            clearInterval(checkInterval);
            Game.UpdateMenu();
            console.log("Auto-Buy GUI initialized successfully!");
        }
    }, 500);
})();
