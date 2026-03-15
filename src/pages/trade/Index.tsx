import { useAuth } from '@/contexts/AuthContext';
import TradeHomeInternal from './HomeInternal';
import TradeHomeSupplier from './HomeSupplier';

/**
 * Trade Home - Routes to appropriate home based on user type
 */
export default function TradeIndex() {
  const { userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-success"></div>
      </div>
    );
  }

  if (userType === 'supplier') {
    return <TradeHomeSupplier />;
  }

  return <TradeHomeInternal />;
}
