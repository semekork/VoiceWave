import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbuzvbqxasscjhquvias.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtidXp2YnF4YXNzY2pocXV2aWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDQwMDEsImV4cCI6MjA2NDgyMDAwMX0.uUaxzHSLQD7PMxu80imKnu4__Ybw7M64-zTEk8dF1iA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
