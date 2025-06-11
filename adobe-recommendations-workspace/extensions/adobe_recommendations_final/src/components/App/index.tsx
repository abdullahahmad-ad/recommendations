import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Text,
  Modal,
  Loader,
  Alert,
  Group,
  Stack,
  Card,
  Badge,
  Title,
  Container,
  Grid,
  ActionIcon,
  Tooltip,
  Paper,
} from "@mantine/core";
import {
  IconRefresh,
  IconExternalLink,
  IconStar,
  IconShoppingCart,
} from "@tabler/icons-react";
import useMarketplaceContext from "../../hooks/useMarketplaceContext";
import Header from "../Header";

interface AdobeProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  currency?: string;
  vipDiscount?: number;
  popularity?: number;
  type: "upsell" | "cross-sell" | "add-on";
}

const App = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AdobeProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdobeProduct | null>(
    null
  );
  const [customerId, setCustomerId] = useState<string | null>(null);
  const { bootstrap } = useMarketplaceContext();

  // Extract customer ID from various sources
  const extractCustomerId = (): string | null => {
    try {
      // Primary: Company ID from URL pattern /channel/company/{companyId}
      const urlPath = window.location.pathname;
      const companyMatch = urlPath.match(/\/channel\/company\/([a-f0-9-]+)/);
      if (companyMatch) {
        console.log("Found company ID from URL:", companyMatch[1]);
        return companyMatch[1];
      }

      // Fallback: Query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const companyId = urlParams.get("companyId");
      if (companyId) return companyId;

      // Fallback: AppDirect context
      if (bootstrap?.CompanyInfo?.id) return bootstrap.CompanyInfo.id;

      return null;
    } catch (err) {
      console.error("Error extracting customer ID:", err);
      return null;
    }
  };

  useEffect(() => {
    const id = extractCustomerId();
    setCustomerId(id);
    console.log("Adobe VIP Extension initialized with customer ID:", id);
  }, [bootstrap]);

  // Simulate Adobe VIP API call with realistic data
  const fetchAdobeRecommendations = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1500);
      });

      // Mock Adobe VIP recommendations based on customer profile
      const mockRecommendations: AdobeProduct[] = [
        {
          id: "adobe-cc-teams",
          name: "Adobe Creative Cloud for Teams",
          description:
            "Complete creative toolkit for your team with advanced collaboration features",
          category: "Creative",
          price: 79.99,
          currency: "USD",
          vipDiscount: 15,
          popularity: 95,
          type: "upsell",
        },
        {
          id: "adobe-acrobat-pro",
          name: "Adobe Acrobat Pro DC",
          description:
            "Professional PDF creation, editing, and e-signature solution",
          category: "Productivity",
          price: 14.99,
          currency: "USD",
          vipDiscount: 10,
          popularity: 88,
          type: "cross-sell",
        },
        {
          id: "adobe-stock-standard",
          name: "Adobe Stock Standard",
          description:
            "10 standard assets monthly with rollover and premium content access",
          category: "Assets",
          price: 29.99,
          currency: "USD",
          vipDiscount: 20,
          popularity: 82,
          type: "add-on",
        },
        {
          id: "adobe-experience-manager",
          name: "Adobe Experience Manager Sites",
          description:
            "Enterprise content management and digital experience platform",
          category: "Enterprise",
          price: 199.99,
          currency: "USD",
          vipDiscount: 25,
          popularity: 76,
          type: "upsell",
        },
      ];

      setRecommendations(mockRecommendations);
    } catch (err) {
      console.error("Error fetching Adobe recommendations:", err);
      setError("Unable to fetch recommendations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "upsell":
        return "blue";
      case "cross-sell":
        return "green";
      case "add-on":
        return "orange";
      default:
        return "gray";
    }
  };

  const formatPrice = (
    price: number,
    currency: string,
    discount?: number
  ): {
    original: string;
    discounted: string | null;
    savings: string | null;
  } => {
    const discountedPrice = discount ? price * (1 - discount / 100) : price;
    return {
      original: `$${price.toFixed(2)}`,
      discounted: discount ? `$${discountedPrice.toFixed(2)}` : null,
      savings: discount ? `${discount}% off` : null,
    };
  };

  return (
    <Container size="lg" p="md">
      <Header />
      <Space h="xl" />

      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <div>
              <Title order={2} c="blue.7">
                🎯 Adobe VIP Recommendations
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Personalized product recommendations for your organization
              </Text>
            </div>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              VIP Customer
            </Badge>
          </Group>

          {customerId && (
            <Alert variant="light" color="blue" title="Customer Detected">
              <Group gap="xs">
                <Text size="sm">
                  <strong>Company ID:</strong> {customerId}
                </Text>
                {bootstrap?.CompanyInfo?.name && (
                  <Text size="sm">
                    <strong>Company:</strong> {bootstrap.CompanyInfo.name}
                  </Text>
                )}
              </Group>
            </Alert>
          )}

          {!customerId && (
            <Alert variant="light" color="yellow" title="Customer Context">
              <Text size="sm">
                Unable to identify customer. Please ensure you are viewing a
                customer page.
                <br />
                <Text size="xs" c="dimmed" mt={4}>
                  Expected URL pattern: /channel/company/&#123;companyId&#125;
                  or ?companyId=...
                </Text>
              </Text>
            </Alert>
          )}

          <Group>
            <Button
              size="md"
              leftSection={<IconShoppingCart size={20} />}
              onClick={fetchAdobeRecommendations}
              loading={loading}
              disabled={!customerId}
            >
              Get Adobe VIP Recommendations
            </Button>

            {recommendations.length > 0 && (
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={fetchAdobeRecommendations}
                loading={loading}
              >
                Refresh
              </Button>
            )}
          </Group>

          {error && (
            <Alert variant="light" color="red" title="Error">
              {error}
            </Alert>
          )}

          {loading && (
            <Group justify="center" py="xl">
              <Loader size="lg" />
              <Text>Fetching personalized Adobe VIP recommendations...</Text>
            </Group>
          )}

          {recommendations.length > 0 && !loading && (
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Recommended for You</Title>
                <Text size="sm" c="dimmed">
                  {recommendations.length} products found
                </Text>
              </Group>

              <Grid>
                {recommendations.map((product) => {
                  const pricing = formatPrice(
                    product.price || 0,
                    product.currency || "USD",
                    product.vipDiscount
                  );

                  return (
                    <Grid.Col span={{ base: 12, md: 6 }} key={product.id}>
                      <Card
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{ height: "100%", cursor: "pointer" }}
                        onClick={(): void => setSelectedProduct(product)}
                      >
                        <Stack gap="sm" h="100%">
                          <Group justify="space-between" align="flex-start">
                            <Badge
                              color={getTypeColor(product.type)}
                              variant="light"
                              size="sm"
                            >
                              {product.type.toUpperCase()}
                            </Badge>
                            {product.popularity && (
                              <Group gap={4}>
                                <IconStar
                                  size={14}
                                  fill="orange"
                                  color="orange"
                                />
                                <Text size="xs" c="dimmed">
                                  {product.popularity}%
                                </Text>
                              </Group>
                            )}
                          </Group>

                          <div style={{ flex: 1 }}>
                            <Text fw={600} size="lg" lineClamp={2}>
                              {product.name}
                            </Text>
                            <Text size="sm" c="dimmed" mt={4} lineClamp={3}>
                              {product.description}
                            </Text>
                          </div>

                          <Group
                            justify="space-between"
                            align="center"
                            mt="auto"
                          >
                            <div>
                              {pricing.discounted ? (
                                <Group gap={4} align="center">
                                  <Text fw={700} size="lg" c="green.6">
                                    {pricing.discounted}
                                  </Text>
                                  <Text size="sm" td="line-through" c="dimmed">
                                    {pricing.original}
                                  </Text>
                                </Group>
                              ) : (
                                <Text fw={700} size="lg">
                                  {pricing.original}
                                </Text>
                              )}
                              {pricing.savings && (
                                <Badge size="xs" color="green" variant="light">
                                  {pricing.savings}
                                </Badge>
                              )}
                            </div>

                            <Tooltip label="View details">
                              <ActionIcon variant="light" color="blue">
                                <IconExternalLink size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Product Detail Modal */}
      <Modal
        opened={!!selectedProduct}
        onClose={(): void => setSelectedProduct(null)}
        title={selectedProduct?.name}
        size="md"
      >
        {selectedProduct && (
          <Stack gap="md">
            <Group>
              <Badge color={getTypeColor(selectedProduct.type)} variant="light">
                {selectedProduct.type.toUpperCase()}
              </Badge>
              <Badge color="blue" variant="outline">
                {selectedProduct.category}
              </Badge>
            </Group>

            <Text>{selectedProduct.description}</Text>

            <Paper withBorder p="md" radius="sm">
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" c="dimmed">
                    VIP Price
                  </Text>
                  {selectedProduct.vipDiscount ? (
                    <Group gap={8} align="center">
                      <Text fw={700} size="xl" c="green.6">
                        $
                        {(
                          (selectedProduct.price || 0) *
                          (1 - selectedProduct.vipDiscount / 100)
                        ).toFixed(2)}
                      </Text>
                      <Text size="md" td="line-through" c="dimmed">
                        ${selectedProduct.price?.toFixed(2)}
                      </Text>
                      <Badge size="sm" color="green">
                        {selectedProduct.vipDiscount}% off
                      </Badge>
                    </Group>
                  ) : (
                    <Text fw={700} size="xl">
                      ${selectedProduct.price?.toFixed(2)}
                    </Text>
                  )}
                </div>

                <Button variant="filled" size="sm">
                  Request Quote
                </Button>
              </Group>
            </Paper>

            {selectedProduct.popularity && (
              <Group gap="xs">
                <IconStar size={16} fill="orange" color="orange" />
                <Text size="sm">
                  {selectedProduct.popularity}% customer satisfaction
                </Text>
              </Group>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default App;
