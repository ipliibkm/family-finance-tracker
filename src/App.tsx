import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PersonsPage from './pages/PersonsPage';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import RecurringEntriesPage from './pages/RecurringEntriesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import DebtsPage from './pages/DebtsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import SettingsPage from './pages/SettingsPage';
import ForecastingPage from "./pages/ForecastingPage.tsx";

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/forecast" element={<ForecastingPage />} />
            <Route path="/persons" element={<PersonsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/recurring" element={<RecurringEntriesPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/debts" element={<DebtsPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;