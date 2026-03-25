"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function Create() {
  const [text, setText] = useState("");

  const submit = async () => {
    const res = await fetch("/api/confession/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: text,
        allow_help: true,
        allow_humiliate: true,
      }),
    });

    const data = await res.json();
    window.location.href = data.publicUrl;
  };

  return (
    <>
      <Navbar />

      <textarea
        className="input"
        rows={5}
        placeholder="Say something..."
        onChange={(e) => setText(e.target.value)}
      />

      <button className="btn btn-black" onClick={submit}>
        Post
      </button>
    </>
  );
}
