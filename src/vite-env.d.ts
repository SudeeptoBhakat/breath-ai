/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WAQI_TOKEN?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly GROQ_LLM_API_KEY?: string;
  readonly VITE_OLLAMA_API_KEY?: string;
  readonly OLLAMA_API_KEY?: string;
  readonly VITE_OLLAMA_BASE_URL?: string;
  readonly OLLAMA_BASE_URL?: string;
  readonly VITE_OLLAMA_MODEL?: string;
  readonly OLLAMA_MODEL?: string;
  readonly VITE_LLAMA_API_KEY?: string;
  readonly VITE_LLAMA_BASE_URL?: string;
  readonly VITE_LLAMA_MODEL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
