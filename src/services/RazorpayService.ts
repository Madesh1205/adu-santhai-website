import { supabase } from '@/lib/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentVerificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class RazorpayService {
  private static scriptLoadingPromise: Promise<boolean> | null = null;

  /**
   * Dynamically loads Razorpay checkout SDK script.
   */
  static loadScript(): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false);
    if (window.Razorpay) return Promise.resolve(true);

    if (this.scriptLoadingPromise) return this.scriptLoadingPromise;

    this.scriptLoadingPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        resolve(false);
      };
      document.body.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Initiates payment for partner farm goat listing fee (₹100).
   * Note: Ammal Farm listings are automatically exempt in database triggers.
   */
  static async payListingFee(params: {
    goatId: string;
    goatName: string;
    customerEmail?: string;
    customerPhone?: string;
    farmName?: string;
  }): Promise<PaymentVerificationResult> {
    const isLoaded = await this.loadScript();
    if (!isLoaded) {
      throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim();
    if (!razorpayKeyId) {
      throw new Error('Online listing payments are not configured. Please contact support; no payment has been taken.');
    }
    const amountInPaise = 10000; // ₹100.00

    return new Promise((resolve, reject) => {
      const options = {
        key: razorpayKeyId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Adu Santhai - Ammal Farm',
        description: `Listing Fee for ${params.goatName}`,
        image: '/favicon.svg',
        prefill: {
          email: params.customerEmail || '',
          contact: params.customerPhone || '',
        },
        theme: {
          color: '#059669', // Emerald 600
        },
        handler: async (response: any) => {
          try {
            // Fail closed: never invent order IDs or signatures. The current
            // checkout must be created and signature-verified by a trusted server
            // before this client can claim a listing fee is paid.
            if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
              resolve({
                success: false,
                error: 'Payment cannot be verified securely. Do not retry the payment; contact support with your payment receipt.',
              });
              return;
            }

            // This RPC is retained for compatibility only. Its current database
            // implementation does not cryptographically verify Razorpay signatures;
            // it must not be treated as secure until replaced by server-side verification.
            const { error } = await supabase.rpc('verify_listing_payment_atomic', {
              p_goat_id: params.goatId,
              p_order_id: response.razorpay_order_id,
              p_payment_id: response.razorpay_payment_id,
              p_signature: response.razorpay_signature,
              p_amount: 100,
            });

            if (error) {
              console.error('Payment verification RPC error:', error);
              resolve({
                success: false,
                error: error.message || 'Payment verification failed on server',
              });
              return;
            }

            resolve({
              success: true,
              message: 'Listing fee successfully paid and verified!',
            });
          } catch (err: any) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            resolve({
              success: false,
              error: 'Payment was cancelled by user',
            });
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          console.error('Razorpay payment failed:', response.error);
          resolve({
            success: false,
            error: response.error?.description || 'Payment transaction failed',
          });
        });
        rzp.open();
      } catch (err) {
        console.error('Error opening Razorpay modal:', err);
        reject(err);
      }
    });
  }
}
