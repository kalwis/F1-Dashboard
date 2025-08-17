import { render, screen } from '@testing-library/react';
import DashboardPage from './pages/DashboardPage';

test('renders dashboard heading', () => {
  render(<DashboardPage />);
  const heading = screen.getByText(/dashboard overview/i);
  expect(heading).toBeInTheDocument();
});
