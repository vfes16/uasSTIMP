import { StyleSheet, View, Text, FlatList } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Card,Image } from "@rneui/base";
import { TextInput } from "react-native";
import { Link } from "expo-router";


class cariKomik extends React.Component {
        state = {
            cari:"",
            data:null
        };

     
        fetchData = async () =>  {
            const options = {
                method: 'POST',
                headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
                }),
                body: "cari="+this.state.cari
            };
         
            try {
              fetch('https://ubaya.xyz/react/160421144/komiku/carikomik.php',options)
                .then(response => response.json())
                .then(resjson =>{
                  this.setState({
                    data: resjson.data
                   });
                });
            } catch (error) {
              console.log(error);
            } 
          }

        componentDidMount() {    
            this.fetchData();
        }


        showData(data:any){
            
          return <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
               <Card>
                    <Card.Title>{item.judul}</Card.Title>
                    <Card.Divider/>
                    <View style={{position:"relative",alignItems:"center"}}>
                    <Image
                        style={{width:300,height:500}}
                        resizeMode="contain"
                        source={{ uri: item.thumbnail }}
                        />
                    <Text >{item.deskripsi}</Text>
                    </View>
               </Card>
            )}
            />
          }


    render() {  
        return (
            <ScrollView>
                <Card>
                    <View  style={styles.viewRow} >
                        <Text>Cari </Text>
                        <TextInput style={styles.input} 
                        onChangeText={(cari) => this.setState({ cari })} 
                        onSubmitEditing={() => this.fetchData()} 
                       
                        />
                    </View>
                </Card>

                {this.showData(this.state.data)}
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    input: {
      height: 40,
      width:200,
      borderWidth: 1,
      padding: 10,
    },
    viewRow:{
       flexDirection:"row",
       justifyContent:"flex-end",
       alignItems: 'center',
       paddingRight:50,
       margin:3
    }
 })

export default cariKomik