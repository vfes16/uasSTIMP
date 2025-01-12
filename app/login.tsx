import * as React from "react";
import { Button, Card, Text } from "@rneui/base";
import { StyleSheet, View, TextInput } from "react-native";
import { AuthProvider, useAuth } from "./authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const doLogin = async () => {
    const options = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      body: "un=" + username + "&upw=" + password,
    };
    const response = await fetch(
      "https://ubaya.xyz/react/160421078/uas/login.php",
      options
    );
    const json = await response.json();

    if (json.result == "success") {
      try {
        await AsyncStorage.setItem("uid", json.data.user_id);
        await AsyncStorage.setItem("username", json.data.user_name);
        alert("Login successful");
        login();
      } catch (e) {
        console.error("Error saving data to AsyncStorage", e);
      }
    } else {
      alert("Username or password is incorrect");
    }
  };

  return (
    <Card
      containerStyle={{
        borderRadius: 10,
        backgroundColor: "#1E1E1E", // Background Card Tema Gelap
        borderColor: "#333333", // Border Card Gelap
      }}
    >
      <Card.Title style={{ fontFamily: "verdana", color: "#FFFFFF" }}>
        Silakan Login
      </Card.Title>
      <Card.Divider />
      <View style={styles.viewRow}>
        <Text
          style={{
            fontFamily: "verdana",
            textAlign: "left",
            width: 200,
            marginBottom: 8,
            color: "#FFFFFF", // Warna teks terang
          }}
        >
          Username{" "}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan username"
          placeholderTextColor="#AAAAAA" // Placeholder terang
          onChangeText={(text) => setUsername(text)}
          value={username}
        />
      </View>
      <View style={styles.viewRow}>
        <Text
          style={{
            fontFamily: "verdana",
            textAlign: "left",
            width: 200,
            marginBottom: 8,
            color: "#FFFFFF", // Warna teks terang
          }}
        >
          Password{" "}
        </Text>
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder="Masukkan password"
          placeholderTextColor="#AAAAAA" // Placeholder terang
          onChangeText={(text) => setPassword(text)}
          value={password}
        />
      </View>
      <View style={styles.viewRow}>
        <Button
          style={styles.button}
          titleStyle={{ fontWeight: "bold", color: "#1E1E1E" }} // Teks tombol gelap
          buttonStyle={{
            backgroundColor: "#4CAF50", // Hijau terang untuk tombol
            borderRadius: 8,
          }}
          title="Submit"
          onPress={() => {
            doLogin();
          }}
        />
      </View>
    </Card>
  );
}

export default Login;

const styles = StyleSheet.create({
  cardStyle: {
    height: 100,
  },
  input: {
    height: 40,
    width: 200,
    borderWidth: 1,
    borderColor: "#555555", // Border input gelap
    backgroundColor: "#2C2C2C", // Background input gelap
    color: "#FFFFFF", // Teks input terang
    padding: 10,
    fontFamily: "verdana",
    borderRadius: 8,
  },
  button: {
    width: 200,
  },
  viewRow: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
});
