const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const readlineSync = require("readline-sync");
const chalk = require("chalk");

console.log(chalk.bold.blue("\n" + "=".repeat(60)));
console.log(chalk.bold.blue("🛒 ZEPTO AUTOMATION"));
console.log(chalk.bold.blue("=".repeat(60) + "\n"));

(async () => {
    let options = new chrome.Options();
    options.addArguments("--start-maximized");

    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    try {
        await driver.get("https://www.zepto.com");
        await driver.sleep(3000); // wait for popup

        // Close location popup if exists
        try {
            let closeBtn = await driver.findElement(By.css('[aria-label="close"]'));
            await closeBtn.click();
            console.log(chalk.green("✓ Popup closed!"));
        } catch (e) {
            console.log(chalk.yellow("ℹ No popup found — continuing..."));
        }

        // Select Location
        try {
            console.log(chalk.cyan("📍 Selecting location..."));
            await driver.sleep(1000);

            // Find and click "Select Location" button
            let selectLocationBtn = await driver.wait(
                until.elementLocated(By.css('button[aria-label="Select Location"]')),
                10000
            );
            await driver.executeScript("arguments[0].click();", selectLocationBtn);
            console.log(chalk.green("✓ Clicked 'Select Location' button"));

            // Wait for popup to appear
            await driver.sleep(2000);

            // Find and click "Enable" button in the popup
            let enableBtn;
            try {
                // Try by class combination first (button has classes: cpG2SV cVzWKq cimLEg)
                enableBtn = await driver.wait(
                    until.elementLocated(By.css('button.cpG2SV.cVzWKq.cimLEg, button.cpG2SV, button[class*="cpG2SV"]')),
                    5000
                );
            } catch (e) {
                // Fallback to XPath by text
                try {
                    enableBtn = await driver.wait(
                        until.elementLocated(By.xpath("//button[contains(text(), 'Enable')]")),
                        5000
                    );
                } catch (e2) {
                    // Last resort: find any button with "Enable" text
                    const buttons = await driver.findElements(By.css('button'));
                    for (let btn of buttons) {
                        const text = await btn.getText();
                        if (text && text.trim() === 'Enable') {
                            enableBtn = btn;
                            break;
                        }
                    }
                    if (!enableBtn) throw new Error("Enable button not found");
                }
            }
            await driver.executeScript("arguments[0].click();", enableBtn);
            console.log(chalk.green("✓ Clicked 'Enable' button"));

            await driver.sleep(2000); // Wait for location to be set
        } catch (e) {
            console.log(chalk.yellow(`ℹ Location selection skipped: ${e.message}`));
        }

        // Scroll to make login button visible
        await driver.executeScript("window.scrollTo(0, 200)");

        // Wait → Click login button
        let loginBtn = await driver.wait(
            until.elementLocated(By.css('button[aria-label="login"]')),
            10000
        );
        await driver.sleep(1000);
        await loginBtn.click();

        // Read phone number
        const phoneNumber = readlineSync.question(chalk.cyan("Enter phone number: "));

        // Insert phone number
        let phoneInput = await driver.wait(
            until.elementLocated(By.css('input[type="tel"]')),
            10000
        );
        await phoneInput.sendKeys(phoneNumber);

        // Click Continue safely using JS (overlay safe)
        let continueBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[.//div[text()='Continue']]")),
            10000
        );
        await driver.executeScript("arguments[0].click();", continueBtn);

        // Wait for OTP input fields to appear
        await driver.wait(
            until.elementsLocated(By.css('input[inputmode="numeric"][type="text"]')),
            10000
        );
        await driver.sleep(1000); // Small delay to ensure fields are ready

        // Read OTP from CLI
        const otp = readlineSync.question(chalk.cyan("Enter 6-digit OTP: "));

        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            throw new Error("OTP must be exactly 6 digits");
        }

        // Find all OTP input fields (they're in a container with class containing "fugkX")
        // Using XPath to find inputs within the OTP container
        let otpFields = await driver.findElements(
            By.xpath('//div[contains(@class, "fugkX")]//input[inputmode="numeric"]')
        );

        // Fallback: if not found by container, use first 6 numeric inputs
        if (otpFields.length < 6) {
            otpFields = await driver.findElements(By.css('input[inputmode="numeric"][type="text"]'));
            otpFields = otpFields.slice(0, 6);
        }

        // Enter each digit into corresponding input field
        for (let i = 0; i < 6; i++) {
            await otpFields[i].clear();
            await otpFields[i].sendKeys(otp[i]);
            await driver.sleep(100); // Small delay between inputs
        }

        console.log(chalk.green("\n✅ OTP entered successfully!"));
        await driver.sleep(3000); // Wait for login to complete

        // Function to extract products from a category page
        async function extractProducts(categoryName, categoryUrl) {
            console.log(chalk.blue(`\n${"=".repeat(60)}`));
            console.log(chalk.bold.blue(`\n📦 ${categoryName.toUpperCase()}`));
            console.log(chalk.blue(`${"=".repeat(60)}\n`));

            try {
                await driver.get(categoryUrl);
                await driver.sleep(3000); // Wait for page to load

                // Scroll to load more products
                await driver.executeScript("window.scrollTo(0, document.body.scrollHeight/2);");
                await driver.sleep(2000);
                await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
                await driver.sleep(2000);

                // Extract products using JavaScript (more reliable for dynamic content)
                let products = await driver.executeScript(`
                    const products = [];
                    const seen = new Set();
                    
                    // Find all product links with class B4vNQ
                    const productLinks = document.querySelectorAll('a.B4vNQ[href*="/pn/"]');
                    
                    productLinks.forEach((link, index) => {
                        try {
                            // Extract product name from data-slot-id="ProductName"
                            let name = '';
                            const nameElement = link.querySelector('[data-slot-id="ProductName"] span, [data-slot-id="ProductName"]');
                            if (nameElement) {
                                name = nameElement.innerText || nameElement.textContent || '';
                            }
                            
                            // Fallback: try alt or title from image
                            if (!name || name.trim().length < 3) {
                                const img = link.querySelector('img');
                                if (img) {
                                    name = img.getAttribute('alt') || img.getAttribute('title') || '';
                                }
                            }
                            
                            name = name.trim();
                            
                            // Extract prices using the specific structure
                            let currentPrice = '';
                            let originalPrice = '';
                            
                            // Find price container with data-slot-id="EdlpPrice"
                            const priceContainer = link.querySelector('div[data-slot-id="EdlpPrice"]');
                            
                            if (priceContainer) {
                                // Get current price (discounted) - class cptQT7
                                const currentPriceEl = priceContainer.querySelector('span.cptQT7');
                                if (currentPriceEl) {
                                    currentPrice = (currentPriceEl.innerText || currentPriceEl.textContent || '').trim();
                                }
                                
                                // Get original price - class cx3iWL
                                const originalPriceEl = priceContainer.querySelector('span.cx3iWL');
                                if (originalPriceEl) {
                                    originalPrice = (originalPriceEl.innerText || originalPriceEl.textContent || '').trim();
                                }
                            }
                            
                            // Get product href for later reference
                            const href = link.getAttribute('href') || '';
                            
                            // Check if product is in stock (has ADD button, not Notify)
                            const addButton = link.querySelector('button.ciE0m4.ceUl7T.cuPUm6.cnCei3');
                            const isInStock = addButton && addButton.textContent.trim() === 'ADD';
                            
                            // Only add if we have a valid name
                            if (name && name.length > 3 && name.length < 200 && !seen.has(name.toLowerCase())) {
                                seen.add(name.toLowerCase());
                                products.push({
                                    index: index,
                                    name: name,
                                    currentPrice: currentPrice || '',
                                    originalPrice: originalPrice || '',
                                    href: href,
                                    isInStock: isInStock
                                });
                            }
                        } catch (e) {
                            // Skip this product if there's an error
                        }
                    });
                    
                    return products.slice(0, 50);
                `);

                // Display products in table format
                if (products.length > 0) {
                    // Calculate column widths
                    const maxNameLength = Math.min(Math.max(...products.map(p => p.name.length)), 60);
                    const nameWidth = Math.max(30, maxNameLength);

                    // Table header
                    console.log(chalk.bold.cyan("┌" + "─".repeat(5) + "┬" + "─".repeat(nameWidth + 2) + "┬" + "─".repeat(25) + "┐"));
                    console.log(chalk.bold.cyan("│ " + "No.".padEnd(3) + " │ " + "Product Name".padEnd(nameWidth) + " │ " + "Price".padEnd(23) + " │"));
                    console.log(chalk.bold.cyan("├" + "─".repeat(5) + "┼" + "─".repeat(nameWidth + 2) + "┼" + "─".repeat(25) + "┤"));

                    // Table rows
                    products.forEach((product, index) => {
                        const num = (index + 1).toString().padEnd(3);
                        const name = product.name.length > nameWidth
                            ? product.name.substring(0, nameWidth - 3) + "..."
                            : product.name.padEnd(nameWidth);

                        // Format price display
                        let priceDisplay = '';
                        if (product.currentPrice && product.originalPrice && product.currentPrice !== product.originalPrice) {
                            priceDisplay = chalk.green(product.currentPrice) + ' ' + chalk.gray.strikethrough(product.originalPrice);
                        } else if (product.currentPrice) {
                            priceDisplay = chalk.green(product.currentPrice);
                        } else if (product.originalPrice) {
                            priceDisplay = chalk.white(product.originalPrice);
                        } else {
                            priceDisplay = chalk.gray('Price N/A');
                        }

                        const stockStatus = product.isInStock ? chalk.green('✓') : chalk.red('✗');

                        console.log(chalk.white("│ ") + chalk.bold(num) + chalk.white(" │ ") +
                            chalk.white(name) + chalk.white(" │ ") +
                            priceDisplay + " ".repeat(Math.max(0, 23 - (product.currentPrice.length + product.originalPrice.length))) +
                            chalk.white(" │ ") + stockStatus);
                    });

                    // Table footer
                    console.log(chalk.bold.cyan("└" + "─".repeat(5) + "┴" + "─".repeat(nameWidth + 2) + "┴" + "─".repeat(25) + "┘"));
                    console.log(chalk.green(`\n✓ Found ${products.length} products in ${categoryName}\n`));

                    return products; // Return products for selection
                } else {
                    console.log(chalk.yellow(`⚠ No products found in ${categoryName}\n`));
                    return [];
                }

            } catch (err) {
                console.log(chalk.red(`✗ Error loading ${categoryName}: ${err.message}\n`));
                return [];
            }
        }

        // Display categories and products
        console.log(chalk.bold.magenta("\n" + "=".repeat(60)));
        console.log(chalk.bold.magenta("🛒 ZEPTO PRODUCT CATALOG"));
        console.log(chalk.bold.magenta("=".repeat(60) + "\n"));

        // Chips category
        const chipsProducts = await extractProducts(
            "Chips & Crisps",
            "https://www.zepto.com/cn/munchies/chips-crisps/cid/d2c2a144-43cd-43e5-b308-92628fa68596/scid/df4f5100-c02f-4906-83b8-ddb744081a7a"
        );

        // Function to add products to cart
        async function addProductsToCart(products, categoryUrl, categoryName) {
            if (!products || products.length === 0) {
                console.log(chalk.yellow("No products available to add to cart."));
                return;
            }

            // Ask user to select products
            console.log(chalk.cyan("\n" + "=".repeat(60)));
            console.log(chalk.bold.cyan("🛒 ADD PRODUCTS TO CART"));
            console.log(chalk.cyan("=".repeat(60)));
            console.log(chalk.yellow("\nEnter product numbers to add to cart:"));
            console.log(chalk.gray("  - Single product: 1"));
            console.log(chalk.gray("  - Multiple products: 1,2,3 or 1-5"));
            console.log(chalk.gray("  - Press Enter to skip\n"));

            const selection = readlineSync.question(chalk.cyan("Your selection: "));

            if (!selection || selection.trim() === '') {
                console.log(chalk.yellow("No products selected. Skipping..."));
                return;
            }

            // Parse selection
            const selectedIndices = new Set();
            const parts = selection.split(',');

            for (let part of parts) {
                part = part.trim();
                if (part.includes('-')) {
                    // Range selection (e.g., 1-5)
                    const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            if (i >= 1 && i <= products.length) {
                                selectedIndices.add(i - 1); // Convert to 0-based index
                            }
                        }
                    }
                } else {
                    // Single number
                    const num = parseInt(part);
                    if (!isNaN(num) && num >= 1 && num <= products.length) {
                        selectedIndices.add(num - 1); // Convert to 0-based index
                    }
                }
            }

            if (selectedIndices.size === 0) {
                console.log(chalk.red("Invalid selection. No products will be added."));
                return;
            }

            console.log(chalk.blue(`\n📦 Adding ${selectedIndices.size} product(s) to cart...\n`));

            // Navigate back to category page
            await driver.get(categoryUrl);
            await driver.sleep(3000);

            // Scroll to load products
            await driver.executeScript("window.scrollTo(0, document.body.scrollHeight/2);");
            await driver.sleep(1000);

            // Find and click ADD buttons for selected products
            let addedCount = 0;
            for (let index of selectedIndices) {
                const product = products[index];
                if (!product) continue;

                try {
                    // Find the product link by href or by index
                    const productLinks = await driver.findElements(By.css('a.B4vNQ[href*="/pn/"]'));

                    if (productLinks.length > product.index) {
                        const productLink = productLinks[product.index];

                        // Scroll to the product
                        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", productLink);
                        await driver.sleep(500);

                        // Find ADD button within this product link
                        const addButton = await productLink.findElement(
                            By.css('button.ciE0m4.ceUl7T.cuPUm6.cnCei3')
                        );

                        const buttonText = await addButton.getText();
                        if (buttonText.trim() === 'ADD') {
                            await driver.executeScript("arguments[0].click();", addButton);
                            console.log(chalk.green(`✓ Added: ${product.name.substring(0, 50)}...`));
                            addedCount++;
                            await driver.sleep(1000); // Wait between clicks
                        } else {
                            console.log(chalk.yellow(`⚠ Skipped (out of stock): ${product.name.substring(0, 50)}...`));
                        }
                    }
                } catch (e) {
                    console.log(chalk.red(`✗ Failed to add: ${product.name.substring(0, 50)}...`));
                }
            }

            console.log(chalk.green(`\n✅ Successfully added ${addedCount} product(s) to cart!\n`));
        }

        // Function to checkout and place order
        async function checkoutAndPlaceOrder() {
            try {
                console.log(chalk.cyan("\n" + "=".repeat(60)));
                console.log(chalk.bold.cyan("🛒 CHECKOUT & PLACE ORDER"));
                console.log(chalk.cyan("=".repeat(60) + "\n"));

                // Click on Cart button
                console.log(chalk.blue("📦 Opening cart..."));
                const cartButton = await driver.wait(
                    until.elementLocated(By.css('button[aria-label="Cart"], button[data-testid="cart-btn"]')),
                    10000
                );
                await driver.executeScript("arguments[0].click();", cartButton);
                console.log(chalk.green("✓ Cart opened"));
                await driver.sleep(2000);

                // Click on "Add Address to proceed" button
                console.log(chalk.blue("\n📍 Opening address selection..."));
                const addAddressBtn = await driver.wait(
                    until.elementLocated(By.xpath("//button[.//span[contains(text(), 'Add Address to proceed')]]")),
                    10000
                );
                await driver.executeScript("arguments[0].click();", addAddressBtn);
                console.log(chalk.green("✓ Address selection opened"));
                await driver.sleep(3000);

                // Extract addresses - wait a bit for addresses to load
                console.log(chalk.blue("\n📋 Loading addresses..."));
                await driver.sleep(2000);

                // Try to find address elements - look for clickable address items
                let addresses = [];
                const addressSelectors = [
                    'button[class*="address"]',
                    'div[class*="address"]',
                    'div[role="button"]',
                    '[data-testid*="address"]',
                    '[class*="address-item"]',
                    '[class*="address-card"]',
                    'div[class*="card"]',
                    'div[class*="item"]'
                ];

                for (let selector of addressSelectors) {
                    try {
                        const elements = await driver.findElements(By.css(selector));
                        for (let i = 0; i < Math.min(elements.length, 10); i++) {
                            try {
                                const el = elements[i];
                                const isDisplayed = await el.isDisplayed();
                                if (!isDisplayed) continue;

                                const text = await el.getText();
                                if (text && text.length > 20 && text.length < 500) {
                                    // Check if it looks like an address
                                    const hasAddressKeywords = /\d+|street|road|lane|area|city|pin|pincode|state|india|home|office|address|deliver|location/i.test(text);
                                    if (hasAddressKeywords || text.includes(',')) {
                                        // Avoid duplicates
                                        if (!addresses.some(a => a.text === text.trim())) {
                                            addresses.push({
                                                index: addresses.length,
                                                text: text.trim().substring(0, 200),
                                                elementIndex: i,
                                                selector: selector
                                            });
                                        }
                                    }
                                }
                            } catch (e) {
                                // Skip this element
                            }
                        }
                        if (addresses.length > 0) break; // Found addresses, stop searching
                    } catch (e) {
                        // Try next selector
                    }
                }

                if (addresses.length === 0) {
                    console.log(chalk.yellow("⚠ No addresses found. Please add an address manually."));
                    return;
                }

                // Display addresses in a table
                console.log(chalk.bold.cyan("\n" + "=".repeat(60)));
                console.log(chalk.bold.cyan("📍 AVAILABLE ADDRESSES"));
                console.log(chalk.bold.cyan("=".repeat(60) + "\n"));

                addresses.forEach((addr, index) => {
                    const addrText = addr.text.length > 70 ? addr.text.substring(0, 67) + "..." : addr.text;
                    console.log(chalk.white(`${index + 1}. ${chalk.bold(addrText)}`));
                    console.log("");
                });

                // Ask user to select address
                const addressSelection = readlineSync.question(
                    chalk.cyan(`\nSelect address (1-${addresses.length}): `)
                );

                const selectedIndex = parseInt(addressSelection) - 1;
                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= addresses.length) {
                    console.log(chalk.red("Invalid selection. Aborting checkout."));
                    return;
                }

                // Click on selected address
                console.log(chalk.blue(`\n📍 Selecting address ${selectedIndex + 1}...`));

                const selectedAddress = addresses[selectedIndex];
                let addressClicked = false;

                // Try to find and click using the stored selector and index
                try {
                    const addressElements = await driver.findElements(By.css(selectedAddress.selector));
                    if (addressElements.length > selectedAddress.elementIndex) {
                        const addressElement = addressElements[selectedAddress.elementIndex];
                        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", addressElement);
                        await driver.sleep(500);
                        await driver.executeScript("arguments[0].click();", addressElement);
                        addressClicked = true;
                        console.log(chalk.green("✓ Address selected"));
                    }
                } catch (e) {
                    // Fallback: Try to find by text content
                    try {
                        const addressByText = await driver.findElement(
                            By.xpath(`//*[contains(text(), "${selectedAddress.text.substring(0, 50).replace(/"/g, '')}")]`)
                        );
                        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", addressByText);
                        await driver.sleep(500);
                        await driver.executeScript("arguments[0].click();", addressByText);
                        addressClicked = true;
                        console.log(chalk.green("✓ Address selected"));
                    } catch (e2) {
                        console.log(chalk.yellow("⚠ Could not click address automatically. Please select manually."));
                    }
                }

                await driver.sleep(2000);

                // Click on "Place Order" button
                if (addressClicked) {
                    console.log(chalk.blue("\n💳 Placing order..."));
                    try {
                        const placeOrderBtn = await driver.wait(
                            until.elementLocated(By.xpath("//button[.//span[contains(text(), 'Place Order')]]")),
                            10000
                        );
                        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", placeOrderBtn);
                        await driver.sleep(1000);
                        await driver.executeScript("arguments[0].click();", placeOrderBtn);
                        console.log(chalk.green("✅ Order placed successfully!"));
                        await driver.sleep(3000);
                    } catch (e) {
                        console.log(chalk.yellow("⚠ Could not find Place Order button. Please check manually."));
                    }
                }

            } catch (err) {
                console.log(chalk.red(`✗ Error during checkout: ${err.message}`));
            }
        }

        // Ask user to add products to cart
        if (chipsProducts && chipsProducts.length > 0) {
            await addProductsToCart(
                chipsProducts,
                "https://www.zepto.com/cn/munchies/chips-crisps/cid/d2c2a144-43cd-43e5-b308-92628fa68596/scid/df4f5100-c02f-4906-83b8-ddb744081a7a",
                "Chips & Crisps"
            );

            // Ask if user wants to checkout
            console.log(chalk.cyan("\n" + "=".repeat(60)));
            const proceedToCheckout = readlineSync.question(
                chalk.cyan("Proceed to checkout and place order? (y/n): ")
            );

            if (proceedToCheckout.toLowerCase() === 'y' || proceedToCheckout.toLowerCase() === 'yes') {
                await checkoutAndPlaceOrder();
            } else {
                console.log(chalk.yellow("Checkout skipped."));
            }
        }

        console.log(chalk.bold.green("\n" + "=".repeat(60)));
        console.log(chalk.bold.green("✅ Process Complete!"));
        console.log(chalk.bold.green("=".repeat(60) + "\n"));

        // Keep browser open for a bit
        await driver.sleep(3000);

    } catch (err) {
        console.error(chalk.red("✗ Error:"), chalk.red(err.message));
    } finally {
        // await driver.quit();
    }
})();
