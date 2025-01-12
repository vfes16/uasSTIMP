import React, { useEffect, useState } from "react";
import {FlatList,Image,Text,View,StyleSheet,ScrollView,} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";

export default function DaftarKomik() {
  const [results, setResults] = useState([]);
  const { id, nameCate } = useLocalSearchParams();

  useEffect(() => {
    fetchComicsCategory();
  }, [id, nameCate]);
  
  const fetchComicsCategory = async () => {
    try {
      const options = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: "kategori=" + id,
      };
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/komik.php",
        options
      );
      const json = await response.json();

      if (json.result === "success") {
        setResults(json.data);
        console.log(json.data);
      } else {
        alert("Failed to fetch comics");
      }
    } catch (error) {
      console.error("Error fetching comics:", error);
    }
  };

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
            <View style={styles.ratingContainer}>
              <Svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  fill="#FFD700"
                  stroke="#FFD700"
                  strokeWidth="1"
                />
              </Svg>
              <Text style={styles.ratingText}>{item.rating}/5.0</Text>
            </View>
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
  ratingContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 4,
  },
});