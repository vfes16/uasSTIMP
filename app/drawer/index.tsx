import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import Svg, { Path } from "react-native-svg";

export default function Index() {
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = new Animated.Value(0);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/kategori.php"
      );
      const json = await response.json();
      setCategories(json.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const searchComics = async (query = "") => {
    setIsLoading(true);
    try {
      const options = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: "cari=" + query,
      };
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/komik.php",
        options
      );
      const json = await response.json();

      if (json.result === "success") {
        setResults(json.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        alert("Failed to fetch comics");
      }
    } catch (error) {
      console.error("Error searching comics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchComicsCategory = async (categoryId) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
    try {
      const options = {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: "kategori=" + categoryId,
      };
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/komik.php",
        options
      );
      const json = await response.json();
      if (json.result === "success") {
        setResults(json.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();D
      } else {
        alert("Failed to fetch comics");
      }
    } catch (error) {
      console.error("Error searching comics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    searchComics();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Comics</Text>
        <Text style={styles.headerSubtitle}>Find your next favorite manga</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search comics..."
          placeholderTextColor="#8a8f98"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => searchComics(searchText)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.categoryButtonActive,
            ]}
            onPress={() => searchComicsCategory(item.id.toString())}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item.id && styles.categoryTextActive,
            ]}>
              {item.nama}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Popular Comics</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : (
        <View style={styles.comicGrid}>
          {results.map((item) => (
            <Link
              key={item.id}
              push
              href={{ pathname: "/bacakomik", params: { id: item.id } }}
              style={styles.comicCard}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.comicImage}
                resizeMode="cover"
              />
              <Text style={styles.comicText} numberOfLines={2}>
                {item.judul}
              </Text>
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
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#12121a',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8a8f98',
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#12121a',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a34',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#12121a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a34',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryText: {
    color: '#8a8f98',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  loader: {
    marginVertical: 20,
  },
  comicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  comicCard: {
    width: '50%',
    padding: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
  },
  comicImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#2a2a34',
  },
  comicText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  ratingContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
});