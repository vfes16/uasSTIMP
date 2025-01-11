import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView , Image, Button, Alert} from 'react-native';
import { useValidation } from 'react-simple-form-validator';

export default function addKomik ()  {
  const [thumbnail, setThumbnail] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal_rilis, setTanggalRilis] = useState('');
  const [pengarang, setPengarang] = useState('');

  const { isFieldInError, getErrorsInField, isFormValid } = useValidation({
    fieldsRules: {
      thumbnail: { website: true },
      judul: { required: true },
      deskripsi: { required: true, minlength:20 },
      tanggal_rilis: { required: true, date:true },
      pengarang:{ required: true},
    },
    state: {thumbnail, judul,deskripsi,tanggal_rilis,pengarang},
  });

  const renderThumbnailErrors = () => {
    if (isFieldInError('thumbnail')) {
      return getErrorsInField('thumbnail').map((errorMessage, index) => (
        <Text key={index} style={styles.errorText}>
          {errorMessage}
        </Text>
      ));
    }
    return null;
  };

  const renderJudulErrors = () => {
    if (isFieldInError('judul')) {
      return getErrorsInField('judul').map((errorMessage, index) => (
        <Text key={index} style={styles.errorText}>
          {errorMessage}
        </Text>
      ));
    }
    return null;
  };

  const renderDeskripsiErrors = () => {
    if (isFieldInError('deskripsi')) {
      return getErrorsInField('deskripsi').map((errorMessage, index) => (
        <Text key={index} style={styles.errorText}>
          {errorMessage}
        </Text>
      ));
    }
    return null;
  };

  const renderTanggalRilisErrors = () => {
    if (isFieldInError('tanggal_rilis')) {
      return getErrorsInField('tanggal_rilis').map((errorMessage, index) => (
        <Text key={index} style={styles.errorText}>
          {errorMessage}
        </Text>
      ));
    }
    return null;
  };
  
  const renderPengarangErrors = () => {
    if (isFieldInError('pengarang')) {
      return getErrorsInField('pengarang').map((errorMessage, index) => (
        <Text key={index} style={styles.errorText}>
          {errorMessage}
        </Text>
      ));
    }
    return null;
  };

  const renderPoster = () => {
    if (thumbnail!='' &&  !isFieldInError('url')) {
      return ( 
      <Image
      style={{width:300,height:400}}
      resizeMode="contain"
      source={{ uri: thumbnail }}
    />
      );
      
    }
    return null;
  };

  const renderButtonSubmit = () => {
    if (isFormValid) {
      return ( 
        <Button title="Submit" onPress={submitData} />
      );
    }
    return null;
  };


  const submitData = async() => {
    const options = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: "thumbnail="+thumbnail+"&"+
            "judul="+judul+"&"+
            "deskripsi="+deskripsi+"&"+
            "tanggal_rilis="+tanggal_rilis+"&"+
            "pengarang="+pengarang
    };
      try {
        const response = await fetch("https://ubaya.xyz/react/160421144/komiku/newKomik.php", options);
        const resjson = await response.json();
        if (resjson.result === "success") {
            Alert.alert("Success", "Add New komik successfully");
        } else {
            Alert.alert("Error", resjson.error || "Failed to add New Komik");
        }
      } catch (error) {
        console.log(error);
      } 
    }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="judul"
        onChangeText={setJudul}
        value={judul}
      />
      {renderJudulErrors()}


      <Text>Deskripsi</Text>
      <TextInput
        multiline
        numberOfLines={4}
        style={styles.input2}
        onChangeText={setDeskripsi} />
      {renderDeskripsiErrors()}
   
      <Text>Tanggal Rilis</Text>
      <TextInput
        style={styles.input}
        onChangeText={setTanggalRilis}
        value={tanggal_rilis}
      />
      {renderTanggalRilisErrors()}

      <Text>Pengarang</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPengarang}
        value={pengarang}
      />
      {renderPengarangErrors()}

      <Text>Thumbnail</Text>
      <TextInput
        style={styles.input}
        onChangeText={setThumbnail}
        value={thumbnail}
      />
      {renderThumbnailErrors()}
      {renderPoster()}


    {renderButtonSubmit()}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      backgroundColor :'#fff',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    input2: {
        height: 120,
        borderColor: '#ccc',
        backgroundColor :'#fff',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
      },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginBottom: 10,
    },
  });