import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Button,
  Heading,
  Section,
} from "@react-email/components";

interface NotificationEmailProps {
  title: string;
  name?: string;
  bodyText: string;
  url?: string;
  actionText?: string;
}

export const NotificationEmail = ({ 
  title, 
  name, 
  bodyText, 
  url, 
  actionText = "View Details" 
}: NotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{title}</Heading>
          {name && (
            <Text style={text}>Hi {name},</Text>
          )}
          <Text style={text}>
            {bodyText}
          </Text>
          
          {url && (
            <Section style={btnContainer}>
              <Button style={button} href={url}>
                {actionText}
              </Button>
            </Section>
          )}
          
          <Text style={footer}>
            The TalentLoop Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f9fafa",
  fontFamily: "Inter, -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e6e6e6",
  maxWidth: "600px",
};

const h1 = {
  color: "#2f3237",
  fontSize: "24px",
  fontWeight: "500",
  lineHeight: "32px",
  marginBottom: "24px",
};

const text = {
  color: "#5e656e",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "16px",
};

const btnContainer = {
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#14b8a6", // Secondary color for general actions
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const footer = {
  color: "#5e656e",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "48px",
};

export default NotificationEmail;
