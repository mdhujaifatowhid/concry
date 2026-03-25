
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import ReactionBar from "@/components/ReactionBar";
import CommentBox from "@/components/CommentBox";
import CommentList from "@/components/CommentList";

export default async function Page({params}){
  const {data}=await supabase.from("confessions").select("*").eq("id",params.id).single();
  const {data:rx}=await supabase.from("reactions").select("*").eq("confession_id",params.id);
  const {data:comments}=await supabase.from("comments").select("*").eq("confession_id",params.id);

  const help=rx?.filter(r=>r.type==="help").length||0;
  const hum=rx?.filter(r=>r.type==="humiliate").length||0;

  return (
    <>
      <Navbar/>
      <div className="card">
        <p>{data?.content}</p>
        <ReactionBar help={help} humiliate={hum}/>
      </div>

      <button className="btn btn-green">Help</button>
      <button className="btn btn-red">Humiliate</button>

      <CommentBox id={params.id} type="help"/>
      <CommentBox id={params.id} type="humiliate"/>

      <CommentList comments={comments||[]} type="help"/>
      <CommentList comments={comments||[]} type="humiliate"/>
    </>
  )
}
