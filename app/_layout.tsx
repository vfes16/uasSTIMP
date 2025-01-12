import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "./authContext";
import React, { useEffect } from "react";

function RootLayout() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      router.replace("./drawer/");
    }
  }, [isLoggedIn]);
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#ffffff",
        contentStyle: { backgroundColor: "#000000" },
        headerTitleAlign: "center",
      }}>
      <Stack.Screen
        name="login"
        options={{
          title: "KOMIKU",
          headerBackVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen name="drawer" options={{ headerShown: false }} />
      <Stack.Screen name="bacakomik" options={{ title: "Baca Komik" }} />
      <Stack.Screen name="updatekomik" options={{ title: "Update Komik" }} />
      <Stack.Screen name="daftarkomik" options={{ title: "Daftar Komik" }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
