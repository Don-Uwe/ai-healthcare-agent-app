export const verifyChatbotResponse = (text: string) => {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('according to') ||
    lowerText.includes('research') ||
    lowerText.includes('study') ||
    lowerText.includes('evidence')
  ) {
    return {
      status: 'VERIFIED',
      confidence: 'HIGH',
    };
  }

  if (text.length > 50) {
    return {
      status: 'AI_GENERATED',
      confidence: 'MEDIUM',
    };
  }

  return {
    status: 'LOW_CONFIDENCE',
    confidence: 'LOW',
  };
};