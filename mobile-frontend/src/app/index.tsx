import { useEffect, useState } from "react";

import HomeScreen from "../screens/HomeScreen";
import SplashScreen from "../screens/SplashScreen";

import { useAuth } from "@/context/AuthContext";


export default function Index() {


  const [showSplash, setShowSplash] = useState(true);


  const { loading } = useAuth();



  useEffect(() => {


    const timer = setTimeout(() => {


      if (!loading) {

        setShowSplash(false);

      }


    }, 3000);



    return () => clearTimeout(timer);


  }, [loading]);




  if (showSplash || loading) {

    return <SplashScreen />;

  }



  return <HomeScreen />;


}