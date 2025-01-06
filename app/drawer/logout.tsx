import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View, Button, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../authContext";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    doLogout();
  }, []);

  const doLogout = async () => {
    try {
      await AsyncStorage.removeItem("uid");
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("token");
      alert("Logged out successfully");
      logout();
      router.replace("../login");
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ textAlign: "center", width: 500, fontSize: 30 }}>
        Successfully logged out.
      </Text>
    </View>
  );
}
