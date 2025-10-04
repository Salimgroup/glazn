export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bounty_contributions: {
        Row: {
          amount: number
          contributor_id: string
          created_at: string | null
          id: string
          message: string | null
          request_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          contributor_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          request_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contributor_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          request_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bounty_contributions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "content_creator_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bounty_contributions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bounty_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bounty_reactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "content_creator_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bounty_reactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bounty_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string
          crypto_wallet_address: string | null
          fee_amount: number
          id: string
          net_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_wallet_address?: string | null
          fee_amount: number
          id?: string
          net_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_wallet_address?: string | null
          fee_amount?: number
          id?: string
          net_amount?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bounties_completed: number | null
          bounties_posted: number | null
          created_at: string | null
          creator_platforms: string[] | null
          display_name: string | null
          id: string
          is_content_creator: boolean | null
          portfolio_url: string | null
          reputation_score: number | null
          success_rate: number | null
          total_earnings: number | null
          total_spent: number | null
          updated_at: string | null
          username: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bounties_completed?: number | null
          bounties_posted?: number | null
          created_at?: string | null
          creator_platforms?: string[] | null
          display_name?: string | null
          id: string
          is_content_creator?: boolean | null
          portfolio_url?: string | null
          reputation_score?: number | null
          success_rate?: number | null
          total_earnings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bounties_completed?: number | null
          bounties_posted?: number | null
          created_at?: string | null
          creator_platforms?: string[] | null
          display_name?: string | null
          id?: string
          is_content_creator?: boolean | null
          portfolio_url?: string | null
          reputation_score?: number | null
          success_rate?: number | null
          total_earnings?: number | null
          total_spent?: number | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          allow_contributions: boolean | null
          bounty: number
          category: string
          content_creator_id: string | null
          created_at: string | null
          deadline: string
          description: string
          featured: boolean | null
          id: string
          is_anonymous: boolean | null
          is_system_generated: boolean | null
          minimum_contribution: number | null
          platform: string | null
          status: string | null
          title: string
          trending_score: number | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          allow_contributions?: boolean | null
          bounty: number
          category: string
          content_creator_id?: string | null
          created_at?: string | null
          deadline: string
          description: string
          featured?: boolean | null
          id?: string
          is_anonymous?: boolean | null
          is_system_generated?: boolean | null
          minimum_contribution?: number | null
          platform?: string | null
          status?: string | null
          title: string
          trending_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          allow_contributions?: boolean | null
          bounty?: number
          category?: string
          content_creator_id?: string | null
          created_at?: string | null
          deadline?: string
          description?: string
          featured?: boolean | null
          id?: string
          is_anonymous?: boolean | null
          is_system_generated?: boolean | null
          minimum_contribution?: number | null
          platform?: string | null
          status?: string | null
          title?: string
          trending_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_connected_accounts: {
        Row: {
          account_status: string
          charges_enabled: boolean
          created_at: string
          details_submitted: boolean
          id: string
          payouts_enabled: boolean
          stripe_account_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          id?: string
          payouts_enabled?: boolean
          stripe_account_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          id?: string
          payouts_enabled?: boolean
          stripe_account_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          external_url: string | null
          id: string
          platform_name: string | null
          preview_notes: string | null
          rejection_reason: string | null
          request_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submission_type: Database["public"]["Enums"]["submission_type"]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          external_url?: string | null
          id?: string
          platform_name?: string | null
          preview_notes?: string | null
          rejection_reason?: string | null
          request_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_type?: Database["public"]["Enums"]["submission_type"]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          external_url?: string | null
          id?: string
          platform_name?: string | null
          preview_notes?: string | null
          rejection_reason?: string | null
          request_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_type?: Database["public"]["Enums"]["submission_type"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "content_creator_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          crypto_tx_hash: string | null
          crypto_wallet_address: string | null
          currency: string
          description: string | null
          fee_amount: number
          id: string
          metadata: Json | null
          net_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_id: string | null
          stripe_payout_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_tx_hash?: string | null
          crypto_wallet_address?: string | null
          currency?: string
          description?: string | null
          fee_amount?: number
          id?: string
          metadata?: Json | null
          net_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_id?: string | null
          stripe_payout_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_tx_hash?: string | null
          crypto_wallet_address?: string | null
          currency?: string
          description?: string | null
          fee_amount?: number
          id?: string
          metadata?: Json | null
          net_amount?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_id?: string | null
          stripe_payout_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          available_balance: number
          created_at: string
          currency: string
          id: string
          pending_balance: number
          total_deposited: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          currency?: string
          id?: string
          pending_balance?: number
          total_deposited?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          currency?: string
          id?: string
          pending_balance?: number
          total_deposited?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      content_creator_requests: {
        Row: {
          allow_contributions: boolean | null
          bounty: number | null
          category: string | null
          content_creator_id: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          featured: boolean | null
          id: string | null
          is_anonymous: boolean | null
          minimum_contribution: number | null
          platform: string | null
          requester_name: string | null
          status: string | null
          title: string | null
          trending_score: number | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      complete_payout_atomic: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      get_total_bounty: {
        Args: { request_id_param: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_deposit_atomic: {
        Args: {
          p_net_amount: number
          p_total_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      process_payout_atomic: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payment_method: "stripe" | "xrp" | "solana"
      submission_status: "pending" | "approved" | "rejected"
      submission_type: "upload" | "external_url"
      transaction_status:
        | "pending"
        | "completed"
        | "failed"
        | "cancelled"
        | "processing"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "bounty_payment"
        | "bounty_refund"
        | "bounty_earnings"
        | "service_fee"
        | "crypto_deposit"
        | "crypto_withdrawal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      payment_method: ["stripe", "xrp", "solana"],
      submission_status: ["pending", "approved", "rejected"],
      submission_type: ["upload", "external_url"],
      transaction_status: [
        "pending",
        "completed",
        "failed",
        "cancelled",
        "processing",
      ],
      transaction_type: [
        "deposit",
        "withdrawal",
        "bounty_payment",
        "bounty_refund",
        "bounty_earnings",
        "service_fee",
        "crypto_deposit",
        "crypto_withdrawal",
      ],
    },
  },
} as const
