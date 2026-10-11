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
    // Fail closed until a trusted server creates the Razorpay order and verifies
    // the payment signature using a server-only secret. Never take money through
    // the old client-only flow, which could not securely verify payment.
    void params;
    throw new Error(
      'Online listing payments are temporarily unavailable while secure server-side verification is configured. No payment has been taken.'
    );
  }
}
