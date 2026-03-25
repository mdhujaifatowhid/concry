
export default function ReactionBar({help,humiliate}){
  const total=help+humiliate||1;
  const hp=Math.round((help/total)*100);
  return (
    <div style={{marginTop:10}}>
      <div style={{display:"flex",height:8,background:"#eee",borderRadius:6,overflow:"hidden"}}>
        <div style={{width:hp+"%",background:"#86efac"}}></div>
        <div style={{width:(100-hp)+"%",background:"#fca5a5"}}></div>
      </div>
      <div style={{fontSize:12,display:"flex",justifyContent:"space-between"}}>
        <span>Help {hp}%</span>
        <span>Humiliate {100-hp}%</span>
      </div>
    </div>
  )
}
