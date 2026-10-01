import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if(!url){
throw new Error("SUPABASE URL missing");
}

if(!key){
throw new Error("SUPABASE KEY missing");
}

export const supabase=createClient(url,key,{
auth:{
storage:Platform.OS==="web"?undefined:AsyncStorage,
autoRefreshToken:true,
persistSession:true,
detectSessionInUrl:false
}
});

if(Platform.OS!=="web"){
AppState.addEventListener("change",(state)=>{
if(state==="active"){
supabase.auth.startAutoRefresh();
}else{
supabase.auth.stopAutoRefresh();
}
});
}