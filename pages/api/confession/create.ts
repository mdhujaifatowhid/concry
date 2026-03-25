import { supabase } from "../../../lib/supabase";
import { nanoid } from "nanoid";
import { validateContent } from "../../../lib/filter";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { content, allow_help, allow_humiliate } = req.body;

    validateContent(content);

    const id = nanoid(6);
    const secret = nanoid(10);

    await supabase.from("confessions").insert([
      {
        id,
        content,
        allow_help,
        allow_humiliate,
        secret_key: secret,
      },
   
