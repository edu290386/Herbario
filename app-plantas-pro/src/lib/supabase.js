import { createClient } from "@supabase/supabase-api";

const supabaseUrl = "https://pejxmmmvreffllovzjan.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanhtbW12cmVmZmxsb3Z6amFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTQ4MzgsImV4cCI6MjA4MzU5MDgzOH0.XiZddvHzJBN8nbwEgA_BHUDyKzF0_EdFLFg-S4n5acU";

export const supabase = createClient(supabaseUrl, supabaseKey);
