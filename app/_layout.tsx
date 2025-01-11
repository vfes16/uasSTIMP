import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "./authContext";
import { useEffect } from "react";

function RootLayout() {

  const { isLoggedIn } = useAuth(); // Get logged-in status
  const router = useRouter();
  useEffect(() => {
  // Redirect based on login status
  if (!isLoggedIn) {
  // If not logged in, redirect to login screen
  router.replace("/login");
  } else {
  // If logged in, redirect to index
  router.replace("/");
  }
  }, [isLoggedIn]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="genreDisplay" options={{ title: 'genreDisplay' }}/>
      <Stack.Screen name="daftarkomik" options={{ title: 'daftarkomik' }}/>
      <Stack.Screen name="addKomik" options={{ title: 'addKomik' }}/>
      <Stack.Screen name="cariKomik" options={{ title: 'carikomik' }}/>
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
