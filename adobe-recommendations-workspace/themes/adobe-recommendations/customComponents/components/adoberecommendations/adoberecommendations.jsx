import React, { useState, useEffect } from "react"
import "./styles/adoberecommendations.scss"
import PropTypes from "prop-types"
import withListener from "@appdirect/sfb-theme-components/src/components/withListener"
import { createNamespace } from "@appdirect/sfb-theme-components/src/tools/namingTools"

import {
  INPUT,
  TOGGLE,
  TEXTAREA,
  COLORPICKER,
  DROPDOWN,
  RADIO,
  CHECKBOX,
  SLIDER,
  GROUP_HEADER,
} from "@appdirect/sfb-theme-components/src/constants/schemaComponentTypes"

const n = createNamespace("adoberecommendations")

// Adobe VIP Marketplace Recommendations Service
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
      throw new Error('Adobe credentials not configured. Please check marketplace vendor integration settings.');
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

  async fetchRecommendations(customerId, context = 'GENERIC', offers, country, language = 'EN') {
    if (!customerId) {
      throw new Error('Customer ID is required for Adobe recommendations');
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const requestBody = {
        recommendationContext: context,
        customerId,
        language
      };

      if (offers && offers.length > 0) {
        requestBody.offers = offers;
      }

      if (country) {
        requestBody.country = country;
      }

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

      const recommendations = await response.json();
      return recommendations;
    } catch (error) {
      console.error('Failed to fetch Adobe recommendations:', error);
      throw error;
    }
  }

  extractCustomerIdFromPage() {
    try {
      const urlPath = window.location.pathname;
      const companyPathMatch = urlPath.match(/\/companies\/([^\/]+)/);
      if (companyPathMatch) {
        return companyPathMatch[1];
      }

      const pageText = document.body.innerText;
      const customerIdMatch = pageText.match(/(?:Customer ID|Adobe ID|P\d{9,})/i);
      if (customerIdMatch) {
        const numericMatch = customerIdMatch[0].match(/\d{9,}/);
        if (numericMatch) {
          return numericMatch[0];
        }
      }

      const customerIdElements = document.querySelectorAll('[data-customer-id], [data-adobe-id]');
      if (customerIdElements.length > 0) {
        return customerIdElements[0].getAttribute('data-customer-id') || 
               customerIdElements[0].getAttribute('data-adobe-id');
      }

      return null;
    } catch (error) {
      console.error('Error extracting customer ID from page:', error);
      return null;
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

export function adoberecommendations(props) {
  const { settings = {} } = props
  const {
    title = "Adobe Product Recommendations",
    description = "Get personalized product recommendations for Adobe customers",
    isDescriptionVisible = true,
    backgroundColor = "#f0f9ff",
    headerType = "header3",
    autoFetch = false,
    showCustomerId = true,
  } = settings

  const [adobeService] = useState(new AdobeRecommendationsService())
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [error, setError] = useState(null)
  const [customerId, setCustomerId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Try to detect customer ID from page
    const detectedCustomerId = adobeService.extractCustomerIdFromPage()
    setCustomerId(detectedCustomerId)

    // Auto-fetch if enabled and customer ID is found
    if (autoFetch && detectedCustomerId) {
      handleFetchRecommendations()
    }
  }, [autoFetch])

  const handleFetchRecommendations = async () => {
    if (!customerId) {
      setError('Adobe Customer ID not found on this page. Please ensure you are on the correct Adobe vendor information page.')
      return
    }

    if (!adobeService.hasValidCredentials()) {
      setError('Adobe credentials not configured. Please configure Adobe credentials in Marketplace > Settings > Vendor Integrations > Adobe.')
      return
    }

    setLoading(true)
    setError(null)
    setRecommendations([])

    try {
      const recommendationsResponse = await adobeService.fetchRecommendations(
        customerId,
        'GENERIC',
        undefined,
        'US',
        'EN'
      )

      const formattedRecommendations = adobeService.formatRecommendationsForDisplay(recommendationsResponse)
      setRecommendations(formattedRecommendations)
      setShowModal(true)
    } catch (error) {
      console.error('Failed to fetch Adobe recommendations:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch Adobe recommendations')
    } finally {
      setLoading(false)
    }
  }

  const renderRecommendations = () => {
    if (recommendations.length === 0) {
      return (
        <div className={n("alert").toString()}>
          <strong>No Recommendations</strong>
          <p>No product recommendations are available for this customer at this time.</p>
        </div>
      )
    }

    return (
      <div className={n("recommendations").toString()}>
        {recommendations.map((category, index) => (
          <div key={index} className={n("category").toString()}>
            <h4>📦 {category.category}</h4>
            <ul>
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className={n("recommendation-item").toString()}>
                  <div className={n("item-content").toString()}>
                    <strong>Product: {item.offerId}</strong>
                    <small>Rank: {item.rank + 1} | Based on: {item.sourceOffers.join(', ')}</small>
                  </div>
                  <span className={n("rank-badge").toString()}>#{item.rank + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  const containerVariables = {
    "background-color": backgroundColor,
  }

  return (
    <div
      {...n("container").withTestId().withVariables(containerVariables).props}
    >
      {/* Header */}
      <div {...n("header").props}>
        {headerType === "header1" && <h1>{title}</h1>}
        {headerType === "header2" && <h2>{title}</h2>}
        {headerType === "header3" && <h3>{title}</h3>}
        {!headerType && <span>{title}</span>}
        
        {isDescriptionVisible && (
          <p {...n("description").props}>{description}</p>
        )}
      </div>

      {/* Customer Info */}
      {showCustomerId && customerId && (
        <div {...n("customer-info").props}>
          <small>Customer ID: <code>{customerId}</code></small>
        </div>
      )}

      {/* Action Button */}
      <div {...n("actions").props}>
        <button
          {...n("fetch-button").props}
          onClick={handleFetchRecommendations}
          disabled={loading || !customerId}
          className={loading ? n("loading").toString() : ""}
        >
          {loading ? "🔄 Fetching..." : "🚀 Get Recommendations"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div {...n("error").props}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div {...n("modal-overlay").props} onClick={() => setShowModal(false)}>
          <div {...n("modal").props} onClick={(e) => e.stopPropagation()}>
            <div {...n("modal-header").props}>
              <h3>🎯 Adobe Product Recommendations</h3>
              <button {...n("modal-close").props} onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div {...n("modal-content").props}>
              {loading ? (
                <div {...n("loading-state").props}>
                  <p>🔄 Fetching recommendations from Adobe...</p>
                </div>
              ) : error ? (
                <div {...n("error-state").props}>
                  <strong>Error:</strong> {error}
                </div>
              ) : (
                renderRecommendations()
              )}
            </div>
            <div {...n("modal-footer").props}>
              <small>
                💡 <strong>Note:</strong> These recommendations are powered by Adobe's VIP Marketplace API 
                and are based on real customer data, purchase patterns, and product compatibility.
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const HEADER_TYPE_OPTIONS = [
  { value: "header1", label: "Header 1" },
  { value: "header2", label: "Header 2" },
  { value: "header3", label: "Header 3" },
]

adoberecommendations.schema = () => ({
  name: "adoberecommendations",
  title: "Adobe Recommendations",
  iconName: "target",
  form: {
    title: {
      title: "Widget Title",
      placeholder: "Adobe Product Recommendations",
      defaultValue: "Adobe Product Recommendations",
      type: INPUT,
      required: true,
    },
    description: {
      title: "Description",
      defaultValue: "Get personalized product recommendations for Adobe customers",
      type: TEXTAREA,
      required: true,
    },
    isDescriptionVisible: {
      labelOn: "Show description",
      labelOff: "Hide description",
      defaultValue: true,
      type: TOGGLE,
    },
    backgroundColor: {
      title: "Background color",
      defaultValue: "#f0f9ff",
      type: COLORPICKER,
    },
    headerType: {
      title: "Header type",
      type: DROPDOWN,
      required: true,
      defaultValue: "header3",
      options: HEADER_TYPE_OPTIONS,
    },
    autoFetch: {
      labelOn: "Auto-fetch recommendations",
      labelOff: "Manual fetch only",
      defaultValue: false,
      type: TOGGLE,
    },
    showCustomerId: {
      labelOn: "Show customer ID",
      labelOff: "Hide customer ID",
      defaultValue: true,
      type: TOGGLE,
    },
  },
})

adoberecommendations.propTypes = {
  settings: PropTypes.object
}

export default withListener(adoberecommendations)
