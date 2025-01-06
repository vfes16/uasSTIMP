import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, View, StyleSheet, ScrollView } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";

export default function DaftarKomik() {
  const [results, setResults] = useState([]);
  const { id, nameCate } = useLocalSearchParams();

  const fetchComicsCategory = async () => {
    try {
      const options = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: "kategori=" + id,
      };
      const response = await fetch("https://ubaya.xyz/react/160421078/uas/komik.php", options);
      const json = await response.json();

      if (json.result === "success") {
        setResults(json.data);
        console.log(json.data)
      } else {
        alert("Failed to fetch comics");
      }
    } catch (error) {
      console.error("Error fetching comics:", error);
    }
  };

  useEffect(() => {
    fetchComicsCategory();
  }, [id, nameCate]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Kategori {nameCate}</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <Link
            push
            href={{ pathname: "/bacakomik", params: { id: item.id } }}
            style={styles.comicCard}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.comicImage}
              resizeMode="cover"
            />
            <Text style={styles.comicText}>{item.judul}</Text>
          </Link>
        )}
        nestedScrollEnabled={true}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "50%",
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  comicCard: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  comicImage: {
    width: "100%",
    height: 190,
    borderRadius: 8,
  },
  comicText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
