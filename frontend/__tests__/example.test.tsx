import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Example Test', () => {
  it('should render a simple div', () => {
    render(<div>Hello, Jest!</div>);
    expect(screen.getByText('Hello, Jest!')).toBeInTheDocument();
  });
});
