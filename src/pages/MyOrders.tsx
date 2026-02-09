import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
}

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // TODO: Replace with actual orders from Supabase/backend
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('techtitan-orders');
    return saved ? JSON.parse(saved) : [];
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => {}}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your orders
            </p>
            <Button onClick={() => navigate('/login')} className="bg-accent hover:bg-accent/90 text-white">
              Sign In
            </Button>
          </div>
        </main>
        <Footer onTabChange={handleTabChange} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => {}}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Orders Yet</h1>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button onClick={() => navigate('/products')} className="bg-accent hover:bg-accent/90 text-white">
              Browse Products
            </Button>
          </div>
        </main>
        <Footer onTabChange={handleTabChange} />
        <WhatsAppWidget />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => {}}
        activeTab=""
        onTabChange={handleTabChange}
      />

      <main className="flex-1">
        <div className="container py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              View and track your order history
            </p>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">Order #{order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-primary">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="grid gap-4 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
                    >
                      <Link to={`/product/${item.id}`}>
                        <div className="w-16 h-16 flex items-center justify-center bg-background rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain p-1"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`}>
                          <h4 className="font-medium hover:text-primary transition-colors line-clamp-1">
                            {item.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement order details view
                      alert('Order details coming soon!');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        // TODO: Implement cancel order
                        alert('Cancel order functionality coming soon!');
                      }}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement reorder
                        alert('Reorder functionality coming soon!');
                      }}
                    >
                      Reorder
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer onTabChange={handleTabChange} />
      <WhatsAppWidget />
      <BackToTop />
    </div>
  );
};

export default MyOrders;

