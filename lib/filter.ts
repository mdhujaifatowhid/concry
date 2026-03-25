
export function validateContent(text){
  const phone=/\b01[3-9]\d{8}\b/;
  const email=/\S+@\S+\.\S+/;
  if(phone.test(text)) throw new Error("Remove phone number");
  if(email.test(text)) throw new Error("Remove email");
  return true;
}
