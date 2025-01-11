import { StyleSheet, View, Text, FlatList, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Card, Image } from "@rneui/base";
import { Link, useLocalSearchParams } from "expo-router";

const DaftarKomik = () => {
  const [data, setData] = useState(null);
  const { genreid } = useLocalSearchParams(); // Get genreid from URL parameters

  const fetchData = async (genreid: string) => {
    const options = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      body: "genreid=" + genreid,
    };

    try {
      const response = await fetch(
        "https://ubaya.xyz/react/160421144/komiku/komiklist.php",
        options
      );
      const resjson = await response.json();
      if (resjson.result === "success") {
        setData(resjson.data);
      } else {
        console.error("Error fetching comics:", resjson.message);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    if (genreid) {
      fetchData(genreid as string);
    }
  }, [genreid]);

  const showData = (data: any) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.comic_id.toString()}
        renderItem={({ item }) => (
          <Card>
            <Card.Title>{item.title}</Card.Title>
            <Card.Divider />
            <View style={{ position: "relative", alignItems: "center" }}>
              <Image
                style={{ width: 300, height: 500 }}
                resizeMode="contain"
                source={{ uri: item.thumbnail }}
              />
              <Text>{item.description}</Text>
              <Text>Pengarang: {item.pengarang}</Text>
              <Text>Tanggal Rilis: {item.tanggal_rilis}</Text>
              <Text>Rating Rata-rata: {parseFloat(item.average_rating).toFixed(1)}</Text>
              <Link
                push
                href={{
                  pathname: "/bacaKomik",
                  params: { comicid: item.comic_id },
                }}
              >
                Lihat Detail
              </Link>
            </View>
          </Card>
        )}
      />
    );
  };

  return (
    <ScrollView>
      {data ? showData(data) : <Text>Loading...</Text>}
    </ScrollView>
  );
};

export default DaftarKomik;
