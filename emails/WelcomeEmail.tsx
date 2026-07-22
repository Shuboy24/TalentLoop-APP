import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to TalentLoop, {firstName}!</Heading>
          <Text style={text}>
            We're thrilled to have you join our community.
          </Text>
          <Text style={text}>
            TalentLoop is all about exchanging skills and creating value together without money changing hands.
          </Text>
          <Text style={text}>
            Get started by completing your profile and proposing your first trade!
          </Text>
          <Text style={footer}>
            Best regards,<br/>The TalentLoop Team
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

const footer = {
  color: "#5e656e",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "48px",
};

export default WelcomeEmail;
