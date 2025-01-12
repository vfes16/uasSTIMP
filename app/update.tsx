import React, { useEffect, useState, useRef } from "react";
import { ScrollView, Text, View, FlatList, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import RNPickerSelect from "react-native-picker-select";

export default function UpdateKomik() {
  const [title, setTitle] = useState("");
  const [releasedate, setReleasedate] = useState("");
  const [description, setDesc] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(null);
  const [scenes, setScenes] = useState(null);
  const [categoryOption, setCategoryOption] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const refRBSheet = useRef();
  const [imageUri, setImageUri] = useState("");
  const [id, setId] = useState("1");
  const params = useLocalSearchParams();
  
  const [komik, setKomik] = useState({
    judul: "",
    deskripsi: "",
    tanggal_rilis: "",
    pengarang: "",
    kategori: null,
    konten: null,
});

  useEffect(() => {
    if (params.id) {
      setId(params.id.toString());
      console.log(id);
    }
  }, [params.id]);

  useEffect(() => {
    const fetchKomik = async () => {
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
          setKomik(json.data);
        } else {
          alert("Failed to load comic details");
        }
        console.log(komik);
      } catch (error) {
        console.error("Error fetching comic details:", error);
      }

      try {
        const options = {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: "id=" + id,
        };
        const response = await fetch(
          "https://ubaya.xyz/react/160421078/uas/pilihankategori.php",
          options
        );
        const json = await response.json();
        setCategoryOption(json.data);
      } catch (error) {
        console.error("Error fetching category option:", error);
      }
    };

    if (id) {
      fetchKomik();
    }
  }, [id, triggerRefresh]);

  useEffect(() => {
    if (komik) {
      setTitle(komik.judul || "");
      setReleasedate(komik.tanggal_rilis || "");
      setDesc(komik.deskripsi || "");
      setAuthor(komik.pengarang || "");
      setScenes(komik.konten);
      setCategory(komik.kategori);
    }
  }, [komik]);

  const submit = () => {
    const options = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      body:
        "title=" +
        title +
        "&desc=" +
        description +
        "&rd=" +
        releasedate +
        "&author=" +
        author +
        "&id=" +
        id,
    };
    try {
      fetch("https://ubaya.xyz/react/160421078/uas/updatekomik.php", options)
        .then((response) => response.json())
        .then((resjson) => {
          console.log(resjson);
          if (resjson.result === "success") {
            alert(title + " Updated");
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const addKomikKategori = async () => {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "komik_id=" + id + "&kategori_id=" + selectedCategory,
      };
      try {
        const response = await fetch(
          "https://ubaya.xyz/react/160421078/uas/tambahkomikkategori.php",
          options
        );
        response.json().then(async (resjson) => {
          console.log(resjson);
          setTriggerRefresh((prev) => !prev);
        });
      } catch (error) {
        console.error("Failed to add comic category:", error);
      }
    };

    if (selectedCategory) {
      addKomikKategori();
    }
  }, [selectedCategory]);

  const deleteKomikKategori = async (kid: number) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "komik_id=" + id + "&kategori_id=" + kid,
    };
    try {
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/deletekomikkategori.php",
        options
      );
      response.json().then(async (resjson) => {
        console.log(resjson);
        setTriggerRefresh((prev) => !prev);
      });
    } catch (error) {
      console.error("Failed to delete comic categories:", error);
    }
  };

  const renderComboBox = () => {
    return (
      <View style={{ marginVertical: 10 }}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedCategory(value)}
          items={categoryOption}
          placeholder={{ label: "Pilih kategori", value: null }}
        />
      </View>
    );
  };

  const imgGaleri = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadScene = async () => {
    const data = new FormData();
    data.append("id", id);

    const response = await fetch(imageUri);
    const blob = await response.blob();
    data.append("image", blob, "scene.png");

    const options = {
      method: "POST",
      body: data,
      headers: {},
    };

    try {
      fetch("https://ubaya.xyz/react/160421078/uas/uploadkonten.php", options)
        .then((response) => response.json())
        .then((resjson) => {
          console.log(resjson);
          if (resjson.result === "success") alert("sukses");
          setTriggerRefresh((prev) => !prev);
          setImageUri("");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteScene = async (sceneUri: string) => {
    const fileName = sceneUri.split("/").pop();

    const formData = new FormData();
    formData.append("id", id);
    formData.append("filename", fileName);

    try {
      const response = await fetch(
        "https://ubaya.xyz/react/160421078/uas/deletekonten.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const resjson = await response.json();
      if (resjson.result === "success") {
        alert("Scene deleted successfully");
        setScenes((prevScenes) =>
          prevScenes.filter((scene: any) => scene !== sceneUri)
        );
      } else {
        alert(`Failed to delete scene: ${resjson.message}`);
      }
    } catch (error) {
      console.error("Error deleting scene:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Comic</Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            onChangeText={setTitle}
            value={title}
            placeholderTextColor="#94A3B8"
            placeholder="Enter comic title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            onChangeText={setDesc}
            value={description}
            multiline={true}
            numberOfLines={4}
            placeholderTextColor="#94A3B8"
            placeholder="Enter comic description"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Release Date</Text>
          <TextInput
            style={styles.input}
            onChangeText={setReleasedate}
            value={releasedate}
            placeholderTextColor="#94A3B8"
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Author</Text>
          <TextInput
            style={styles.input}
            onChangeText={setAuthor}
            value={author}
            placeholderTextColor="#94A3B8"
            placeholder="Enter author name"
          />
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => submit()}
        >
          <Text style={styles.updateButtonText}>Update Comic</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryList}>
          <FlatList
            data={category}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.kategori}
            renderItem={({ item }) => (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{item.kategori}</Text>
                <TouchableOpacity
                  onPress={() => deleteKomikKategori(item.id)}
                  style={styles.categoryDelete}
                >
                  <Text style={styles.categoryDeleteText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View style={styles.categoryPicker}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedCategory(value)}
            items={categoryOption}
            placeholder={{ label: "Add new category", value: null }}
            style={pickerSelectStyles}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comic Pages</Text>
        <FlatList
          data={scenes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.sceneContainer}>
              <Image
                style={styles.sceneImage}
                resizeMode="contain"
                source={{
                  uri: "https://ubaya.xyz/react/160421078/uas/" + item,
                }}
              />
              {/* IMAGE 1 */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteScene(item)}
              >
                <Text style={styles.deleteButtonText}>Delete Page</Text>
              </TouchableOpacity>
            </View>
          )}
          nestedScrollEnabled={true}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Add New Page</Text>
        <RBSheet
        // style
          ref={refRBSheet}
          height={200}
          openDuration={250}
          customStyles={{
            container: {
              backgroundColor: '#1E293B',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            },
          }}
        //style seles
        >
          <View style={styles.bottomSheetContent}>
            <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={imgGaleri}
            >
              <Text style={styles.bottomSheetButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>

        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image
              style={styles.previewImage}
              resizeMode="contain"
              source={{ uri: imageUri }}
            />
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadScene}
            >
              <Text style={styles.uploadButtonText}>Upload Page</Text>
            </TouchableOpacity>
          </View>
        ) : (

          <TouchableOpacity
            style={styles.pickButton}
            onPress={() => refRBSheet.current.open()}
          >
            <Text style={styles.pickButtonText}>Select Image</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: 20,
    backgroundColor: '#12121a',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formSection: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121a',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    marginRight: 8,
  },
  categoryDelete: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryPicker: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginTop: 8,
  },
  sceneContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  sceneImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#0F172A',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadSection: {
    padding: 20,
  },
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  previewImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#0F172A',
  },
  uploadButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickButton: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSheetContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomSheetButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomSheetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    color: '#FFFFFF',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    color: '#FFFFFF',
    paddingRight: 30,
  },
});