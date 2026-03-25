
"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function Create(){
  const [text,setText]=useState("");
  const submit=async()=>{
    const res=await fetch("/api/confession/create",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({content:text,allow_help:true,allow_humiliate:true})});
    const d=await res.json();
    window.location.href=d.publicUrl;
  };
  return (
    <>
      <Navbar/>
      <textarea rows={5} onChange={e=>setText(e.target.value)}></textarea>
      <button className="btn btn-black" onClick={submit}>Post</button>
    </>
  )
}
