import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null
}), { virtual: true });

jest.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => null
}), { virtual: true });

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null
}), { virtual: true });

describe('Main route maintenance mode', () => {
  test('renders the maintenance page at root path', async () => {
    window.history.pushState({}, 'Home', '/');

    render(<App />);

    expect(await screen.findByText(/under maintenance/i)).toBeInTheDocument();
    expect(screen.getByText(/performing maintenance/i)).toBeInTheDocument();
  });
});
