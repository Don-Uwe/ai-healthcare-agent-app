import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, Separator } from 'tamagui';
import { hp } from '../helper/Metric';

const TermsAndConditionsScreen = () => {
  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        {/* Title */}
        <Text fontSize="$8" fontWeight="700">
          Terms & Conditions
        </Text>

        <Text color="$gray10">
          Last updated: 2024
        </Text>

        <Separator />

        {/* Intro */}
        <Text>
          Welcome to <Text fontWeight="600">UltimateHealth</Text>. By accessing or
          using this application, you agree to comply with and be bound by the
          following Terms & Conditions.
        </Text>

        {/* Section */}
        <Text fontSize="$6" fontWeight="600">
          1. Acceptance of Terms
        </Text>
        <Text>
          By using this app, you confirm that you are legally permitted to do so
          and agree to follow all applicable laws and regulations.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          2. Purpose of the App
        </Text>
        <Text>
          UltimateHealth is a wellness and lifestyle support application. The
          content provided is for informational purposes only and should not be
          considered medical advice.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          3. User Responsibilities
        </Text>
        <Text>
          You agree not to misuse the application, attempt unauthorized access,
          or engage in any activity that disrupts app functionality.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          4. Health Disclaimer
        </Text>
        <Text>
          UltimateHealth does not guarantee health outcomes. Always consult a
          qualified healthcare professional before making medical decisions.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          5. Intellectual Property
        </Text>
        <Text>
          All content, branding, and software are the property of UltimateHealth
          and may not be reused without permission.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          6. Privacy
        </Text>
        <Text>
          Your data is handled according to our Privacy Policy. We respect user
          privacy and do not sell personal information.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          7. App Availability
        </Text>
        <Text>
          We may update, modify, or discontinue the app at any time without prior
          notice.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          8. Limitation of Liability
        </Text>
        <Text>
          UltimateHealth is provided “as is” and shall not be liable for any
          damages arising from the use of this app.
        </Text>

        <Text fontSize="$6" fontWeight="600">
          9. Governing Law
        </Text>
        <Text>
          These terms are governed by the laws of India.
        </Text>

        <Separator />

        {/* Footer */}
        <Text color="$gray9" fontSize="$4" textAlign="center" marginBottom={hp(5)}>
          © 2025 UltimateHealth
        </Text>
      </YStack>
    </ScrollView>
  );
};

export default TermsAndConditionsScreen;
