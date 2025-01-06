import React, { useCallback, useEffect, useState } from "react";
import {
  Link,
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Button,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";

export default function BacaKomik() {
  const { id } = useLocalSearchParams();
  const [username, setUsername] = useState("");
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const router = useRouter();


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem("username");
      if (storedUsername !== null) {
        setUsername(storedUsername);
      }
    } catch (error) {
      console.error("Error retrieving username from AsyncStorage: ", error);
    }
  };

  const fetchComicDetails = async () => {
    try {
      const options = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: "id=" + id,
      };
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/detailkomik.php",
        options
      );
      const json = await response.json();

      if (json.result === "success") {
        const comicData = json.data;

        if (
          comicData.rating &&
          Array.isArray(comicData.rating) &&
          comicData.rating.length > 0
        ) {
          let totalRating = 0;
          console.log(comicData.rating);

          for (const item of comicData.rating) {
            totalRating += parseFloat(item.rating);
          }
          comicData.averageRating = (
            totalRating / comicData.rating.length
          ).toFixed(1);
        } else {
          comicData.averageRating = "0.0";
        }

        if (
          comicData.kategori &&
          Array.isArray(comicData.kategori) &&
          comicData.kategori.length > 0
        ) {
          let categoryValues = [];

          for (const item of comicData.kategori) {
            categoryValues.push(item.kategori);
          }

          comicData.kategoriString = categoryValues.join(", ");
        } else {
          comicData.kategoriString = "Belum ada kategori";
        }

        const storedUsername = await AsyncStorage.getItem("username");
        const userRating = comicData.rating.find(
          (r) => r.username === storedUsername
        );
        setUserRating(userRating ? userRating.rating : 0);

        setComic(comicData);
      } else {
        alert("Failed to load comic details");
      }
    } catch (error) {
      console.error("Error fetching comic details:", error);
    } finally {
      setLoading(false);
    }
  };

  const Star = ({ fill, onPress }) => (
    <TouchableOpacity style={styles.star} onPress={onPress}>
      <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={fill ? "#FFD700" : "none"}
          stroke="#FFD700"
          strokeWidth="1"
        />
      </Svg>
    </TouchableOpacity>
  );

  const handleStarPress = (value) => {
    setUserRating(value);
    sendRating(value);
  };

  const sendRating = async (ratingValue) => {
    const options = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      body: `rating=${ratingValue}&username=${username}&idkomik=${id}`,
    };

    try {
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/tambahrating.php",
        options
      );
      const resjson = await response.json();

      if (resjson.result === "success") {
        alert("Rating berhasil dikirim!");
        fetchComicDetails();
      } else {
        alert("Gagal mengirim rating");
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Terjadi kesalahan saat mengirim rating");
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      alert("Komentar tidak boleh kosong");
      return;
    }

    try {
      const options = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: `username=${username}&idkomik=${id}&komentar=${newComment}`,
      };
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/tambahkomentar.php",
        options
      );
      const json = await response.json();

      if (json.result === "success") {
        alert("Komentar berhasil ditambahkan");
        setNewComment("");
        fetchComicDetails();
      } else {
        alert("Gagal menambahkan komentar");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    getUsername();
    fetchComicDetails();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchComicDetails();
    }, [id])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!comic) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load.</Text>
      </View>
    );
  }

  const formattedDate = formatDate(comic.tanggal_rilis);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardcontainer}>
        <View style={styles.card}>
        <TouchableOpacity
            style={styles.editIcon}
            onPress={() => {
              // Navigate to the edit page
              router.push({
                pathname: "/updatekomik",
                params: { id: id },
            
              });
            }}
            
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="#007BFF"
              />
            </Svg>
          </TouchableOpacity>
          <View style={styles.cardHeader}>
            <Image source={{ uri: comic.thumbnail }} style={styles.thumbnail} />
            <View style={styles.cardInfo}>
              <Text style={styles.title}>{comic.judul}</Text>
              <Text style={styles.info}>
                <Text style={styles.infoLabel}>Kategori: </Text>
                {comic.kategoriString}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.infoLabel}>Tanggal Rilis: </Text>
                {formattedDate}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.infoLabel}>Rating: </Text>
                {comic.averageRating}/5.0
              </Text>
            </View>
          </View>

          <Text style={styles.info}>
            <Text style={styles.infoLabel}>Pengarang: </Text>
            {comic.pengarang}
          </Text>
          <Text style={styles.description}>{comic.deskripsi}</Text>
        </View>
      </View>
      <FlatList
        data={comic.konten}
        keyExtractor={(item, index) => `content-${index}`}
        contentContainerStyle={{ alignItems: "center" }}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              resizeMode="contain"
              source={{ uri: "https://ubaya.xyz/react/160421078/uas/" + item }}
            />
          </View>
        )}
        nestedScrollEnabled={true}
        scrollEnabled={false} //mengindari scroll double
      />

      <View style={styles.card2}>
        <Text style={styles.labelRating}>Berikan Rating</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              fill={value <= userRating}
              onPress={() => handleStarPress(value)}
            />
          ))}
        </View>

        <Text style={styles.infoLabel2}>
          Komentar({comic.komentar.length}):{" "}
        </Text>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Tambahkan komentar..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <Button
            title="Kirim Komentar"
            onPress={handleAddComment}
            color="#007BFF"
          />
        </View>
        <FlatList
          data={comic.komentar}
          keyExtractor={(item, index) => `comment-${index}`}
          contentContainerStyle={{ alignItems: "stretch", width: "100%" }}
          renderItem={({ item }) => (
            <View style={styles.cardComment}>
              <Text style={styles.info}>
                <Text style={styles.infoLabel}>{item.nama}: </Text>
                {item.isi}
              </Text>
            </View>
          )}
          nestedScrollEnabled={true}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "50%",
    alignSelf: "center",
  },
  cardcontainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
    padding: 16,
    position: "relative", // Tambahkan ini agar posisi absolut tombol edit mengacu pada kartu
  },
  editIcon: {
    position: "absolute",
    top: 10, // Jarak dari atas
    right: 10, // Jarak dari kanan
    zIndex: 1, // Pastikan tombol berada di atas elemen lain
  },
  cardComment: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
    padding: 16,
    width: "100%",
  },
  card2: {
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 20,
    padding: 16,
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  thumbnail: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  infoLabel2: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 18,
  },
  labelRating: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#ff0000",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageContainer: {
    width: 360,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 400,
    height: 780,
    resizeMode: "contain",
  },
  commentInputContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  textInput: {
    height: 80,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 40,
  },
  star: {
    marginHorizontal: 4,
  },
});
