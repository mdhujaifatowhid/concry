
export default function CommentList({comments,type}){
  return (
    <div>
      <h3>{type}</h3>
      {comments.filter(c=>c.type===type).map(c=>(
        <div key={c.id} className="card">
          <p>{c.text}</p>
          <small>{c.name}</small>
        </div>
      ))}
    </div>
  )
}
