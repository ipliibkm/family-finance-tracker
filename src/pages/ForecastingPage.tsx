import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { addMonths, addWeeks, addYears, format, startOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  LineChart, 
  TrendingUp, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AmountDisplay from '../components/shared/AmountDisplay';

type TimeRange = '6months' | '5weeks' | '2years';
type ForecastEntry = {
  date: Date;
  income: number;
  expenses: number;
  balance: number;
  details: {
    type: 'recurring' | 'subscription' | 'debt';
    name: string;
    amount: number;
  }[];
};

const ForecastingPage: React.FC = () => {
  const { 
    accounts,
    recurringEntries,
    subscriptions,
    debts
  } = useAppContext();

  const [timeRange, setTimeRange] = useState<TimeRange>('6months');
  const [forecast, setForecast] = useState<ForecastEntry[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  // Calculate initial balance from all accounts
  const initialBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  useEffect(() => {
    const calculateForecast = () => {
      const today = new Date();
      const startDate = startOfMonth(today);
      let endDate: Date;

      switch (timeRange) {
        case '5weeks':
          endDate = addWeeks(today, 5);
          break;
        case '2years':
          endDate = addYears(today, 2);
          break;
        default: // 6months
          endDate = addMonths(today, 6);
      }

      const forecastData: ForecastEntry[] = [];
      let currentDate = startDate;
      let runningBalance = initialBalance;

      while (currentDate <= endDate) {
        const monthEntries: ForecastEntry['details'] = [];
        let monthlyIncome = 0;
        let monthlyExpenses = 0;

        // Add recurring income
        recurringEntries.forEach(entry => {
          if (entry.endDate && new Date(entry.endDate) < currentDate) return;
          if (new Date(entry.startDate) > currentDate) return;

          switch (entry.frequency) {
            case 'monthly':
              monthlyIncome += entry.amount;
              monthEntries.push({
                type: 'recurring',
                name: entry.name,
                amount: entry.amount
              });
              break;
            case 'yearly':
              if (currentDate.getMonth() === new Date(entry.startDate).getMonth()) {
                monthlyIncome += entry.amount;
                monthEntries.push({
                  type: 'recurring',
                  name: entry.name,
                  amount: entry.amount
                });
              }
              break;
            // Add other frequencies as needed
          }
        });

        // Add subscription expenses
        subscriptions.forEach(sub => {
          if (sub.endDate && new Date(sub.endDate) < currentDate) return;
          if (new Date(sub.startDate) > currentDate) return;

          if (sub.frequency === 'monthly') {
            monthlyExpenses += sub.amount;
            monthEntries.push({
              type: 'subscription',
              name: sub.name,
              amount: -sub.amount
            });
          }
        });

        // Add debt payments
        debts.forEach(debt => {
          if (debt.endDate && new Date(debt.endDate) < currentDate) return;
          if (new Date(debt.startDate) > currentDate) return;

          if (debt.monthlyPayment) {
            monthlyExpenses += debt.monthlyPayment;
            monthEntries.push({
              type: 'debt',
              name: debt.name,
              amount: -debt.monthlyPayment
            });
          }
        });

        runningBalance += (monthlyIncome - monthlyExpenses);

        forecastData.push({
          date: new Date(currentDate),
          income: monthlyIncome,
          expenses: monthlyExpenses,
          balance: runningBalance,
          details: monthEntries.sort((a, b) => b.amount - a.amount) // Sort by amount
        });

        currentDate = addMonths(currentDate, 1);
      }

      setForecast(forecastData);
    };

    calculateForecast();
  }, [timeRange, initialBalance, recurringEntries, subscriptions, debts]);

  const toggleMonthExpanded = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  // Calculate total changes
  const totalIncome = forecast.reduce((sum, entry) => sum + entry.income, 0);
  const totalExpenses = forecast.reduce((sum, entry) => sum + entry.expenses, 0);
  const netChange = totalIncome - totalExpenses;
  const finalBalance = initialBalance + netChange;

  // Calculate percentage changes
  const incomePercentage = ((totalIncome / Math.abs(initialBalance)) * 100);
  const expensePercentage = ((totalExpenses / Math.abs(initialBalance)) * 100);
  const balancePercentage = ((netChange / Math.abs(initialBalance)) * 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Prognose</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="select w-40"
        >
          <option value="5weeks">5 Wochen</option>
          <option value="6months">6 Monate</option>
          <option value="2years">2 Jahre</option>
        </select>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium">Aktueller Kontostand</h3>
              <LineChart size={20} className="text-gray-400" />
            </div>
            <AmountDisplay amount={initialBalance} size="lg" />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium">Prognostizierte Einnahmen</h3>
              <TrendingUp size={20} className="text-success-400" />
            </div>
            <div>
              <AmountDisplay amount={totalIncome} size="lg" />
              <span className="text-sm text-success-400 ml-2">
                +{incomePercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium">Prognostizierte Ausgaben</h3>
              <TrendingUp size={20} className="text-error-400 transform rotate-180" />
            </div>
            <div>
              <AmountDisplay amount={-totalExpenses} size="lg" />
              <span className="text-sm text-error-400 ml-2">
                -{expensePercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium">Prognostizierter Endstand</h3>
              <Calendar size={20} className="text-primary-400" />
            </div>
            <div>
              <AmountDisplay amount={finalBalance} size="lg" />
              <span className={`text-sm ml-2 ${balancePercentage >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                {balancePercentage >= 0 ? '+' : ''}{balancePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Forecast Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monat
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Einnahmen
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ausgaben
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Netto
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontostand
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecast.map((entry, index) => {
                  const monthKey = format(entry.date, 'yyyy-MM');
                  const isExpanded = expandedMonths.includes(monthKey);
                  const monthNet = entry.income - entry.expenses;
                  
                  return (
                    <React.Fragment key={monthKey}>
                      <tr 
                        className={`hover:bg-gray-50 cursor-pointer ${entry.details.length > 0 ? 'cursor-pointer' : ''}`}
                        onClick={() => entry.details.length > 0 && toggleMonthExpanded(monthKey)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.details.length > 0 && (
                              <button className="mr-2 text-gray-500">
                                {isExpanded ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            )}
                            <span>
                              {format(entry.date, 'MMMM yyyy', { locale: de })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <AmountDisplay amount={entry.income} />
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <AmountDisplay amount={-entry.expenses} />
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <AmountDisplay amount={monthNet} />
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-medium">
                          <AmountDisplay amount={entry.balance} />
                        </td>
                      </tr>
                      {isExpanded && entry.details.map((detail, detailIndex) => (
                        <tr key={`${monthKey}-${detailIndex}`} className="bg-gray-50">
                          <td className="px-4 py-2 pl-12">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600">
                                {detail.name}
                              </span>
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {detail.type === 'recurring' ? 'Wiederkehrend' : 
                                 detail.type === 'subscription' ? 'Abonnement' : 'Schulden'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {detail.amount > 0 && (
                              <AmountDisplay amount={detail.amount} size="sm" />
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {detail.amount < 0 && (
                              <AmountDisplay amount={detail.amount} size="sm" />
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <AmountDisplay amount={detail.amount} size="sm" />
                          </td>
                          <td className="px-4 py-2"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastingPage;