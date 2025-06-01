import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import AmountDisplay from '../components/shared/AmountDisplay';
import { formatCurrency, formatDate, abbreviateText } from '../utils/formatters';
import { 
  BarChart3, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  ArrowUpRight, 
  ArrowDownRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { 
    persons, 
    accounts, 
    transactions, 
    categories,
    subscriptions,
    debts,
    investments 
  } = useAppContext();

  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);

  useEffect(() => {
    // Calculate total balance
    const balance = accounts.reduce((sum, account) => sum + account.balance, 0);
    setTotalBalance(balance);

    // Calculate total income and expense for the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const income = monthTransactions
      .filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const expense = monthTransactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    
    setTotalIncome(income);
    setTotalExpense(expense);

    // Get recent transactions
    const sortedTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(transaction => {
        const person = persons.find(p => p.id === transaction.personId);
        const account = accounts.find(a => a.id === transaction.accountId);
        const category = categories.find(c => c.id === transaction.categoryId);
        
        return {
          ...transaction,
          personName: person?.name || 'Unbekannt',
          accountName: account?.name || 'Unbekannt',
          categoryName: category?.name || 'Unbekannt',
          categoryColor: category?.color || '#CCCCCC'
        };
      });
    
    setRecentTransactions(sortedTransactions);

    // Calculate upcoming payments (subscriptions and debt payments due in the next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    // Upcoming subscriptions
    const upcomingSubscriptionPayments = subscriptions
      .filter(subscription => {
        // Filter out subscriptions that have ended
        if (subscription.endDate && new Date(subscription.endDate) < now) {
          return false;
        }
        
        // For monthly subscriptions
        if (subscription.frequency === 'monthly' && subscription.dayOfMonth) {
          const nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), subscription.dayOfMonth);
          
          // If the day has passed this month, move to next month
          if (nextPaymentDate.getDate() < now.getDate()) {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          }
          
          return nextPaymentDate <= thirtyDaysFromNow;
        }
        
        return true; // Include other frequencies by default (can refine later)
      })
      .map(subscription => {
        const person = persons.find(p => p.id === subscription.personId);
        const account = accounts.find(a => a.id === subscription.accountId);
        
        let nextPaymentDate = new Date();
        if (subscription.frequency === 'monthly' && subscription.dayOfMonth) {
          nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), subscription.dayOfMonth);
          if (nextPaymentDate.getDate() < now.getDate()) {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          }
        }
        
        return {
          id: subscription.id,
          name: subscription.name,
          amount: -Math.abs(subscription.amount), // Ensure negative for expenses
          date: nextPaymentDate.toISOString(),
          personName: person?.name || 'Unbekannt',
          accountName: account?.name || 'Unbekannt',
          type: 'subscription'
        };
      });
    
    // Upcoming debt payments
    const upcomingDebtPayments = debts
      .filter(debt => {
        if (debt.remainingAmount <= 0) return false;
        
        const nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), debt.dayOfMonth);
        if (nextPaymentDate.getDate() < now.getDate()) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
        
        return nextPaymentDate <= thirtyDaysFromNow;
      })
      .map(debt => {
        const person = persons.find(p => p.id === debt.personId);
        const account = accounts.find(a => a.id === debt.accountId);
        
        const nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), debt.dayOfMonth);
        if (nextPaymentDate.getDate() < now.getDate()) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
        
        return {
          id: debt.id,
          name: debt.name,
          amount: -Math.abs(debt.monthlyPayment), // Ensure negative for payments
          date: nextPaymentDate.toISOString(),
          personName: person?.name || 'Unbekannt',
          accountName: account?.name || 'Unbekannt',
          type: 'debt'
        };
      });
    
    // Combine and sort by date
    const allUpcomingPayments = [...upcomingSubscriptionPayments, ...upcomingDebtPayments]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
    
    setUpcomingPayments(allUpcomingPayments);
  }, [accounts, transactions, persons, categories, subscriptions, debts]);

  // Calculate total investment value
  const totalInvestmentValue = investments.reduce(
    (sum, inv) => sum + (inv.currentPricePerUnit * inv.units), 
    0
  );

  // Calculate Investment performance (percentage change)
  const totalInvestmentCost = investments.reduce(
    (sum, inv) => sum + (inv.purchasePricePerUnit * inv.units), 
    0
  );
  const investmentPerformance = totalInvestmentCost > 0 
    ? ((totalInvestmentValue - totalInvestmentCost) / totalInvestmentCost) * 100 
    : 0;

  return (
    <div>
      <h1 className="mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 font-medium">Gesamtbilanz</h3>
            <CreditCard size={20} className="text-primary-400" />
          </div>
          <AmountDisplay amount={totalBalance} size="lg" />
        </div>
        
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 font-medium">Monatliches Einkommen</h3>
            <ArrowUpRight size={20} className="text-success-400" />
          </div>
          <AmountDisplay amount={totalIncome} size="lg" />
        </div>
        
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 font-medium">Monatliche Ausgaben</h3>
            <ArrowDownRight size={20} className="text-error-400" />
          </div>
          <AmountDisplay amount={-totalExpense} size="lg" />
        </div>
        
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 font-medium">Investments</h3>
            <TrendingUp size={20} className="text-accent-400" />
          </div>
          <div className="flex items-baseline">
            <AmountDisplay amount={totalInvestmentValue} size="lg" />
            <span className={`ml-2 text-sm ${investmentPerformance >= 0 ? 'text-success-400' : 'text-error-400'}`}>
              {investmentPerformance >= 0 ? '+' : ''}{investmentPerformance.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Accounts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Konten</h2>
              <Link to="/accounts" className="text-primary-400 text-sm flex items-center hover:underline">
                Alle anzeigen <ExternalLink size={14} className="ml-1" />
              </Link>
            </div>
            
            {accounts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>Keine Konten vorhanden</p>
                <Link to="/accounts" className="btn btn-primary mt-2 inline-block">
                  Konto hinzufügen
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map(account => {
                  const person = persons.find(p => p.id === account.personId);
                  return (
                    <div key={account.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-sm text-gray-500">{person?.name || 'Unbekannt'}</p>
                      </div>
                      <AmountDisplay amount={account.balance} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Upcoming Payments */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Anstehende Zahlungen</h2>
              <Calendar size={18} className="text-warning-400" />
            </div>
            
            {upcomingPayments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>Keine anstehenden Zahlungen</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map(payment => (
                  <div key={`${payment.type}-${payment.id}`} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium">{payment.name}</h4>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 mr-2">{formatDate(payment.date)}</p>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                          {payment.type === 'subscription' ? 'Abo' : 'Schulden'}
                        </span>
                      </div>
                    </div>
                    <AmountDisplay amount={payment.amount} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Letzte Transaktionen</h2>
          <Link to="/transactions" className="text-primary-400 text-sm flex items-center hover:underline">
            Alle anzeigen <ExternalLink size={14} className="ml-1" />
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>Keine Transaktionen vorhanden</p>
            <Link to="/transactions" className="btn btn-primary mt-2 inline-block">
              Transaktion hinzufügen
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschreibung</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konto</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Betrag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {abbreviateText(transaction.description, 30)}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: transaction.categoryColor }}
                        ></span>
                        {transaction.categoryName}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {transaction.personName}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {transaction.accountName}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <AmountDisplay amount={transaction.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;