import React from 'react';
import { render } from '@testing-library/react-native';
import Loader from '../Loader';

describe('Loader', () => {
  it('renders correctly with default props', () => {
    const { getByText, getByTestId } = render(<Loader />);
    
    // It should render the LoadingSpinner component (which contains these texts)
    expect(getByText('Please wait...')).toBeTruthy();
    expect(getByText("We're processing your request")).toBeTruthy();
    
    // It should render a loading spinner container
    const spinnerContainer = getByTestId('loading-spinner');
    expect(spinnerContainer).toBeTruthy();
  });
});
