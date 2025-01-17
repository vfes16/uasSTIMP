import React, { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../authContext";
import Index from "./index";
import Cari from "./cari";
import Kategori from "./kategori";
import TambahKomik from "./tambahkomik";
import Logout from "./logout";

const Drawer = createDrawerNavigator();

function DrawerLayout() {
  const [username, setUsername] = useState<string>("");

  const getUsername = async () => {
    try {
      const username = await AsyncStorage.getItem("username");
      if (username !== null) {
        setUsername(username);
      } else {
        setUsername("");
      }
    } catch (e) {
      console.error("Error reading username from AsyncStorage", e);
    }
  };

  useEffect(() => {
    getUsername();
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#ffffff",
        drawerStyle: { backgroundColor: "#121212" },
        drawerLabelStyle: { color: "#ffffff" },
      }}
    >
      <Drawer.Screen
        name="home"
        component={Index}
        options={{
          drawerLabel: "Home",
          title: "KOMIKU",
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="cari"
        component={Cari}
        options={{
          drawerLabel: "Cari Komik",
          title: "Cari Komik",
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="kategori"
        component={Kategori}
        options={{
          drawerLabel: "Kategori",
          title: "Kategori Komik",
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="tambahkomik"
        component={TambahKomik}
        options={{
          drawerLabel: "Tambah Komik",
          title: "Tambah Komik",
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="logout"
        component={Logout}
        options={{
          drawerLabel: "Log Out",
          title: "Logout",
          headerTitleAlign: "center",
        }}
      />
    </Drawer.Navigator>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <DrawerLayout />
    </AuthProvider>
  );
}
