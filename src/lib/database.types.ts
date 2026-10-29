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
      device_tokens: {
        Row: {
          id: string;
          user_id: string;
          expo_push_token: string;
          platform: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expo_push_token: string;
          platform?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          expo_push_token?: string;
          platform?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'device_tokens_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      order_stock_ledger: {
        Row: {
          order_id: string;
          product_id: string;
          quantity: number;
        };
        Insert: {
          order_id: string;
          product_id: string;
          quantity: number;
        };
        Update: {
          order_id?: string;
          product_id?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_stock_ledger_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_stock_ledger_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          zip_code: string;
          street: string;
          number: string;
          complement: string;
          neighborhood: string;
          city: string;
          state: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          zip_code: string;
          street: string;
          number: string;
          complement?: string;
          neighborhood: string;
          city: string;
          state: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          zip_code?: string;
          street?: string;
          number?: string;
          complement?: string;
          neighborhood?: string;
          city?: string;
          state?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'addresses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          role: 'customer' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          role?: 'customer' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          role?: 'customer' | 'admin';
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          visual: string;
        };
        Insert: {
          id: string;
          name: string;
          visual: string;
        };
        Update: {
          id?: string;
          name?: string;
          visual?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string;
          unit_label: string;
          price_cents: number;
          stock_quantity: number;
          is_featured: boolean;
          visual: string;
          image_url: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string;
          unit_label: string;
          price_cents: number;
          stock_quantity?: number;
          is_featured?: boolean;
          visual: string;
          image_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          unit_label?: string;
          price_cents?: number;
          stock_quantity?: number;
          is_featured?: boolean;
          visual?: string;
          image_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      baskets: {
        Row: {
          id: string;
          name: string;
          description: string;
          price_cents: number;
          image_url: string;
          is_active: boolean;
        };
        Insert: {
          id: string;
          name: string;
          description?: string;
          price_cents: number;
          image_url?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price_cents?: number;
          image_url?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      basket_components: {
        Row: {
          basket_id: string;
          product_id: string;
          quantity: number;
        };
        Insert: {
          basket_id: string;
          product_id: string;
          quantity: number;
        };
        Update: {
          basket_id?: string;
          product_id?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'basket_components_basket_id_fkey';
            columns: ['basket_id'];
            isOneToOne: false;
            referencedRelation: 'baskets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'basket_components_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          code: string;
          user_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          status: 'awaiting_pickup' | 'ready_for_pickup' | 'completed' | 'cancelled';
          subtotal_cents: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          user_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          status?: 'awaiting_pickup' | 'ready_for_pickup' | 'completed' | 'cancelled';
          subtotal_cents: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          user_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          status?: 'awaiting_pickup' | 'ready_for_pickup' | 'completed' | 'cancelled';
          subtotal_cents?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_ref: string;
          kind: 'product' | 'basket';
          name: string;
          unit_label: string;
          quantity: number;
          unit_price_cents: number;
          line_total_cents: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          item_ref: string;
          kind: 'product' | 'basket';
          name: string;
          unit_label: string;
          quantity: number;
          unit_price_cents: number;
          line_total_cents: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          item_ref?: string;
          kind?: 'product' | 'basket';
          name?: string;
          unit_label?: string;
          quantity?: number;
          unit_price_cents?: number;
          line_total_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      place_order: {
        Args: {
          p_items: Json;
          p_notes?: string | null;
        };
        Returns: Json;
      };
      cancel_order: {
        Args: {
          p_order_id: string;
        };
        Returns: Json;
      };
      adjust_stock: {
        Args: {
          p_adjustments: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: 'customer' | 'admin';
      order_status: 'awaiting_pickup' | 'ready_for_pickup' | 'completed' | 'cancelled';
      cart_item_kind: 'product' | 'basket';
    };
    CompositeTypes: Record<string, never>;
  };
};
