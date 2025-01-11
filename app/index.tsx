import React, { useEffect, useState } from "react";
import { Text, View, Button, ScrollView } from "react-native";
import { router, useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "./authContext";

export default function Index() {

  const [username, setUsername] = useState<string>(''); 
  const { logout } = useAuth();

  const cekLogin = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        setUsername(value); 
      } else {
        setUsername('');       
        logout();
      }
    } catch (e) {
      console.error('Error reading username from AsyncStorage', e);
      setUsername(''); 
      logout();
    }
  };

  const doLogout = async () => {
    try {
      await AsyncStorage.removeItem('username')
      alert('logged out');
      logout();
    } catch (e) {
  } 
}

  useEffect(() => {
    cekLogin()
  }, [username]);

  return (
    <ScrollView>
      <Button
        title="Go to genre display"
        onPress={() => router.push('/genreDisplay')}
      />
      <Button
        title="Go to Add Komik"
        onPress={() => router.push('/addKomik')}
      />
      <Button
        title="Go to Cari Komik"
        onPress={() => router.push('/cariKomik')}
      />
      <Button
        title="logout"
        onPress={() => doLogout()}
      />
    </ScrollView>
  );
}
