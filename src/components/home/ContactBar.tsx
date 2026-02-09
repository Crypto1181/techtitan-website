import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactBar = () => {
  return (
    <section className="py-6 bg-gradient-to-r from-card to-secondary/50">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* Phone number */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Customer service</span>
            <Button
              variant="outline"
              className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 font-bold text-lg"
              onClick={() => window.open('tel:+12038222073', '_self')}
            >
              <Phone className="h-4 w-4 mr-2" />
              +1 (203) 822-2073
            </Button>
          </div>

          {/* Contact button */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Have any questions?</span>
            <Button
              className="bg-accent text-white hover:bg-accent/90 font-bold"
              onClick={() => window.open('https://wa.me/12038222073', '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactBar;
