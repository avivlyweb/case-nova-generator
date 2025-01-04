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
      case_studies: {
        Row: {
          adl_problem: string | null
          age: number
          ai_role: string | null
          comorbidities: string | null
          condition: string | null
          created_at: string
          date: string
          gender: string
          id: string
          medical_history: string | null
          patient_background: string | null
          patient_name: string
          presenting_complaint: string | null
          psychosocial_factors: string | null
          specialization: string | null
          user_id: string | null
        }
        Insert: {
          adl_problem?: string | null
          age: number
          ai_role?: string | null
          comorbidities?: string | null
          condition?: string | null
          created_at?: string
          date: string
          gender: string
          id?: string
          medical_history?: string | null
          patient_background?: string | null
          patient_name: string
          presenting_complaint?: string | null
          psychosocial_factors?: string | null
          specialization?: string | null
          user_id?: string | null
        }
        Update: {
          adl_problem?: string | null
          age?: number
          ai_role?: string | null
          comorbidities?: string | null
          condition?: string | null
          created_at?: string
          date?: string
          gender?: string
          id?: string
          medical_history?: string | null
          patient_background?: string | null
          patient_name?: string
          presenting_complaint?: string | null
          psychosocial_factors?: string | null
          specialization?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ICF: {
        Row: {
          Activity_Description: string
          ICF_Categories: string
          ICF_Code: string
          Property: string
          Question: string
          Question_Alternative: string
          Row_ID: string
          Scale: string
          Scale_Type: string
        }
        Insert: {
          Activity_Description: string
          ICF_Categories: string
          ICF_Code: string
          Property: string
          Question: string
          Question_Alternative: string
          Row_ID: string
          Scale: string
          Scale_Type: string
        }
        Update: {
          Activity_Description?: string
          ICF_Categories?: string
          ICF_Code?: string
          Property?: string
          Question?: string
          Question_Alternative?: string
          Row_ID?: string
          Scale?: string
          Scale_Type?: string
        }
        Relationships: []
      }
      icf_codes: {
        Row: {
          activity_description: string
          icf_categories: string
          icf_code: string
          property: string
          question: string
          question_alternative: string
          row_id: number
          scale: string
          scale_type: string
        }
        Insert: {
          activity_description: string
          icf_categories: string
          icf_code: string
          property: string
          question: string
          question_alternative: string
          row_id: number
          scale: string
          scale_type: string
        }
        Update: {
          activity_description?: string
          icf_categories?: string
          icf_code?: string
          property?: string
          question?: string
          question_alternative?: string
          row_id?: number
          scale?: string
          scale_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      scale_type: "difficulty" | "intensity" | "frequency" | "facbar"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
