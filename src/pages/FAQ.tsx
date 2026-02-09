import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  const faqs: FAQItem[] = [
    {
      question: "Are your products original?",
      answer: "Yes. All products sold by Tech Titan are 100% authentic and sourced from trusted suppliers."
    },
    {
      question: "Do your products come with warranty?",
      answer: "Warranty coverage depends on the product and brand. If applicable, warranty details are clearly listed on the product page."
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "If you need to make changes, please contact us as soon as possible after placing your order. Orders cannot be modified once dispatched."
    },
    {
      question: "What is your return or exchange policy?",
      answer: "Returns or exchanges are accepted only for manufacturing defects and must be reported within 24 hours of delivery."
    },
    {
      question: "How can I contact customer support?",
      answer: "Our support team is available via WhatsApp or phone. Contact details can be found on the website."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Frequently Asked Questions</h1>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-8 p-6 bg-card border border-border rounded-lg">
              <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help. Contact us via WhatsApp or phone.
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

export default FAQ;

