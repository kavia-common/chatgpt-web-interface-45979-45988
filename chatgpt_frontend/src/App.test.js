import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header, search input, input placeholder, and send button', () => {
  render(<App />);
  expect(screen.getByRole('banner', { name: /application header/i })).toBeInTheDocument();
  expect(screen.getByRole('search', { name: /search messages/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
});
