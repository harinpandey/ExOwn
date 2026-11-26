"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, requireAdmin } from "@/lib/auth";
import ticketsPrisma from "@/lib/tickets-prisma";
import type { TicketCategory } from "@/generated/tickets-client";
const categories: TicketCategory[] = ["TRAIN","TAXI","MOVIE","SPORTS","CONCERT","CAMPUS_EVENT","OTHER"];
const textField=(v:FormDataEntryValue|null,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const httpUrl=(v:string)=>{if(!v)return null;try{const u=new URL(v);return u.protocol==="http:"||u.protocol==="https:"?u.toString():null;}catch{return null;}};

export async function createTicketListing(formData:FormData){
 const user=await requireUser();
 if(!process.env.TICKETS_DATABASE_URL)redirect("/travel/list?error=database");
 const category=textField(formData.get("category"),30) as TicketCategory;
 const title=textField(formData.get("title"),180), description=textField(formData.get("description"),2000);
 const price=Number(formData.get("price")), quantity=Number(formData.get("quantity")||1);
 const dateText=textField(formData.get("ticketDate"),30), origin=textField(formData.get("origin"),120), destination=textField(formData.get("destination"),120);
 const venue=textField(formData.get("venue"),180), seatDetails=textField(formData.get("seatDetails"),180), proofText=textField(formData.get("proofImageUrl"),500), proofImageUrl=httpUrl(proofText);
 if(!categories.includes(category)||title.length<8||description.length<20||!Number.isFinite(price)||price<0||price>1000000||!Number.isInteger(quantity)||quantity<1||quantity>20||(proofText&&!proofImageUrl))redirect("/travel/list?error=validation");
 const ticketDate=dateText?new Date(dateText):null;
 if(ticketDate&&Number.isNaN(ticketDate.getTime()))redirect("/travel/list?error=date");
 try{await ticketsPrisma.ticketListing.create({data:{sellerUid:user.uid,campusSlug:"lpu",category,title,description,price,quantity,ticketDate,origin:origin||null,destination:destination||null,venue:venue||null,seatDetails:seatDetails||null,proofImageUrl,status:"PENDING"}});}
 catch(error){console.error("[tickets] submit failed",error);redirect("/travel/list?error=save");}
 revalidatePath("/travel");revalidatePath("/travel/search");redirect("/travel/list?submitted=1");
}

export async function reviewTicketListing(formData:FormData){
 await requireAdmin();
 if(!process.env.TICKETS_DATABASE_URL)redirect("/admin/tickets?error=database");
 const id=textField(formData.get("id"),100), status=textField(formData.get("status"),20);
 if(!id||!["LIVE","REMOVED"].includes(status))redirect("/admin/tickets?error=validation");
 try{await ticketsPrisma.ticketListing.update({where:{id},data:{status:status as "LIVE"|"REMOVED"}});}
 catch(error){console.error("[tickets] review failed",error);redirect("/admin/tickets?error=save");}
 revalidatePath("/admin/tickets");revalidatePath("/travel/search");redirect("/admin/tickets?reviewed=1");
}

export async function getPublicTicketListings(filters:{type?:string;q?:string;from?:string;to?:string;date?:string}={}){
 if(!process.env.TICKETS_DATABASE_URL)return [];
 const typeMap:Record<string,TicketCategory>={train:"TRAIN",taxi:"TAXI",movie:"MOVIE",sports:"SPORTS",concert:"CONCERT",campus:"CAMPUS_EVENT",other:"OTHER"};
 const category=filters.type&&filters.type!=="all"?typeMap[filters.type]:undefined;
 if(filters.type&&filters.type!=="all"&&!category)return [];
 const q=filters.q?.trim().slice(0,100),from=filters.from?.trim().slice(0,120),to=filters.to?.trim().slice(0,120);
 const where:any={status:"LIVE",isTestRecord:false,campusSlug:"lpu"};if(category)where.category=category;
 const and:any[]=[];
 if(q)and.push({OR:["title","description","origin","destination","venue"].map(field=>({[field]:{contains:q,mode:"insensitive"}}))});
 if(from)and.push({origin:{contains:from,mode:"insensitive"}});
 if(to)and.push({destination:{contains:to,mode:"insensitive"}});
 if(and.length)where.AND=and;
 if(filters.date){const start=new Date(filters.date+"T00:00:00.000");if(!Number.isNaN(start.getTime())){const end=new Date(start);end.setDate(end.getDate()+1);where.ticketDate={gte:start,lt:end};}}
 try{return await ticketsPrisma.ticketListing.findMany({where,orderBy:[{ticketDate:"asc"},{createdAt:"desc"}],take:60,select:{id:true,category:true,title:true,description:true,price:true,quantity:true,ticketDate:true,origin:true,destination:true,venue:true,seatDetails:true,createdAt:true}});}
 catch(error){console.error("[tickets] public query failed",error);return [];}
}
