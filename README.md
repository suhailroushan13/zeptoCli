# 🛒 Zepto CLI Automation

An automated command-line tool for browsing, searching, and ordering products from Zepto using Selenium WebDriver.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Important Notes](#important-notes)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Automated Login**: Login to Zepto using phone number and OTP
- **Location Selection**: Automatically handles location selection and popups
- **Product Search**: Search for products by category or keyword
- **Product Display**: View products with prices, discounts, and stock status in a formatted table
- **Bulk Cart Operations**: Add multiple products to cart using ranges (e.g., 1-5) or comma-separated values (e.g., 1,2,3)
- **Address Management**: Select from saved addresses during checkout
- **Order Placement**: Complete checkout and place orders automatically

## 🔧 Prerequisites

Before running this tool, ensure you have:

1. **Node.js** (v14 or higher)
   ```bash
   node --version
   ```

2. **Google Chrome Browser** installed on your system

3. **ChromeDriver** compatible with your Chrome version
   - ChromeDriver is automatically managed by Selenium WebDriver

4. **Active Zepto Account**
   - Valid phone number registered with Zepto
   - Access to OTP (SMS)

5. **⚠️ IMPORTANT: Sufficient Balance in Zepto Wallet**
   - Ensure you have enough balance in your Zepto wallet before placing orders
   - The tool does not validate wallet balance before checkout
   - Orders may fail if insufficient funds are available

## 📦 Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

   The following packages will be installed:
   - `selenium-webdriver` - Browser automation
   - `readline-sync` - CLI input handling
   - `chalk` - Terminal styling

## 🚀 Usage

1. **Run the application**
   ```bash
   npm start
   ```

2. **Follow the interactive prompts:**

   ### Step 1: Login
   - Enter your phone number when prompted
   - Enter the 6-digit OTP received via SMS

   ### Step 2: Search for Products
   - Enter a search term (e.g., "ice cream", "chips", "milk")
   - View the list of products with prices and availability
   - Press Enter without typing to exit

   ### Step 3: Add to Cart
   - Select products to add to cart:
     - Single product: `1`
     - Multiple products: `1,2,3`
     - Range of products: `1-5`
   - Press Enter to skip adding products

   ### Step 4: Continue or Checkout
   - Choose to search for more products or proceed to checkout
   - If checking out:
     - Select a delivery address from your saved addresses
     - Confirm order placement

3. **Order Completion**
   - The tool will automatically place your order
   - Browser will remain open for verification

## ⚠️ Important Notes

### Wallet Balance
- **Always ensure you have sufficient balance in your Zepto wallet before running the checkout process**
- Check your wallet balance in the Zepto app or website
- Add funds to your wallet if needed before using this tool
- The automation does not check or validate wallet balance

### Security
- Never share your phone number or OTP with others
- This tool runs locally on your machine
- No credentials are stored or transmitted

### Browser Behavior
- The Chrome browser will open in maximized mode
- Browser remains open after execution for verification
- You can manually close it when done

### Rate Limiting
- Avoid running the tool too frequently to prevent account restrictions
- Wait a few seconds between operations

### Product Availability
- Products marked with ✓ are in stock
- Products marked with ✗ are out of stock and cannot be added to cart
- Stock status is checked in real-time

## 🐛 Troubleshooting

### Common Issues

**1. ChromeDriver version mismatch**
```bash
npm install selenium-webdriver@latest
```

**2. Element not found errors**
- Zepto's website structure may have changed
- Wait times may need adjustment for slower connections
- Check your internet connection

**3. OTP not received**
- Verify your phone number is correct
- Check SMS/message inbox
- Request OTP again if expired

**4. Products not loading**
- Ensure stable internet connection
- Try searching with different keywords
- Refresh and try again

**5. Order placement fails**
- **Check Zepto wallet balance first**
- Verify delivery address is valid
- Ensure products are still in stock
- Check if there are any ongoing technical issues with Zepto

**6. Location popup issues**
- The tool handles most popups automatically
- If stuck, manually close popups in the browser
- Restart the tool if needed

## 📝 Example Session

```
============================================================
🛒 ZEPTO AUTOMATION
============================================================

✓ Popup closed!
📍 Selecting location...
✓ Clicked 'Select Location' button
✓ Clicked 'Enable' button
✓ Location popup closed

Enter phone number: 9876543210
Enter 6-digit OTP: 123456

✅ OTP entered successfully!

============================================================
🔍 SEARCH PRODUCTS
============================================================
Enter a search term (e.g., ice cream, chips, milk)
Press Enter to exit

Search for: ice cream

🔎 Searching for "ice cream"...

============================================================
📦 ICE CREAM
============================================================

┌─────┬────────────────────────────────┬─────────────────────────┐
│ No. │ Product Name                   │ Price                   │
├─────┼────────────────────────────────┼─────────────────────────┤
│ 1   │ Amul Vanilla Ice Cream 500ml   │ ₹120 ₹150               │ ✓
│ 2   │ Kwality Walls Cornetto         │ ₹40                     │ ✓
│ 3   │ Mother Dairy Ice Cream 1L      │ ₹200 ₹250               │ ✗
└─────┴────────────────────────────────┴─────────────────────────┘

✓ Found 3 products in ice cream

============================================================
🛒 ADD PRODUCTS TO CART
============================================================

Enter product numbers to add to cart:
  - Single product: 1
  - Multiple products: 1,2,3 or 1-5
  - Press Enter to skip

Your selection: 1,2

📦 Adding 2 product(s) to cart...

✓ Added: Amul Vanilla Ice Cream 500ml...
✓ Added: Kwality Walls Cornetto...

✅ Successfully added 2 product(s) to cart!

============================================================
Search for another category? (y/n): n

============================================================
Proceed to checkout and place order? (y/n): y

============================================================
🛒 CHECKOUT & PLACE ORDER
============================================================

📦 Opening cart...
✓ Cart opened

📍 Opening address selection...
✓ Address selection opened

📋 Loading addresses...

============================================================
📍 AVAILABLE ADDRESSES
============================================================

1. 🏠 Home
   123 Main Street, Apartment 4B, Mumbai, Maharashtra...

2. 💼 Work
   456 Business Park, Tower A, Floor 5, Mumbai...

Select address (1-2): 1

📍 Selecting address 1 (Home)...
✓ Address selected

💳 Placing order...
✅ Order placed successfully!

============================================================
✅ Process Complete!
============================================================
```

## 🤝 Contributing

Feel free to submit issues or pull requests for improvements.

## 📄 License

This project is for educational purposes only. Use responsibly and in accordance with Zepto's terms of service.

## ⚠️ Disclaimer

This tool is not officially affiliated with Zepto. Use at your own risk. Ensure you comply with Zepto's terms of service and automation policies. Always verify orders manually before final confirmation.

---

**Made with ❤️ for convenient grocery shopping**
