export interface PaymentVerificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class RazorpayService {
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
