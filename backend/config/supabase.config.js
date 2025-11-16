import dotenv from 'dotenv';
dotenv.config();
import {createClient} from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`url:${url}\nkey:${key}`);


export const supabase =  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);



