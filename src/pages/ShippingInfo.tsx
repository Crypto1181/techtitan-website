import { useNavigate } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { ArrowLeft, Truck, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ShippingInfo = () => {
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => {}}
        activeTab=""
        onTabChange={handleTabChange}
      />

      <main className="flex-1">
        <div className="container py-6 md:py-12">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Shipping Information</h1>

            {/* Shipping Coverage */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-2">Shipping Coverage</h2>
                  <p className="text-muted-foreground">
                    We currently ship within Lebanon.
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Rates */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <Truck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Shipping Rates</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Standard items:</h3>
                      <p className="text-muted-foreground">
                        Flat shipping rate of <span className="font-bold text-foreground">$3</span>
                      </p>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="font-semibold mb-2">Large or bulky items:</h3>
                      <p className="text-muted-foreground mb-2">
                        Large or bulky items (including gaming chairs, desks, and large monitors) are excluded from the $3 flat rate.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Shipping fees vary based on item size and delivery location</li>
                        <li>Our team will contact you to confirm the final shipping cost before dispatch</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Times */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-4">Delivery Times</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Same-day delivery</span>
                      <span>in Beirut</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">1–3 business days</span>
                      <span>outside Beirut, depending on location and availability</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2">Questions about shipping?</h2>
              <p className="text-muted-foreground mb-4">
                Contact us for a shipping quote or if you have any questions about delivery.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://wa.me/96176653008', '_blank')}
                >
                  Contact via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'tel:+96176653008'}
                >
                  Call Us: 76 653 008
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onTabChange={handleTabChange} />
      <WhatsAppWidget />
      <BackToTop />
    </div>
  );
};

export default ShippingInfo;

