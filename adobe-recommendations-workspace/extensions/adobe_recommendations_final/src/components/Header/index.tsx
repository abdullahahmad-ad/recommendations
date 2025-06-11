import React from "react";
import { Anchor, Text, Title, Card, ThemeIcon, Flex } from "@mantine/core";
import Apps from "remixicon/icons/System/apps-line.svg";
import { FormattedMessage } from "react-intl";

const Header = (): JSX.Element => {
  return (
    <Card shadow="xs" withBorder>
      <Card.Section withBorder p="xs">
        <Flex align="center" gap="xs">
          <ThemeIcon variant="outline" size="xl">
            <Apps fill="currentColor" style={{ width: "71%", height: "71%" }} />
          </ThemeIcon>
          <div>
            <Title fw={300} order={3}>
              <FormattedMessage id="app.start" />
            </Title>
            <Title order={1}>
              <FormattedMessage id="hello.world" />
            </Title>
          </div>
        </Flex>
      </Card.Section>
      <Card.Section p="xs">
        <Text size="xl" fw={700}>
          <FormattedMessage id="getting.started" />
        </Text>
        <Text size="sm">
          <FormattedMessage
            id="header.description"
            values={{
              anchor: (
                <Anchor href="https://developer.appdirect.com">
                  developer.appdirect.com
                </Anchor>
              ),
            }}
          />
        </Text>
      </Card.Section>
    </Card>
  );
};

export default Header;
