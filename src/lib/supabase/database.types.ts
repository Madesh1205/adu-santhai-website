export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          new_state: string | null;
          notes: string | null;
          previous_state: string | null;
          target_id: string;
          target_type: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          new_state?: string | null;
          notes?: string | null;
          previous_state?: string | null;
          target_id: string;
          target_type: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          new_state?: string | null;
          notes?: string | null;
          previous_state?: string | null;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          admin_notes: string | null;
          booking_code: string | null;
          booking_date: string;
          cancelled_at: string | null;
          completed_at: string | null;
          confirmed_at: string | null;
          created_at: string;
          customer_id: string | null;
          customer_notes: string | null;
          deposit_paid: number;
          farm_id: string;
          goat_id: string | null;
          hold_expires_at: string;
          id: string;
          status: Database["public"]["Enums"]["booking_status"];
          total_price: number;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          booking_code?: string | null;
          booking_date?: string;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_notes?: string | null;
          deposit_paid?: number;
          farm_id: string;
          goat_id?: string | null;
          hold_expires_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          total_price: number;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          booking_code?: string | null;
          booking_date?: string;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_notes?: string | null;
          deposit_paid?: number;
          farm_id?: string;
          goat_id?: string | null;
          hold_expires_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          total_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_goat_id_fkey";
            columns: ["goat_id"];
            isOneToOne: false;
            referencedRelation: "goats";
            referencedColumns: ["id"];
          },
        ];
      };
      breeds: {
        Row: {
          avg_weight_kg: number | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          origin: string | null;
          primary_purpose: Database["public"]["Enums"]["goat_purpose"] | null;
          updated_at: string;
        };
        Insert: {
          avg_weight_kg?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          origin?: string | null;
          primary_purpose?: Database["public"]["Enums"]["goat_purpose"] | null;
          updated_at?: string;
        };
        Update: {
          avg_weight_kg?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          origin?: string | null;
          primary_purpose?: Database["public"]["Enums"]["goat_purpose"] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      farms: {
        Row: {
          address: string | null;
          banner_url: string | null;
          contact_email: string | null;
          contact_phone: string;
          created_at: string;
          description: string | null;
          farm_code: string;
          goat_listing_limit: number;
          id: string;
          is_ammal_own_farm: boolean;
          latitude: number | null;
          location_district: string;
          location_state: string;
          logo_url: string | null;
          longitude: number | null;
          name: string;
          owner_id: string | null;
          rating: number;
          review_count: number;
          status: Database["public"]["Enums"]["farm_status"];
          tagline: string | null;
          updated_at: string;
          verified_at: string | null;
        };
        Insert: {
          address?: string | null;
          banner_url?: string | null;
          contact_email?: string | null;
          contact_phone: string;
          created_at?: string;
          description?: string | null;
          farm_code?: string;
          goat_listing_limit?: number;
          id?: string;
          is_ammal_own_farm?: boolean;
          latitude?: number | null;
          location_district: string;
          location_state?: string;
          logo_url?: string | null;
          longitude?: number | null;
          name: string;
          owner_id?: string | null;
          rating?: number;
          review_count?: number;
          status?: Database["public"]["Enums"]["farm_status"];
          tagline?: string | null;
          updated_at?: string;
          verified_at?: string | null;
        };
        Update: {
          address?: string | null;
          banner_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string;
          created_at?: string;
          description?: string | null;
          farm_code?: string;
          goat_listing_limit?: number;
          id?: string;
          is_ammal_own_farm?: boolean;
          latitude?: number | null;
          location_district?: string;
          location_state?: string;
          logo_url?: string | null;
          longitude?: number | null;
          name?: string;
          owner_id?: string | null;
          rating?: number;
          review_count?: number;
          status?: Database["public"]["Enums"]["farm_status"];
          tagline?: string | null;
          updated_at?: string;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "farms_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      goat_images: {
        Row: {
          created_at: string;
          display_order: number;
          goat_id: string;
          id: string;
          image_url: string;
          is_primary: boolean;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          goat_id: string;
          id?: string;
          image_url: string;
          is_primary?: boolean;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          goat_id?: string;
          id?: string;
          image_url?: string;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "goat_images_goat_id_fkey";
            columns: ["goat_id"];
            isOneToOne: false;
            referencedRelation: "goats";
            referencedColumns: ["id"];
          },
        ];
      };
      goats: {
        Row: {
          age_months: number;
          breed_id: string | null;
          breed_name: string;
          created_at: string;
          description: string | null;
          dewormed_date: string | null;
          discount_percentage: number;
          farm_id: string;
          gender: Database["public"]["Enums"]["goat_gender"];
          goat_code: string;
          id: string;
          is_approved_by_admin: boolean;
          is_featured: boolean;
          name: string;
          parentage_father_tag: string | null;
          parentage_mother_tag: string | null;
          price: number;
          purpose: Database["public"]["Enums"]["goat_purpose"];
          rating: number;
          review_count: number;
          status: Database["public"]["Enums"]["goat_status"];
          updated_at: string;
          vaccination_status: string | null;
          weight_kg: number;
        };
        Insert: {
          age_months: number;
          breed_id?: string | null;
          breed_name: string;
          created_at?: string;
          description?: string | null;
          dewormed_date?: string | null;
          discount_percentage?: number;
          farm_id: string;
          gender: Database["public"]["Enums"]["goat_gender"];
          goat_code?: string;
          id?: string;
          is_approved_by_admin?: boolean;
          is_featured?: boolean;
          name: string;
          parentage_father_tag?: string | null;
          parentage_mother_tag?: string | null;
          price: number;
          purpose: Database["public"]["Enums"]["goat_purpose"];
          rating?: number;
          review_count?: number;
          status?: Database["public"]["Enums"]["goat_status"];
          updated_at?: string;
          vaccination_status?: string | null;
          weight_kg: number;
        };
        Update: {
          age_months?: number;
          breed_id?: string | null;
          breed_name?: string;
          created_at?: string;
          description?: string | null;
          dewormed_date?: string | null;
          discount_percentage?: number;
          farm_id?: string;
          gender?: Database["public"]["Enums"]["goat_gender"];
          goat_code?: string;
          id?: string;
          is_approved_by_admin?: boolean;
          is_featured?: boolean;
          name?: string;
          parentage_father_tag?: string | null;
          parentage_mother_tag?: string | null;
          price?: number;
          purpose?: Database["public"]["Enums"]["goat_purpose"];
          rating?: number;
          review_count?: number;
          status?: Database["public"]["Enums"]["goat_status"];
          updated_at?: string;
          vaccination_status?: string | null;
          weight_kg?: number;
        };
        Relationships: [
          {
            foreignKeyName: "goats_breed_id_fkey";
            columns: ["breed_id"];
            isOneToOne: false;
            referencedRelation: "breeds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goats_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_payments: {
        Row: {
          amount: number;
          booking_id: string | null;
          created_at: string;
          currency: string;
          farm_id: string | null;
          goat_id: string | null;
          id: string;
          metadata: Json | null;
          payer_id: string | null;
          payment_date: string | null;
          payment_gateway_ref: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          payment_type: Database["public"]["Enums"]["payment_type"];
          receipt_number: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          booking_id?: string | null;
          created_at?: string;
          currency?: string;
          farm_id?: string | null;
          goat_id?: string | null;
          id?: string;
          metadata?: Json | null;
          payer_id?: string | null;
          payment_date?: string | null;
          payment_gateway_ref?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          payment_type: Database["public"]["Enums"]["payment_type"];
          receipt_number?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          booking_id?: string | null;
          created_at?: string;
          currency?: string;
          farm_id?: string | null;
          goat_id?: string | null;
          id?: string;
          metadata?: Json | null;
          payer_id?: string | null;
          payment_date?: string | null;
          payment_gateway_ref?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          payment_type?: Database["public"]["Enums"]["payment_type"];
          receipt_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_payments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_payments_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_payments_goat_id_fkey";
            columns: ["goat_id"];
            isOneToOne: false;
            referencedRelation: "goats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_payments_payer_id_fkey";
            columns: ["payer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          event_key: string | null;
          id: string;
          is_read: boolean;
          link_id: string | null;
          link_type: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          event_key?: string | null;
          id?: string;
          is_read?: boolean;
          link_id?: string | null;
          link_type?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          event_key?: string | null;
          id?: string;
          is_read?: boolean;
          link_id?: string | null;
          link_type?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          farm_id: string | null;
          full_name: string;
          id: string;
          is_suspended: boolean | null;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          farm_id?: string | null;
          full_name: string;
          id: string;
          is_suspended?: boolean | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          farm_id?: string | null;
          full_name?: string;
          id?: string;
          is_suspended?: boolean | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_profiles_farm";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          reason: string;
          reporter_id: string | null;
          resolution_notes: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["report_status"];
          target_id: string;
          target_type: Database["public"]["Enums"]["report_target_type"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          reason: string;
          reporter_id?: string | null;
          resolution_notes?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          target_id: string;
          target_type: Database["public"]["Enums"]["report_target_type"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          reason?: string;
          reporter_id?: string | null;
          resolution_notes?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          target_id?: string;
          target_type?: Database["public"]["Enums"]["report_target_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          booking_id: string;
          comment: string;
          created_at: string;
          customer_id: string | null;
          farm_id: string;
          goat_id: string;
          id: string;
          is_approved: boolean;
          is_verified_purchase: boolean;
          rating: number;
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          comment: string;
          created_at?: string;
          customer_id?: string | null;
          farm_id: string;
          goat_id: string;
          id?: string;
          is_approved?: boolean;
          is_verified_purchase?: boolean;
          rating: number;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          comment?: string;
          created_at?: string;
          customer_id?: string | null;
          farm_id?: string;
          goat_id?: string;
          id?: string;
          is_approved?: boolean;
          is_verified_purchase?: boolean;
          rating?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_goat_id_fkey";
            columns: ["goat_id"];
            isOneToOne: false;
            referencedRelation: "goats";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlist: {
        Row: {
          created_at: string;
          goat_id: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          goat_id: string;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          goat_id?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_goat_id_fkey";
            columns: ["goat_id"];
            isOneToOne: false;
            referencedRelation: "goats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      can_access_storage_farm_path: {
        Args: { object_name: string };
        Returns: boolean;
      };
      can_modify_storage_goat_image: {
        Args: { object_name: string };
        Returns: boolean;
      };
      create_booking_hold: {
        Args: { p_goat_id: string; p_notes?: string; p_customer_id?: string };
        Returns: Json;
      };
      create_goat_booking_atomic: {
        Args: { p_goat_id: string; p_customer_id?: string; p_notes?: string };
        Returns: Json;
      };
      delete_goat_listing_secure: {
        Args: { p_goat_id: string };
        Returns: Json;
      };
      expire_overdue_bookings: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_auth_farm_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_auth_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      verify_listing_payment_atomic: {
        Args: {
          p_goat_id: string;
          p_order_id: string;
          p_payment_id: string;
          p_signature: string;
          p_amount?: number;
          p_verified_by?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      booking_status:
        | "PENDING"
        | "RESERVED"
        | "CONFIRMED"
        | "CANCELLED"
        | "EXPIRED"
        | "COMPLETED";
      farm_status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
      goat_gender: "MALE" | "FEMALE" | "CASTRATED";
      goat_purpose: "BREEDING" | "MEAT" | "MILK" | "SHOW" | "PET";
      goat_status:
        | "AVAILABLE"
        | "RESERVED"
        | "BOOKING_PENDING"
        | "CONFIRMED"
        | "SOLD"
        | "COMPLETED"
        | "INACTIVE";
      payment_status: "INITIATED" | "COMPLETED" | "FAILED" | "REFUNDED";
      payment_type:
        | "LISTING_FEE"
        | "BOOKING_DEPOSIT"
        | "FULL_PAYMENT"
        | "SUBSCRIPTION";
      report_status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
      report_target_type: "GOAT" | "FARM" | "REVIEW" | "USER";
      user_role: "SUPER_ADMIN" | "FARM_ADMIN" | "CUSTOMER";
    };
  };
};
