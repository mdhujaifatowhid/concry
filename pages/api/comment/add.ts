
import { supabase } from "@/lib/supabase";
export default async function handler(req,res){
  const {confession_id,type,name,text}=req.body;
  await supabase.from("comments").insert([{confession_id,type,name,text}]);
  res.json({ok:true});
}
