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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          active: boolean
          click_count: number
          created_at: string
          cta_label: string
          description: string | null
          geo_restrict: string[] | null
          id: string
          image_url: string | null
          league_slug: string | null
          network: string
          placement: string
          priority: number
          sport: string | null
          team_slug: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          click_count?: number
          created_at?: string
          cta_label?: string
          description?: string | null
          geo_restrict?: string[] | null
          id?: string
          image_url?: string | null
          league_slug?: string | null
          network: string
          placement?: string
          priority?: number
          sport?: string | null
          team_slug?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          click_count?: number
          created_at?: string
          cta_label?: string
          description?: string | null
          geo_restrict?: string[] | null
          id?: string
          image_url?: string | null
          league_slug?: string | null
          network?: string
          placement?: string
          priority?: number
          sport?: string | null
          team_slug?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      ai_faqs: {
        Row: {
          entity_name: string | null
          entity_slug: string
          entity_type: string
          faqs: Json
          generated_at: string
          id: string
          model: string | null
          prompt_version: number
          updated_at: string
        }
        Insert: {
          entity_name?: string | null
          entity_slug: string
          entity_type: string
          faqs: Json
          generated_at?: string
          id?: string
          model?: string | null
          prompt_version?: number
          updated_at?: string
        }
        Update: {
          entity_name?: string | null
          entity_slug?: string
          entity_type?: string
          faqs?: Json
          generated_at?: string
          id?: string
          model?: string | null
          prompt_version?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          body: string
          created_at: string
          email: string
          id: string
          name: string
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          body: string
          created_at?: string
          email: string
          id?: string
          name: string
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      digest_runs: {
        Row: {
          created_at: string
          error: string | null
          html: string
          id: string
          recipient_count: number
          sent_at: string | null
          sent_count: number
          status: string
          story_count: number
          subject: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          html: string
          id?: string
          recipient_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          story_count?: number
          subject: string
        }
        Update: {
          created_at?: string
          error?: string | null
          html?: string
          id?: string
          recipient_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          story_count?: number
          subject?: string
        }
        Relationships: []
      }
      match_comments: {
        Row: {
          body: string
          created_at: string
          hidden: boolean
          id: string
          match_id: number
          sport: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          hidden?: boolean
          id?: string
          match_id: number
          sport?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          hidden?: boolean
          id?: string
          match_id?: number
          sport?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_predictions: {
        Row: {
          away_score: number
          created_at: string
          home_score: number
          id: string
          match_id: number
          points: number
          settled: boolean
          sport: string
          updated_at: string
          user_id: string
        }
        Insert: {
          away_score: number
          created_at?: string
          home_score: number
          id?: string
          match_id: number
          points?: number
          settled?: boolean
          sport?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          away_score?: number
          created_at?: string
          home_score?: number
          id?: string
          match_id?: number
          points?: number
          settled?: boolean
          sport?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          granted_by: string | null
          note: string | null
          premium_until: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          note?: string | null
          premium_until?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          note?: string | null
          premium_until?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consent_marketing: boolean
          created_at: string
          email: string
          id: string
          last_sent_at: string | null
          source: string | null
          status: string
          unsubscribe_token: string
        }
        Insert: {
          consent_marketing?: boolean
          created_at?: string
          email: string
          id?: string
          last_sent_at?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string
        }
        Update: {
          consent_marketing?: boolean
          created_at?: string
          email?: string
          id?: string
          last_sent_at?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          created_at: string
          handle: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          handle: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          handle?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_gsc_daily: {
        Row: {
          clicks: number
          created_at: string
          ctr: number
          date: string
          id: number
          impressions: number
          page: string
          position: number
          query: string
        }
        Insert: {
          clicks?: number
          created_at?: string
          ctr?: number
          date: string
          id?: number
          impressions?: number
          page: string
          position?: number
          query?: string
        }
        Update: {
          clicks?: number
          created_at?: string
          ctr?: number
          date?: string
          id?: number
          impressions?: number
          page?: string
          position?: number
          query?: string
        }
        Relationships: []
      }
      seo_sync_runs: {
        Row: {
          date_range_end: string | null
          date_range_start: string | null
          error: string | null
          finished_at: string | null
          id: number
          rows_written: number
          started_at: string
          status: string
        }
        Insert: {
          date_range_end?: string | null
          date_range_start?: string | null
          error?: string | null
          finished_at?: string | null
          id?: number
          rows_written?: number
          started_at?: string
          status?: string
        }
        Update: {
          date_range_end?: string | null
          date_range_start?: string | null
          error?: string | null
          finished_at?: string | null
          id?: number
          rows_written?: number
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sponsored_slots: {
        Row: {
          active: boolean
          clicks: number
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          impressions: number
          priority: number
          ref_id: string | null
          slot_type: string
          sponsor_logo_url: string | null
          sponsor_name: string
          sport: string | null
          starts_at: string
          target_url: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          clicks?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          priority?: number
          ref_id?: string | null
          slot_type: string
          sponsor_logo_url?: string | null
          sponsor_name: string
          sport?: string | null
          starts_at?: string
          target_url: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          clicks?: number
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          priority?: number
          ref_id?: string | null
          slot_type?: string
          sponsor_logo_url?: string | null
          sponsor_name?: string
          sport?: string | null
          starts_at?: string
          target_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wc_groups: {
        Row: {
          created_at: string
          drawn: number | null
          goals_against: number | null
          goals_for: number | null
          group_name: string
          id: number
          lost: number | null
          played: number | null
          points: number | null
          position: number | null
          qualified: boolean | null
          team: string
          tournament_year: number
          updated_at: string
          won: number | null
        }
        Insert: {
          created_at?: string
          drawn?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_name: string
          id?: number
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          qualified?: boolean | null
          team: string
          tournament_year: number
          updated_at?: string
          won?: number | null
        }
        Update: {
          created_at?: string
          drawn?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_name?: string
          id?: number
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          qualified?: boolean | null
          team?: string
          tournament_year?: number
          updated_at?: string
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_groups_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_matches: {
        Row: {
          away_score: number | null
          away_score_pen: number | null
          away_team: string
          city: string | null
          created_at: string
          home_score: number | null
          home_score_pen: number | null
          home_team: string
          id: number
          match_date: string | null
          match_number: number | null
          round: string
          stadium: string | null
          tournament_year: number
          updated_at: string
          video_url: string | null
        }
        Insert: {
          away_score?: number | null
          away_score_pen?: number | null
          away_team: string
          city?: string | null
          created_at?: string
          home_score?: number | null
          home_score_pen?: number | null
          home_team: string
          id?: number
          match_date?: string | null
          match_number?: number | null
          round: string
          stadium?: string | null
          tournament_year: number
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          away_score?: number | null
          away_score_pen?: number | null
          away_team?: string
          city?: string | null
          created_at?: string
          home_score?: number | null
          home_score_pen?: number | null
          home_team?: string
          id?: number
          match_date?: string | null
          match_number?: number | null
          round?: string
          stadium?: string | null
          tournament_year?: number
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wc_matches_tournament_year_fkey"
            columns: ["tournament_year"]
            isOneToOne: false
            referencedRelation: "wc_tournaments"
            referencedColumns: ["year"]
          },
        ]
      }
      wc_tournaments: {
        Row: {
          champion: string | null
          created_at: string
          fourth_place: string | null
          host_country: string | null
          runner_up: string | null
          third_place: string | null
          updated_at: string
          year: number
        }
        Insert: {
          champion?: string | null
          created_at?: string
          fourth_place?: string | null
          host_country?: string | null
          runner_up?: string | null
          third_place?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          champion?: string | null
          created_at?: string
          fourth_place?: string | null
          host_country?: string | null
          runner_up?: string | null
          third_place?: string | null
          updated_at?: string
          year?: number
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
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
