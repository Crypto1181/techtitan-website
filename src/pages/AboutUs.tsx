import { useNavigate } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutUs = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-6">About Us</h1>

            {/* Content */}
            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                Tech Titan is your destination for reliable, high-performance technology for both personal and business needs.
              </p>

              <p>
                We specialize in computers, laptops, PC components, gaming gear, and networking solutions, offering carefully selected products from trusted global brands. Our focus is simple: authentic products, clear specifications, and competitive pricing, no hidden surprises.
              </p>

              <p>
                Whether you're building a custom PC, upgrading your gaming setup, or equipping your workspace, we're here to help you find the right tech with confidence.
              </p>

              <p>
                We continuously update our catalog to reflect market availability and demand, working directly with trusted suppliers to ensure quality, consistency, and reliability.
              </p>

              <p>
                With fast local delivery, including same-day delivery in Beirut, Tech Titan makes getting the tech you need quick and hassle-free.
              </p>

              <p className="text-lg font-medium text-foreground">
                At Tech Titan, technology should be accessible, dependable, and transparent.
              </p>
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

export default AboutUs;

