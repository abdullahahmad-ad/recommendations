import React, { useState, useEffect } from "react"
import "./styles/AdobeRecommendations.scss"
import PropTypes from "prop-types"
import withListener from "@appdirect/sfb-theme-components/src/components/withListener"
import { createNamespace } from "@appdirect/sfb-theme-components/src/tools/namingTools"

import {
  INPUT,
  TOGGLE,
  TEXTAREA,
  DROPDOWN,
  GROUP_HEADER,
} from "@appdirect/sfb-theme-components/src/constants/schemaComponentTypes"

const n = createNamespace("AdobeRecommendations")

// Adobe Recommendations Service (simplified for AppDirect component)
class AdobeRecommendationsService {
  constructor() {
    this.config = {
      clientId: '',
      clientSecret: '',
      baseUrl: 'https://partners.adobe.io',
      imsUrl: 'https://ims-na1.adobelogin.com'
    };
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  setCredentials(credentials) {
    this.config.clientId = credentials.clientId;
    this.config.clientSecret = credentials.clientSecret;
    this.config.baseUrl = credentials.baseUrl;
  }

  hasValidCredentials() {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.hasValidCredentials()) {
      throw new Error('Adobe credentials not configured in marketplace settings.');
    }

    try {
      const response = await fetch(`${this.config.imsUrl}/ims/token/v3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'ent_partners_sdk'
        })
      });

      if (!response.ok) {
        throw new Error(`Adobe OAuth failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 300) * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Adobe access token:', error);
      throw error;
    }
  }

  async fetchRecommendations(customerId, context = 'GENERIC', country = 'US', language = 'EN') {
    if (!customerId) {
      throw new Error('Customer ID is required for Adobe recommendations');
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const requestBody = {
        recommendationContext: context,
        customerId,
        language,
        country
      };

      const response = await fetch(`${this.config.baseUrl}/v3/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-api-key': this.config.clientId,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Adobe recommendations API failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Adobe recommendations:', error);
      throw error;
    }
  }

  extractCustomerIdFromPage() {
    try {
      // Look for customer ID in URL path
      const urlPath = window.location.pathname;
      const companyPathMatch = urlPath.match(/\/companies\/([^\/]+)/);
      if (companyPathMatch) {
        return companyPathMatch[1];
      }

      // Look for customer ID in page content
      const pageText = document.body.innerText;
      const customerIdMatch = pageText.match(/(?:Customer ID|Adobe ID|P\d{9,})/i);
      if (customerIdMatch) {
        const numericMatch = customerIdMatch[0].match(/\d{9,}/);
        if (numericMatch) {
          return numericMatch[0];
        }
      }

      // Look for data attributes
      const customerIdElements = document.querySelectorAll('[data-customer-id], [data-adobe-id]');
      if (customerIdElements.length > 0) {
        const element = customerIdElements[0];
        return element.dataset.customerId || element.dataset.adobeId || null;
      }

      return null;
    } catch (error) {
      console.error('Error extracting customer ID from page:', error);
      return null;
    }
  }

  isAdobeVendorPage() {
    try {
      const url = window.location.href.toLowerCase();
      const pageContent = document.body.textContent?.toLowerCase() || '';
      
      return (
        (url.includes('vendor') || url.includes('adobe')) &&
        (pageContent.includes('adobe') || pageContent.includes('creative cloud') || pageContent.includes('acrobat'))
      );
    } catch (error) {
      console.error('Error checking if Adobe vendor page:', error);
      return false;
    }
  }

  formatRecommendationsForDisplay(recommendations) {
    const formatted = [];

    if (recommendations.productRecommendations?.upsells?.length > 0) {
      formatted.push({
        category: 'Upsells',
        items: recommendations.productRecommendations.upsells.map(item => ({
          offerId: item.product.baseOfferId,
          rank: item.rank,
          sourceOffers: item.source.offerIds || []
        }))
      });
    }

    if (recommendations.productRecommendations?.crossSells?.length > 0) {
      formatted.push({
        category: 'Cross-sells',
        items: recommendations.productRecommendations.crossSells.map(item => ({
          offerId: item.product.baseOfferId,
          rank: item.rank,
          sourceOffers: item.source.offerIds || []
        }))
      });
    }

    if (recommendations.productRecommendations?.addOns?.length > 0) {
      formatted.push({
        category: 'Add-ons',
        items: recommendations.productRecommendations.addOns.map(item => ({
          offerId: item.product.baseOfferId,
          rank: item.rank,
          sourceOffers: item.source.offerIds || []
        }))
      });
    }

    return formatted;
  }
}

export function AdobeRecommendations(props) {
  const { settings = {} } = props
  const {
    title = "Adobe Product Recommendations",
    enableAutoDetection = true,
    customerId: settingsCustomerId = "",
    adobeClientId = "",
    adobeClientSecret = "",
    showOnlyOnAdobePages = true,
  } = settings

  const [adobeService] = useState(() => new AdobeRecommendationsService())
  const [modalOpened, setModalOpened] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [error, setError] = useState(null)
  const [customerId, setCustomerId] = useState(null)
  const [isAdobePage, setIsAdobePage] = useState(false)

  useEffect(() => {
    // Set Adobe credentials from settings
    if (adobeClientId && adobeClientSecret) {
      adobeService.setCredentials({
        clientId: adobeClientId,
        clientSecret: adobeClientSecret,
        baseUrl: 'https://partners.adobe.io'
      });
    }

    // Detect if we're on an Adobe page
    const detectedIsAdobePage = adobeService.isAdobeVendorPage();
    setIsAdobePage(detectedIsAdobePage);

    // Extract customer ID
    const detectedCustomerId = settingsCustomerId || 
      (enableAutoDetection ? adobeService.extractCustomerIdFromPage() : null);
    setCustomerId(detectedCustomerId);
  }, [adobeClientId, adobeClientSecret, settingsCustomerId, enableAutoDetection, adobeService]);

  const handleFetchRecommendations = async () => {
    if (!customerId) {
      setError('Adobe Customer ID not found. Please configure in component settings or ensure you are on an Adobe vendor page.');
      return;
    }

    if (!adobeService.hasValidCredentials()) {
      setError('Adobe credentials not configured. Please configure Adobe Client ID and Secret in component settings.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const recommendationsResponse = await adobeService.fetchRecommendations(
        customerId,
        'GENERIC',
        'US',
        'EN'
      );

      const formattedRecommendations = adobeService.formatRecommendationsForDisplay(recommendationsResponse);
      setRecommendations(formattedRecommendations);
      setModalOpened(true);
    } catch (error) {
      console.error('Failed to fetch Adobe recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Adobe recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if showOnlyOnAdobePages is enabled and we're not on an Adobe page
  if (showOnlyOnAdobePages && !isAdobePage) {
    return null;
  }

  const containerVariables = {
    "background-color": "#f0f9ff",
    "border": "1px solid #e0f2fe",
    "border-radius": "8px",
    "padding": "16px"
  };

  return (
    <>
      <div {...n("container").withTestId().withVariables(containerVariables).props}>
        <div {...n("header").props}>
          <h3 style={{ color: "#1976d2", margin: "0 0 8px 0" }}>
            🎯 {title}
          </h3>
          {isAdobePage && (
            <span style={{ 
              backgroundColor: "#ff9800", 
              color: "white", 
              padding: "2px 8px", 
              borderRadius: "4px", 
              fontSize: "12px",
              marginLeft: "8px"
            }}>
              Adobe Page Detected
            </span>
          )}
      </div>

        <div {...n("content").props}>
          <p style={{ color: "#666", fontSize: "14px", margin: "8px 0" }}>
            Get personalized product recommendations using Adobe VIP Marketplace API
          </p>
          
          {customerId && (
            <p style={{ color: "#999", fontSize: "12px", margin: "4px 0" }}>
              Customer ID: {customerId}
            </p>
          )}
          
          <button
            onClick={handleFetchRecommendations}
            disabled={!customerId || !adobeService.hasValidCredentials() || loading}
            style={{
              backgroundColor: loading ? "#ccc" : "#1976d2",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              marginTop: "8px"
            }}
          >
            {loading ? "🔄 Loading..." : "🚀 Get Recommendations"}
          </button>
          
          {error && (
            <div style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "8px",
              borderRadius: "4px",
              marginTop: "8px",
              fontSize: "14px"
            }}>
              ❌ {error}
            </div>
        )}
      </div>
    </div>

      {/* Modal overlay */}
      {modalOpened && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflow: "auto",
            position: "relative"
          }}>
            <button
              onClick={() => setModalOpened(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer"
              }}
            >
              ×
            </button>
            
            <h2 style={{ color: "#1976d2", margin: "0 0 16px 0" }}>
              🎯 Adobe Product Recommendations
            </h2>
            
            {recommendations.length === 0 ? (
              <p style={{ color: "#666" }}>
                No product recommendations are available for this customer at this time.
              </p>
            ) : (
              <div>
                {recommendations.map((category, index) => (
                  <div key={index} style={{
                    backgroundColor: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px"
                  }}>
                    <h4 style={{ color: "#2563eb", margin: "0 0 12px 0" }}>
                      📦 {category.category}
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} style={{ marginBottom: "8px" }}>
                          <div style={{ fontSize: "14px" }}>
                            <strong>Product:</strong> {item.offerId}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Rank: {item.rank + 1} | Based on: {item.sourceOffers.join(', ') || 'N/A'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                <div style={{
                  backgroundColor: "#fff3cd",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#856404"
                }}>
                  💡 <strong>Note:</strong> These recommendations are powered by Adobe's VIP Marketplace API 
                  and are based on real customer data, purchase patterns, and product compatibility.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

AdobeRecommendations.schema = () => ({
  name: "AdobeRecommendations",
  title: "Adobe Product Recommendations",
  iconName: "carousel",
  form: {
    title: {
      title: "Component Title",
      placeholder: "Adobe Product Recommendations",
      defaultValue: "Adobe Product Recommendations",
      type: INPUT,
      required: true,
    },
    adobeCredentialsHeader: {
      type: GROUP_HEADER,
      title: "Adobe VIP API Credentials",
      symbol: "adobe-credentials",
    },
    adobeClientId: {
      title: "Adobe Client ID",
      placeholder: "Enter your Adobe VIP Client ID",
      defaultValue: "",
      type: INPUT,
      required: true,
    },
    adobeClientSecret: {
      title: "Adobe Client Secret", 
      placeholder: "Enter your Adobe VIP Client Secret",
      defaultValue: "",
      type: INPUT,
      required: true,
    },
    customerConfigHeader: {
      type: GROUP_HEADER,
      title: "Customer Configuration",
      symbol: "customer-config",
    },
    enableAutoDetection: {
      labelOn: "Auto-detect customer ID from page",
      labelOff: "Auto-detect customer ID from page",
      defaultValue: true,
      type: TOGGLE,
    },
    customerId: {
      title: "Custom Customer ID",
      placeholder: "Enter Adobe Customer ID (optional)",
      defaultValue: "",
      type: INPUT,
      required: false,
    },
    displayConfigHeader: {
      type: GROUP_HEADER,
      title: "Display Settings",
      symbol: "display-config",
    },
    showOnlyOnAdobePages: {
      labelOn: "Show only on Adobe vendor pages",
      labelOff: "Show only on Adobe vendor pages", 
      defaultValue: true,
      type: TOGGLE,
    },
  },
})

AdobeRecommendations.propTypes = {
  settings: PropTypes.object,
}

export default withListener(AdobeRecommendations)
