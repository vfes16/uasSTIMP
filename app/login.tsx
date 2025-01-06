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
      }}
    >
      <Card.Title style={{ fontFamily: "verdana" }}>Silakan Login</Card.Title>
      <Card.Divider />
      <View style={styles.viewRow}>
        <Text
          style={{
            fontFamily: "verdana",
            textAlign: "left",
            width: 200,
            marginBottom: 8,
          }}
        >
          Username{" "}
        </Text>
        <TextInput
          style={styles.input}
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
          }}
        >
          Password{" "}
        </Text>
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          onChangeText={(text) => setPassword(text)}
          value={password}
        />
      </View>
      <View style={styles.viewRow}>
        <Button
          style={styles.button}
          titleStyle={{ fontWeight: "bold" }}
          buttonStyle={{
            backgroundColor: "rgba(111, 202, 186, 1)",
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
