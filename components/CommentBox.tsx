
"use client";
import { useState } from "react";
export default function CommentBox({id,type}){
  const [text,setText]=useState("");
  const submit=async()=>{
    await fetch("/api/comment/add",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({confession_id:id,type,name:"anon",text})});
    location.reload();
  };
  return (
    <div>
      <input placeholder={"Write "+type} onChange={e=>setText(e.target.value)}/>
      <button className="btn btn-black" onClick={submit}>Post</button>
    </div>
  )
}
