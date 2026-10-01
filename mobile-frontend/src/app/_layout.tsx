import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {

  return (

    <AuthProvider>

      <Stack
        screenOptions={{
          headerShown: false
        }}
      >

        <Stack.Screen name="index" />

        <Stack.Screen name="auth/login" />

        <Stack.Screen name="auth/signup" />

        <Stack.Screen name="survey" />

        <Stack.Screen name="scanner" />

        <Stack.Screen name="tryon" />

        <Stack.Screen name="booking" />

      </Stack>

    </AuthProvider>

  );

}