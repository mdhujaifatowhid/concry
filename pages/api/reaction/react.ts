
import { supabase } from "@/lib/supabase";
export default async function handler(req,res){
  const {confession_id,type,ip}=req.body;
  await supabase.from("reactions").insert([{confession_id,type,ip_hash:ip}]);
  res.json({ok:true});
}
