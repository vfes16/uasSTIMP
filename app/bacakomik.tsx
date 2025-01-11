import { StyleSheet, View, Text, ScrollView, FlatList, TextInput, Button, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Card, Image, Slider } from "@rneui/base";

type KomikDetail = {
  title: string;
  description: string;
  gambar: { url: string }[];
  komen: { komen: string; tanggal_buat: string }[];
};

const bacaKomik = () => {
  const [comicId, setComicId] = useState("1");
  const [rating, setRating] = useState(5);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [komikDetails, setKomikDetails] = useState<KomikDetail>({
    title: "",
    description: "",
    gambar: [],
    komen: [],
  });
  const [newComment, setNewComment] = useState("");
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.comicid) {
      setComicId(params.comicid.toString());
    }
  }, [params.comicid]);

  useEffect(() => {
    const fetchKomikDetails = async () => {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `komik_id=${comicId}`,
      };
      try {
        const response = await fetch("https://ubaya.xyz/react/160421144/komiku/komik_konten.php", options);
        const resjson = await response.json();
        if (resjson.result === "success") {
          setKomikDetails(resjson);
        } else {
          console.error("Failed to fetch comic details:", resjson.message);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (comicId) {
      fetchKomikDetails();
    }
  }, [comicId]);

  const submitComment = async () => {
    if (newComment.trim() === "") {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `komik_id=${comicId}&user_id=1&komen=${encodeURIComponent(newComment)}`,
    };

    try {
      const response = await fetch("https://ubaya.xyz/react/160421144/komiku/addKomen.php", options);
      const resjson = await response.json();
      if (resjson.result === "success") {
        Alert.alert("Success", "Comment added successfully");
        setNewComment("");
        setKomikDetails((prevDetails) => ({
          ...prevDetails,
          komen: [
            ...(prevDetails.komen || []),
            { komen: newComment, tanggal_buat: new Date().toISOString() },
          ],
        }));
      } else {
        Alert.alert("Error", resjson.error);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`https://ubaya.xyz/react/160421144/komiku/getRating.php?komik_id=${comicId}`);
        const resjson = await response.json();
        if (resjson.result === "success") {
          setAverageRating(resjson.average_rating);
        } else {
          console.error(resjson.error);
        }
      } catch (error) {
        console.error("Failed to fetch rating:", error);
      }
    };

    fetchRating();
  }, [comicId]);

  const submitRating = async () => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `komik_id=${comicId}&user_id=1&rating=${rating}`,
    };
  
    try {
      const response = await fetch("https://ubaya.xyz/react/160421144/komiku/addRating.php", options);
      const resjson = await response.json();
      if (resjson.result === "success") {
        Alert.alert("Success", "Rating added successfully");
  
        // Fetch updated average rating from backend
        const ratingResponse = await fetch(`https://ubaya.xyz/react/160421144/komiku/getRating.php?komik_id=${comicId}`);
        const ratingResjson = await ratingResponse.json();
        if (ratingResjson.result === "success") {
          setAverageRating(ratingResjson.average_rating); // Set rata-rata dari backend
        } else {
          console.error(ratingResjson.error);
          Alert.alert("Error", "Failed to fetch updated rating");
        }
      } else {
        Alert.alert("Error", resjson.error || "Failed to add rating");
      }
    } catch (error) {
      console.error("Failed to add rating:", error);
      Alert.alert("Error", "Failed to connect to server");
    }
  };

  return (
    <ScrollView>
      {komikDetails.gambar.length > 0 ? (
        <View>
          <Card>
            <Card.Title>{komikDetails.title}</Card.Title>
            <Card.Divider />
            <Text>{komikDetails.description}</Text>
          </Card>
          <FlatList
            data={komikDetails.gambar}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  resizeMode="contain"
                  source={{ uri: item.url }}
                />
              </View>
            )}
          />
          <Card>
            <Card.Title>Comments</Card.Title>
            <Card.Divider />
            <FlatList
              data={komikDetails.komen}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.comment}>
                  <Text>{item.komen}</Text>
                  <Text style={styles.commentDate}>{item.tanggal_buat}</Text>
                </View>
              )}
            />
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <Button title="Submit Comment" onPress={submitComment} />

            <Text>Rate this comic:</Text>
            <Slider
              value={rating}
              onValueChange={setRating}
              minimumValue={1}
              maximumValue={5}
              step={1}
            />
            <Text>Selected Rating: {rating}</Text>
            <Text>Average Rating: {averageRating !== null ? averageRating.toFixed(2) : "Loading..."}</Text>
            <Button title="Submit Rating" onPress={submitRating} />
          </Card>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 300,
    height: 500,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  comment: {
    marginBottom: 10,
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
  },
});

export default bacaKomik;
