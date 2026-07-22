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

interface VerifyEmailProps {
  url: string;
}

export const VerifyEmail = ({ url }: VerifyEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your TalentLoop account</Heading>
          <Text style={text}>
            Welcome to TalentLoop! We're excited to have you on board.
          </Text>
          <Text style={text}>
            To start trading skills and connecting with others, you first need to verify your email address.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={url}>
              Verify Email Address
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this URL into your browser:{" "}
            <Link href={url} style={anchor}>
              {url}
            </Link>
          </Text>
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

const anchor = {
  color: "#2563eb",
  textDecoration: "none",
};

const btnContainer = {
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#2563eb",
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

export default VerifyEmail;
