
import Link from "next/link";
export default function Navbar(){
  return (
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
      <Link href="/">confess</Link>
      <Link href="/create">+ create</Link>
    </div>
  )
}
