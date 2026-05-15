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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean | null
          service_id: string
          service_type: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean | null
          service_id: string
          service_type: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean | null
          service_id?: string
          service_type?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          client_id: string
          created_at: string
          end_date: string
          id: string
          notes: string | null
          provider_id: string
          service_id: string
          service_type: string
          start_date: string
          status: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          provider_id: string
          service_id: string
          service_type: string
          start_date: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          provider_id?: string
          service_id?: string
          service_type?: string
          start_date?: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      crew_profiles: {
        Row: {
          bio: string | null
          created_at: string
          daily_rate: number | null
          experience_years: number | null
          featured: boolean | null
          id: string
          portfolio_urls: string[] | null
          role: string
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          daily_rate?: number | null
          experience_years?: number | null
          featured?: boolean | null
          id?: string
          portfolio_urls?: string[] | null
          role?: string
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          daily_rate?: number | null
          experience_years?: number | null
          featured?: boolean | null
          id?: string
          portfolio_urls?: string[] | null
          role?: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          brand: string | null
          category: string | null
          condition: string | null
          created_at: string
          daily_rate: number | null
          description: string | null
          id: string
          images: string[] | null
          model: string | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          daily_rate?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          model?: string | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          daily_rate?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          model?: string | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equipment_condition_logs: {
        Row: {
          booking_id: string | null
          condition_notes: string | null
          created_at: string
          equipment_id: string
          id: string
          log_type: string
          logged_by: string
          photos: string[] | null
        }
        Insert: {
          booking_id?: string | null
          condition_notes?: string | null
          created_at?: string
          equipment_id: string
          id?: string
          log_type?: string
          logged_by: string
          photos?: string[] | null
        }
        Update: {
          booking_id?: string | null
          condition_notes?: string | null
          created_at?: string
          equipment_id?: string
          id?: string
          log_type?: string
          logged_by?: string
          photos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_condition_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_condition_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          price_per_day: number | null
          price_per_hour: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price_per_day?: number | null
          price_per_hour?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_per_day?: number | null
          price_per_hour?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          daily_rate: number | null
          experience_years: number | null
          featured: boolean | null
          gender: string | null
          height: number | null
          hourly_rate: number | null
          id: string
          portfolio_urls: string[] | null
          profile_type: string
          skills: string[] | null
          skin_tone: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          daily_rate?: number | null
          experience_years?: number | null
          featured?: boolean | null
          gender?: string | null
          height?: number | null
          hourly_rate?: number | null
          id?: string
          portfolio_urls?: string[] | null
          profile_type?: string
          skills?: string[] | null
          skin_tone?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          daily_rate?: number | null
          experience_years?: number | null
          featured?: boolean | null
          gender?: string | null
          height?: number | null
          hourly_rate?: number | null
          id?: string
          portfolio_urls?: string[] | null
          profile_type?: string
          skills?: string[] | null
          skin_tone?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "client"
        | "location_owner"
        | "equipment_provider"
        | "model"
        | "crew"
        | "admin"
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
      app_role: [
        "client",
        "location_owner",
        "equipment_provider",
        "model",
        "crew",
        "admin",
      ],
    },
  },
} as const
