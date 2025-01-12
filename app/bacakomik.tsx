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

    console.log("Data yang dikirim:", {
      username,
      idkomik: id,
      komentar: newComment,
    });

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

      const json = await response.json(); // Di sinilah error terjadi
      console.log("Response dari server:", json);

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
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading your comic...</Text>
      </View>
    );
  }

  if (!comic) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load comic</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchComicDetails}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: comic.thumbnail }} style={styles.heroImage} />
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => {
            router.push({
              pathname: "/update",
              params: { id: id },
            });
          }}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF">
            <Path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{comic.judul}</Text>
            <View style={styles.ratingBadge}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700">
                <Path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </Svg>
              <Text style={styles.ratingText}>{comic.averageRating}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Author</Text>
          <Text style={styles.infoValue}>{comic.pengarang}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Release Date</Text>
          <Text style={styles.infoValue}>{formatDate(comic.tanggal_rilis)}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Categories</Text>
          <Text style={styles.infoValue}>{comic.kategoriString}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Text style={styles.description}>{comic.deskripsi}</Text>
      </View>

      {/* Comic Content */}
      <FlatList
        data={comic.konten}
        keyExtractor={(item, index) => `content-${index}`}
        renderItem={({ item }) => (
          <Image
            style={styles.comicPage}
            source={{ uri: "https://ubaya.xyz/react/160421078/uas/" + item }}
            resizeMode="contain"
          />
        )}
        scrollEnabled={false}
      />

      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>Rate this Comic</Text>
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => handleStarPress(value)}
              style={styles.starButton}
            >
              <Svg width="40" height="40" viewBox="0 0 24 24" fill={value <= userRating ? "#FFD700" : "none"}>
                <Path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  stroke="#FFD700"
                  strokeWidth="1"
                />
              </Svg>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comments ({comic.komentar.length})</Text>
        <View style={styles.commentInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Share your thoughts..."
            placeholderTextColor="#9CA3AF"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
            <Text style={styles.submitButtonText}>Post Comment</Text>
          </TouchableOpacity>
        </View>

        {comic.komentar.map((comment, index) => (
          <View key={index} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{comment.nama}</Text>
            </View>
            <Text style={styles.commentText}>{comment.isi}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  heroContainer: {
    height: 400,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    background: "linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.9))",
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 16,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 12,
  },
  ratingText: {
    color: "#FFD700",
    marginLeft: 4,
    fontWeight: "bold",
  },
  infoSection: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#12121a",
    padding: 12,
    borderRadius: 12,
  },
  infoLabel: {
    color: "#12121a",
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  description: {
    color: "#94A3B8",
    lineHeight: 24,
    fontSize: 16,
  },
  comicPage: {
    width: "100%",
    height: 800,
    marginBottom: 16,
  },
  ratingSection: {
    padding: 16,
    backgroundColor: "#12121a",
    marginVertical: 16,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  commentsSection: {
    padding: 16,
  },
  commentInput: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: "#12121a",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#6366F1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  commentCard: {
    backgroundColor: "#12121a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    marginBottom: 8,
  },
  commentAuthor: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  commentText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 18,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#6366F1",
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  editIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
  },
});