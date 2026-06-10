import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxvsjrnylbpkmqarzlbu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4dnNqcm55bGJwa21xYXJ6bGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTEzNTksImV4cCI6MjA5NjY2NzM1OX0.KaXIdHE_aT1jZTAMzRpZxXCHfnMZnCKX7Vkf3fAIKM8'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
