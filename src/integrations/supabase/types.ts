export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      article_subscriptions: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          subscribed: boolean | null
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          subscribed?: boolean | null
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          subscribed?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "secure_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "secure_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      media_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          media_id: string
          reason: string
          reporter_identifier: string | null
          reporter_user_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          media_id: string
          reason: string
          reporter_identifier?: string | null
          reporter_user_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          media_id?: string
          reason?: string
          reporter_identifier?: string | null
          reporter_user_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_reports_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "supporter_media"
            referencedColumns: ["id"]
          },
        ]
      }
      media_votes: {
        Row: {
          created_at: string
          id: string
          media_id: string
          user_id: string | null
          user_identifier: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          user_id?: string | null
          user_identifier?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string | null
          user_identifier?: string | null
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_votes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "supporter_media"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          comment_mentions: boolean | null
          comment_replies: boolean | null
          created_at: string
          email: string
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment_mentions?: boolean | null
          comment_replies?: boolean | null
          created_at?: string
          email: string
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment_mentions?: boolean | null
          comment_replies?: boolean | null
          created_at?: string
          email?: string
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          email_comment_replies: boolean | null
          email_new_comments: boolean | null
          id: string
          in_app_notifications: boolean | null
          push_comment_replies: boolean | null
          push_new_comments: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_comment_replies?: boolean | null
          email_new_comments?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          push_comment_replies?: boolean | null
          push_new_comments?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_comment_replies?: boolean | null
          email_new_comments?: boolean | null
          id?: string
          in_app_notifications?: boolean | null
          push_comment_replies?: boolean | null
          push_new_comments?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          article_id: string | null
          created_at: string
          description: string | null
          icon: string
          id: string
          match_id: string | null
          read: boolean
          social_media_url: string | null
          thumbnail_url: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          match_id?: string | null
          read?: boolean
          social_media_url?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          match_id?: string | null
          read?: boolean
          social_media_url?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      processed_articles: {
        Row: {
          article_id: number
          article_title: string
          article_url: string | null
          id: string
          processed_at: string
        }
        Insert: {
          article_id: number
          article_title: string
          article_url?: string | null
          id?: string
          processed_at?: string
        }
        Update: {
          article_id?: number
          article_title?: string
          article_url?: string | null
          id?: string
          processed_at?: string
        }
        Relationships: []
      }
      secure_comments: {
        Row: {
          article_id: string
          content: string
          content_html: string | null
          created_at: string | null
          depth: number | null
          dislikes_count: number | null
          edit_count: number | null
          hidden_reason: string | null
          id: string
          is_approved: boolean | null
          is_edited: boolean | null
          is_hidden: boolean | null
          is_pinned: boolean | null
          last_edited_at: string | null
          likes_count: number | null
          parent_id: string | null
          reply_count: number | null
          reports_count: number | null
          spam_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          content_html?: string | null
          created_at?: string | null
          depth?: number | null
          dislikes_count?: number | null
          edit_count?: number | null
          hidden_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_edited?: boolean | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          last_edited_at?: string | null
          likes_count?: number | null
          parent_id?: string | null
          reply_count?: number | null
          reports_count?: number | null
          spam_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          content_html?: string | null
          created_at?: string | null
          depth?: number | null
          dislikes_count?: number | null
          edit_count?: number | null
          hidden_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_edited?: boolean | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          last_edited_at?: string | null
          likes_count?: number | null
          parent_id?: string | null
          reply_count?: number | null
          reports_count?: number | null
          spam_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "secure_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_notifications: {
        Row: {
          article_id: string | null
          comment_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "secure_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      supporter_media: {
        Row: {
          caption: string | null
          created_at: string
          file_size: number
          file_type: string
          file_url: string
          filename: string
          hashtags: string[] | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          original_filename: string
          reports_count: number | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          votes_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_size: number
          file_type: string
          file_url: string
          filename: string
          hashtags?: string[] | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          original_filename: string
          reports_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          votes_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_size?: number
          file_type?: string
          file_url?: string
          filename?: string
          hashtags?: string[] | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          original_filename?: string
          reports_count?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          votes_count?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_created_at: string | null
          avatar_url: string | null
          ban_reason: string | null
          banned_until: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_banned: boolean | null
          is_verified: boolean | null
          last_active_at: string | null
          last_warning_at: string | null
          reputation: number | null
          updated_at: string | null
          user_id: string
          username: string
          warning_count: number | null
        }
        Insert: {
          account_created_at?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_banned?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          last_warning_at?: string | null
          reputation?: number | null
          updated_at?: string | null
          user_id: string
          username: string
          warning_count?: number | null
        }
        Update: {
          account_created_at?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_banned?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          last_warning_at?: string | null
          reputation?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
          warning_count?: number | null
        }
        Relationships: []
      }
      user_rate_limits: {
        Row: {
          action_count: number | null
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_count?: number | null
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_count?: number | null
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_ip_address: unknown
          p_action_type: string
          p_max_actions: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      record_rate_limit_action: {
        Args: {
          p_user_id: string
          p_ip_address: unknown
          p_action_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
