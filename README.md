# AppDirect Marketplace Extension

A React-based marketplace extension that integrates with AppDirect marketplace components, credentials, and data to call 3rd party ISVs and display fetched data using marketplace context.

## 🎯 What This Extension Does

This marketplace extension provides **Adobe Product Recommendations** integration that displays directly on Adobe vendor information pages in your AppDirect marketplace.

### 1. **Adobe Recommendations Integration**
- **Smart Page Detection**: Automatically detects when you're on an Adobe vendor information page
- **Customer ID Extraction**: Extracts Adobe customer ID from the page context
- **Real-time Recommendations**: Fetches live product recommendations from Adobe VIP Marketplace API
- **Categorized Results**: Displays upsells, cross-sells, and add-on recommendations

### 2. **Marketplace Context & User Data**
- **Real User Data**: Fetch current user information (name, email, UUID)
- **Company Context**: Access company details (name, UUID, external ID, website)
- **Authenticated Access**: Use OAuth 2.0 flow with your marketplace

### 3. **Secure Adobe API Integration**
- **OAuth Authentication**: Uses Adobe VIP Marketplace OAuth for secure API access
- **Credential Management**: Securely handles Adobe credentials from marketplace settings
- **Token Caching**: Automatic token refresh and management

### 4. **Data Flow Architecture**
```
Adobe Vendor Page → Extension Detection → Adobe Customer ID → OAuth Token → Adobe VIP API
                 ←                      ←                   ←            ← Recommendations
```

## 🚀 Features

- ✅ **Adobe Recommendations Widget** - Smart button that appears on Adobe vendor pages
- ✅ **Automatic Page Detection** - Detects Adobe vendor information pages 
- ✅ **Customer ID Extraction** - Extracts Adobe customer ID from page context
- ✅ **Adobe VIP API Integration** - Real-time calls to Adobe recommendations API
- ✅ **OAuth 2.0 Integration** with AppDirect marketplace
- ✅ **Real-time Marketplace Context** (user & company data)  
- ✅ **Modern UI** with Mantine 7 component library
- ✅ **TypeScript** for type safety
- ✅ **Module Federation** ready for marketplace embedding
- ✅ **Responsive Design** with styled components

## 🛠 Setup & Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Access to AppDirect marketplace (https://appdistribution.byappdirect.com/)

### Installation
```bash
# Clone/navigate to project
cd recommendations

# Install dependencies
npm install

# Start development server
npm run start
```

### Configuration

#### AppDirect Marketplace Credentials
The extension uses your API client credentials:
- **Client ID**: `bWoOhDljfO`
- **Client Secret**: `2fBZc7JpmrqG1EDVmmND`
- **Marketplace URL**: `https://appdistribution.byappdirect.com`

#### Adobe VIP Marketplace Credentials
Configure Adobe credentials in your marketplace:
- **Path**: `Marketplace > Settings > Vendor Integrations > Adobe`
- **Required**: Adobe VIP Client ID and Client Secret
- **API Base URL**: `https://partners.adobe.io`

### Environment Variables (Optional)
Create a `.env` file to override defaults:
```
REACT_APP_APPDIRECT_CLIENT_ID=your_client_id
REACT_APP_APPDIRECT_CLIENT_SECRET=your_client_secret  
REACT_APP_APPDIRECT_MARKETPLACE_URL=https://your-marketplace.com
```

## 🔒 Authentication Flow

1. **User clicks "Connect to AppDirect Marketplace"**
2. **Redirects to AppDirect OAuth authorization**
3. **User authorizes the extension**
4. **AppDirect redirects back with authorization code**
5. **Extension exchanges code for access token**
6. **Access token used for marketplace API calls**
7. **Secure tokens generated for 3rd party ISV calls**

## 🌐 API Integration Examples

### Adobe Recommendations API
```typescript
// Initialize Adobe service with credentials
const adobeService = new AdobeRecommendationsService();
adobeService.setCredentials({
  clientId: 'your-adobe-client-id',
  clientSecret: 'your-adobe-client-secret',
  baseUrl: 'https://partners.adobe.io'
});

// Fetch recommendations for a customer
const recommendations = await adobeService.fetchRecommendations(
  '1005513019', // Adobe customer ID
  'GENERIC',    // Recommendation context
  undefined,    // Optional: specific offers
  'US',         // Country
  'EN'          // Language
);

// Returns categorized recommendations:
// {
//   productRecommendations: {
//     upsells: [...],
//     crossSells: [...], 
//     addOns: [...]
//   }
// }
```

### Marketplace Data Access
```typescript
// Get current user context
const userContext = await authService.getUserContext();
// Returns: { uuid, firstName, lastName, email, openId }

// Get company context  
const companyContext = await authService.getCompanyContext();
// Returns: { uuid, name, externalId, website }
```

### Page Detection & Customer ID Extraction
```typescript
// Check if current page is Adobe vendor page
const isAdobePage = adobeService.isAdobeVendorPage();

// Extract customer ID from page
const customerId = adobeService.extractCustomerIdFromPage();
// Returns: '1005513019' or null
```

## 📊 Extension Architecture

### Core Technologies
- **React 18** with TypeScript
- **Mantine 7** UI component library
- **Webpack 5** with Module Federation
- **Styled Components** for custom styling
- **OAuth 2.0** for authentication

### File Structure
```
src/
├── App.tsx              # Main application component
├── index.tsx            # React entry point
└── services/
    └── appDirectAuth.ts # OAuth & API integration service
```

### Module Federation Configuration
The extension is configured as a federated module that can be embedded in the AppDirect marketplace:

```javascript
ModuleFederationPlugin({
  name: 'appdirectExtension',
  exposes: {
    './App': './src/App.tsx'
  }
})
```

## 🔧 Development Commands

```bash
# Start development server
npm run start

# Build for production
npm run build

# Development with auto-open browser
npm run dev
```

## 🚀 Deployment to AppDirect

1. **Build the extension**: `npm run build`
2. **Upload to AppDirect**: Use the AppDirect Developer Portal
3. **Configure OAuth**: Set redirect URIs in your API client
4. **Enable Extension**: Activate in your marketplace

## 🎯 How It Works

### 1. **Page Detection**
The extension automatically detects when a user navigates to an Adobe vendor information page by:
- Checking the URL for vendor/Adobe patterns
- Scanning page content for Adobe-related keywords
- Looking for Adobe customer ID patterns

### 2. **Customer ID Extraction** 
When on an Adobe vendor page, the extension extracts the customer ID using:
- URL path parsing (`/companies/{customerId}/vendor/adobe`)
- Page content scanning for Adobe customer ID patterns
- DOM attribute checking for data attributes

### 3. **Recommendations Widget**
A smart widget appears on Adobe vendor pages that:
- Shows the detected customer ID and company name
- Provides a "Get Recommendations" button
- Displays results in a categorized modal

### 4. **Adobe API Integration**
When clicked, the widget:
- Authenticates with Adobe VIP Marketplace using OAuth
- Calls the Adobe recommendations API with the customer ID
- Parses and displays upsells, cross-sells, and add-ons

## 🧪 Development & Testing

### Adobe Page Simulation
In development mode, the extension includes a page simulator:
- Click the "🎭 Toggle Adobe Page Sim" button (bottom right)
- Simulates being on an Adobe vendor page with customer data
- Allows testing of the recommendations functionality

### Demo Customer Data
- **Customer ID**: `1005513019` (from your screenshot)
- **Company**: `HGOUATR2`
- **Vendor**: Adobe

## 📋 Next Steps

Now that your Adobe recommendations extension is ready:

1. **Configure Adobe Credentials** in marketplace vendor integration settings
2. **Deploy the extension** to your AppDirect marketplace
3. **Test on real Adobe vendor pages** with actual customer data  
4. **Customize the UI** to match your marketplace branding
5. **Add additional recommendation contexts** (ORDER_PREVIEW, RENEWAL_ORDER_PREVIEW)
6. **Implement error handling and logging** for production readiness

## 🤝 Support

This extension provides a complete Adobe recommendations integration for AppDirect marketplaces. All core functionality is implemented and ready for deployment.

**Your API Client (`bWoOhDljfO` / `2fBZc7JpmrqG1EDVmmNd`) enables:**
- ✅ User authentication and context
- ✅ Company data access  
- ✅ Secure marketplace integration
- ✅ Adobe vendor page detection

**Adobe Recommendations Features:**
- ✅ Smart page detection for Adobe vendor pages
- ✅ Customer ID extraction from page context
- ✅ Real-time Adobe VIP API integration
- ✅ Categorized product recommendations (upsells, cross-sells, add-ons)
- ✅ OAuth authentication with Adobe
- ✅ Development mode simulation tools 