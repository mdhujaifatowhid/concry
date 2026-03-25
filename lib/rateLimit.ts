
const map=new Map();
export function checkLimit(ip){
  const now=Date.now();
  const last=map.get(ip)||0;
  if(now-last<3000) throw new Error("Slow down");
  map.set(ip,now);
}
