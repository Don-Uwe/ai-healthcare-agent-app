import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ResearchSummaryCard from '../components/ResearchSummaryCard';

const mockSummary = {
  simplifiedExplanation: 'Diabetes is when your body cannot control blood sugar properly.',
  keyFindings: [
    'Insulin resistance causes Type 2 diabetes',
    'Diet and exercise can prevent it',
  ],
  beginnerTakeaways: [
    'Reduce sugar intake',
    'Walk 30 minutes daily',
  ],
  whyItMatters: 'Diabetes affects 500 million people and is largely preventable.',
};

describe('ResearchSummaryCard', () => {

  it('shows loading spinner when loading is true', () => {
    const { getByText } = render(
      <ResearchSummaryCard summary={null} loading={true} />
    );
    expect(getByText('📋 Generating AI Summary...')).toBeTruthy();
  });

  it('renders nothing when summary is null and not loading', () => {
    const { toJSON } = render(
      <ResearchSummaryCard summary={null} loading={false} />
    );
    expect(toJSON()).toBeNull();
  });

  it('shows simplified explanation by default', () => {
    const { getByText } = render(
      <ResearchSummaryCard summary={mockSummary} loading={false} />
    );
    expect(getByText(mockSummary.simplifiedExplanation)).toBeTruthy();
  });

  it('hides key findings before expanding', () => {
    const { queryByText } = render(
      <ResearchSummaryCard summary={mockSummary} loading={false} />
    );
    expect(queryByText('• Insulin resistance causes Type 2 diabetes')).toBeNull();
  });

  it('expands to show all sections on tap', () => {
    const { getByText } = render(
      <ResearchSummaryCard summary={mockSummary} loading={false} />
    );
    fireEvent.press(getByText('📋 Research Summary'));
    expect(getByText('• Insulin resistance causes Type 2 diabetes')).toBeTruthy();
    expect(getByText('✓ Reduce sugar intake')).toBeTruthy();
    expect(getByText(mockSummary.whyItMatters)).toBeTruthy();
  });

  it('collapses again on second tap', () => {
    const { getByText, queryByText } = render(
      <ResearchSummaryCard summary={mockSummary} loading={false} />
    );
    fireEvent.press(getByText('📋 Research Summary'));
    fireEvent.press(getByText('📋 Research Summary'));
    expect(queryByText('• Insulin resistance causes Type 2 diabetes')).toBeNull();
  });

});
