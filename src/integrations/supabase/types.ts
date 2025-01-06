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
          ai_analysis: string | null
          ai_role: string | null
          assessment_findings: string | null
          comorbidities: string | null
          condition: string | null
          created_at: string
          date: string
          gender: string
          generated_sections: Json | null
          icf_codes: Json | null
          id: string
          intervention_plan: string | null
          medical_entities: Json | null
          medical_history: string | null
          medications: Json | null
          patient_background: string | null
          patient_name: string
          presenting_complaint: string | null
          psychosocial_factors: string | null
          reference_list: string | null
          smart_goals: Json | null
          specialization: string | null
          user_id: string | null
        }
        Insert: {
          adl_problem?: string | null
          age: number
          ai_analysis?: string | null
          ai_role?: string | null
          assessment_findings?: string | null
          comorbidities?: string | null
          condition?: string | null
          created_at?: string
          date: string
          gender: string
          generated_sections?: Json | null
          icf_codes?: Json | null
          id?: string
          intervention_plan?: string | null
          medical_entities?: Json | null
          medical_history?: string | null
          medications?: Json | null
          patient_background?: string | null
          patient_name: string
          presenting_complaint?: string | null
          psychosocial_factors?: string | null
          reference_list?: string | null
          smart_goals?: Json | null
          specialization?: string | null
          user_id?: string | null
        }
        Update: {
          adl_problem?: string | null
          age?: number
          ai_analysis?: string | null
          ai_role?: string | null
          assessment_findings?: string | null
          comorbidities?: string | null
          condition?: string | null
          created_at?: string
          date?: string
          gender?: string
          generated_sections?: Json | null
          icf_codes?: Json | null
          id?: string
          intervention_plan?: string | null
          medical_entities?: Json | null
          medical_history?: string | null
          medications?: Json | null
          patient_background?: string | null
          patient_name?: string
          presenting_complaint?: string | null
          psychosocial_factors?: string | null
          reference_list?: string | null
          smart_goals?: Json | null
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
      lifestyle_tips: {
        Row: {
          actionable_tips: Json
          category: string
          content_embedding: string | null
          created_at: string
          description: string
          fts: unknown | null
          id: string
          relevance_to_vision: string
          title: string
        }
        Insert: {
          actionable_tips: Json
          category: string
          content_embedding?: string | null
          created_at?: string
          description: string
          fts?: unknown | null
          id?: string
          relevance_to_vision: string
          title: string
        }
        Update: {
          actionable_tips?: Json
          category?: string
          content_embedding?: string | null
          created_at?: string
          description?: string
          fts?: unknown | null
          id?: string
          relevance_to_vision?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      search_lifestyle_tips:
        | {
            Args: {
              query_text: string
              match_count?: number
              similarity_threshold?: number
            }
            Returns: {
              id: string
              category: string
              title: string
              description: string
              actionable_tips: Json
              relevance_to_vision: string
              similarity: number
            }[]
          }
        | {
            Args: {
              query_text: string
              query_embedding: string
              match_count?: number
              similarity_threshold?: number
            }
            Returns: {
              id: string
              category: string
              title: string
              description: string
              actionable_tips: Json
              relevance_to_vision: string
              similarity: number
            }[]
          }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
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
