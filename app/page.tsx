import { supabase } from "../lib/supabase";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default async function Home() {
  const { data } = await supabase
    .from("confessions")
    .select("*")
    .limit(20);

  return (
    <>
      <Navbar />

      {data?.map((c) => (
        <Link key={c.id} href={`/c/${c.id}`}>
          <div className="card">{c.content}</div>
        </Link>
      ))}
    </>
  );
}
