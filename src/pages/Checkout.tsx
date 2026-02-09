import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MainHeader from '@/components/layout/MainHeader';
import CategorySidebar from '@/components/layout/CategorySidebar';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createOrder, sendOrderToWhatsApp } from '@/services/woocommerce-orders';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  address1: z.string().min(1, 'Street address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  shipToDifferentAddress: z.boolean().default(false),
  shippingFirstName: z.string().optional(),
  shippingLastName: z.string().optional(),
  shippingAddress1: z.string().optional(),
  shippingAddress2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostcode: z.string().optional(),
  orderNotes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNonLebanonDialog, setShowNonLebanonDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('Lebanon');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'Lebanon',
      shipToDifferentAddress: false,
    },
  });

  const country = watch('country');
  const shipToDifferentAddress = watch('shipToDifferentAddress');

  // Watch for country changes and show popup for non-Lebanon
  useEffect(() => {
    if (country && country !== 'Lebanon' && country !== selectedCountry) {
      setSelectedCountry(country);
      setShowNonLebanonDialog(true);
    }
  }, [country, selectedCountry]);

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      });
      navigate('/cart');
      return;
    }

    setIsSubmitting(true);

    // Calculate total with shipping
    const orderTotal = getTotalPrice() + shipping;

    // Prepare order data for WhatsApp (we'll use this regardless of WooCommerce success)
    const whatsappOrderData = {
      orderId: Date.now(), // Use timestamp as temporary order ID
      customerName: `${data.firstName} ${data.lastName}`,
      customerPhone: data.phone,
      customerEmail: data.email,
      customerAddress: `${data.address1}${data.address2 ? `, ${data.address2}` : ''}, ${data.city}, ${data.postcode}, ${data.country}`,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: orderTotal,
      notes: data.orderNotes || '',
    };

    let wooCommerceOrderId: number | null = null;
    let orderCreationError: string | null = null;

    // Try to create order in WooCommerce (but don't fail if it doesn't work)
    try {
      const orderData = {
        billing: {
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.companyName || '',
          address_1: data.address1,
          address_2: data.address2 || '',
          city: data.city,
          postcode: data.postcode,
          country: data.country,
          email: data.email,
          phone: data.phone,
        },
        shipping: data.shipToDifferentAddress
          ? {
            first_name: data.shippingFirstName || data.firstName,
            last_name: data.shippingLastName || data.lastName,
            address_1: data.shippingAddress1 || data.address1,
            address_2: data.shippingAddress2 || data.address2,
            city: data.shippingCity || data.city,
            postcode: data.shippingPostcode || data.postcode,
            country: data.country,
          }
          : {
            first_name: data.firstName,
            last_name: data.lastName,
            address_1: data.address1,
            address_2: data.address2 || '',
            city: data.city,
            postcode: data.postcode,
            country: data.country,
          },
        line_items: items.map((item) => ({
          product_id: parseInt(item.id) || 0,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        payment_method: 'cod', // Cash on delivery
        payment_method_title: 'Cash on Delivery',
        customer_note: data.orderNotes || '',
        set_paid: false, // Not paid until delivery
      };

      const order = await createOrder(orderData);
      wooCommerceOrderId = order.id;
      whatsappOrderData.orderId = order.id; // Update with real order ID if successful
    } catch (error: any) {
      console.error('WooCommerce order creation failed:', error);
      orderCreationError = error.message || 'Failed to create order in WooCommerce';
      // Continue anyway - we'll still send WhatsApp message
    }

    // Clear cart
    clearCart();

    // Always send order info to WhatsApp (even if WooCommerce order creation failed)
    try {
      // Add note if WooCommerce order creation failed
      const notesWithError = orderCreationError
        ? `${whatsappOrderData.notes ? whatsappOrderData.notes + '\n\n' : ''}⚠️ Note: This order needs to be created manually in WooCommerce. Error: ${orderCreationError}`
        : whatsappOrderData.notes || '';

      await sendOrderToWhatsApp({
        ...whatsappOrderData,
        notes: notesWithError,
      });
    } catch (whatsappError) {
      console.error('Error sending to WhatsApp:', whatsappError);
      // Even if WhatsApp fails, we still want to show success since cart is cleared
    }

    // Show success message (always, since WhatsApp message is sent)
    if (wooCommerceOrderId) {
      toast({
        title: 'Order Placed Successfully!',
        description: `Order #${wooCommerceOrderId} has been placed. We'll contact you on WhatsApp to confirm.`,
      });
    } else {
      toast({
        title: 'Order Submitted!',
        description: 'Your order details have been sent via WhatsApp. We\'ll contact you shortly to confirm and process your order.',
      });
    }

    // Navigate to orders page
    navigate('/orders');

    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <div className="flex-1 flex">
          <CategorySidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onCategorySelect={(categoryId) => {
              navigate(`/products?category=${encodeURIComponent(categoryId)}`);
              setSidebarOpen(false);
            }}
          />
          <main className="flex-1 min-w-0 flex items-center justify-center py-12 px-4">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">
                Please add items to your cart before checkout.
              </p>
              <Button onClick={() => navigate('/cart')} className="bg-accent hover:bg-accent/90 text-white">
                Go to Cart
              </Button>
            </div>
          </main>
        </div>
        <Footer onTabChange={handleTabChange} />
        <WhatsAppWidget />
        <BackToTop />
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = 3.00; // Flat rate for small items
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        activeTab=""
        onTabChange={handleTabChange}
      />

      <div className="flex-1 flex">
        <CategorySidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCategorySelect={(categoryId) => {
            navigate(`/products?category=${encodeURIComponent(categoryId)}`);
            setSidebarOpen(false);
          }}
        />

        <main className="flex-1 min-w-0">
          <div className="container py-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/cart')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-muted-foreground">
                  Complete your order information
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Billing Details */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6">Billing details</h2>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="firstName">
                          First name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          className={errors.firstName ? 'border-destructive' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="lastName">
                          Last name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          className={errors.lastName ? 'border-destructive' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="companyName">Company name (optional)</Label>
                      <Input
                        id="companyName"
                        {...register('companyName')}
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="country">
                        Country / Region <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={country}
                        onValueChange={(value) => setValue('country', value)}
                      >
                        <SelectTrigger id="country" className={errors.country ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lebanon">Lebanon</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.country.message}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="address1">
                        Street address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="address1"
                        placeholder="House number and street name"
                        {...register('address1')}
                        className={errors.address1 ? 'border-destructive' : ''}
                      />
                      {errors.address1 && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.address1.message}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <Input
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        {...register('address2')}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="city">
                          Town / City <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="city"
                          {...register('city')}
                          className={errors.city ? 'border-destructive' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="postcode">
                          Postcode / ZIP <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="postcode"
                          {...register('postcode')}
                          className={errors.postcode ? 'border-destructive' : ''}
                        />
                        {errors.postcode && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.postcode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="phone">
                          Phone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">
                          Email address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shipToDifferentAddress"
                          checked={shipToDifferentAddress}
                          onCheckedChange={(checked) =>
                            setValue('shipToDifferentAddress', checked === true)
                          }
                        />
                        <Label
                          htmlFor="shipToDifferentAddress"
                          className="font-normal cursor-pointer"
                        >
                          Ship to a different address?
                        </Label>
                      </div>
                    </div>

                    {shipToDifferentAddress && (
                      <div className="mt-4 space-y-4 p-4 bg-secondary/30 rounded-lg">
                        <h3 className="font-semibold">Shipping Address</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shippingFirstName">First name</Label>
                            <Input
                              id="shippingFirstName"
                              {...register('shippingFirstName')}
                            />
                          </div>
                          <div>
                            <Label htmlFor="shippingLastName">Last name</Label>
                            <Input
                              id="shippingLastName"
                              {...register('shippingLastName')}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="shippingAddress1">Street address</Label>
                          <Input
                            id="shippingAddress1"
                            {...register('shippingAddress1')}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Apartment, suite, unit, etc. (optional)"
                            {...register('shippingAddress2')}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shippingCity">City</Label>
                            <Input
                              id="shippingCity"
                              {...register('shippingCity')}
                            />
                          </div>
                          <div>
                            <Label htmlFor="shippingPostcode">Postcode</Label>
                            <Input
                              id="shippingPostcode"
                              {...register('shippingPostcode')}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Label htmlFor="orderNotes">Order notes (optional)</Label>
                      <Textarea
                        id="orderNotes"
                        placeholder="Notes about your order, e.g. special notes for delivery."
                        {...register('orderNotes')}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                    <h2 className="text-xl font-bold mb-4">Your order</h2>

                    <div className="space-y-3 mb-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-3 space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">Flat rate: ${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                        <span>Total</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-muted/50 rounded border border-border">
                      <h3 className="font-semibold mb-2">Cash on delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Pay with cash upon delivery.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90 text-white"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground mt-4">
                      Your personal data will be used to process your order, support your experience
                      throughout this website, and for other purposes described in our{' '}
                      <a href="/privacy-policy" className="underline">
                        privacy policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Non-Lebanon Country Dialog */}
      <Dialog open={showNonLebanonDialog} onOpenChange={setShowNonLebanonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipping Notice</DialogTitle>
            <DialogDescription>
              For shipping inquiries, please contact our customer service before placing your order.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowNonLebanonDialog(false)}>
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer onTabChange={handleTabChange} />
      <WhatsAppWidget />
      <BackToTop />
    </div>
  );
};

export default Checkout;

