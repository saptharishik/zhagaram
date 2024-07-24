import * as React from 'react';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View,Button, TouchableOpacity, Linking, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

import { db } from './firebase';
import { useEffect, useState } from 'react';
import { ref, onValue ,update} from "firebase/database";
import { createStackNavigator } from '@react-navigation/stack';
import WebView from 'react-native-webview';



function HomeScreen({ navigation }) {
  // front page
  const [flag, setflag] = useState(0);
  const [dflag, setdflag] = useState(0);
  const [condition,setCondition] = useState(null);
  const [temp,setTemp] = useState(0);
  const [counter,setCounter] = useState(0);
  const [status,setStatus] = useState('OFF');
  const [co,setco] = useState(0);
  const [manual,setManual] = useState(0);
  const [motor,setMotor] = useState(0);
  useEffect(() => {
    // const safetyRef = ref(db, 'Safety/flag'); 

    const fetchData = () => {
      const flagRef = ref(db, 'Safety/flag');
      const dflagRef = ref(db, 'Safety/d_flag');
      const tempRef = ref(db,'Safety/temperature')
      const countRef =ref(db,'Safety/counter')
      const conditionRef = ref(db, 'Safety/condition');
      const motorRef = ref(db,'Safety/motor_on');
      const coLevelRef = ref(db,'Safety/CO');
      
      
      onValue(coLevelRef,(snapshot)=>{
        const val= snapshot.val();
        setco(val);
        
      });
      onValue(motorRef,(snapshot)=>{
        const val= snapshot.val();
        setMotor(val);
        
      });
      onValue(conditionRef,(snapshot)=>{
        const val= snapshot.val();
        setCondition(val);
        // console.log('con : ' + val);
      });
      onValue(countRef,(snapshot)=>{
        const val= snapshot.val();
        setCounter(val);
        
      });
      onValue(flagRef, (snapshot) => {
        const val = snapshot.val();
        setflag(val); 
        // console.log('flag : '+val);
      });
      onValue(dflagRef, (snapshot) => {
        const val = snapshot.val();
        setdflag(val); 
        // console.log('dflag : '+val);
      });
      onValue(tempRef, (snapshot) => {
        const val = snapshot.val();
        setTemp(val);   
      });
    };
    const updateSafetyCondition = (condition) => {
      const conditionRef = ref(db, 'Safety');
      const updates = {};
      updates['/condition'] = condition;
      update(conditionRef, updates);
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
      // Check conditions and update Safety condition here
      if (dflag === 1 || flag === 1) {
        updateSafetyCondition('UNSAFE');
      } else {
        updateSafetyCondition('SAFE');
      }
      if(manual===0 && motor===0){
        setStatus("OFF");
      }
      else{
        setStatus("ON");
      }
      // console.log(status+ ""+manual+""+motor);
    }, 100);

    return () => clearInterval(interval);
  }, [dflag, flag,manual,motor]);
  
  const showAlertON = () =>
  Alert.alert(
    'MOTOR ON',
    'Motor is already in ON condition',
    [
      {
        text: 'Cancel',
        
        style: 'cancel',
      },
    ],
    
  );
  const showAlertOFF = () =>
  Alert.alert(
    'MOTOR OFF',
    'Motor is already in OFF condition',
    [
      {
        text: 'Cancel',
        
        style: 'cancel',
      },
    ],
    
  );
  const showRestrictOFF = () =>
  Alert.alert(
    'MOTOR OFF',
    'Temperature is high u cant Turn OFF sprinkler',
    [
      {
        text: 'Cancel',
        
        style: 'cancel',
      },
    ],
    
  );
  function statuson(){
    const manualRef = ref(db, 'Safety/motor');
    const updates = {};
    updates['/motor'] = 1; // Set motor value to 1
    update(manualRef, updates);
    if (manual===1)
    showAlertON();
    if(motor===0){
    setManual(1);
    
    }
    
    // console.log("ON"+motor+""+manual);
  
};
  function statusoff(){
    if(motor===1){
      showRestrictOFF();
    }else{
    if (manual===0)
    showAlertOFF();
    setManual(0);
    // console.log("OFF"+motor+""+manual);
  }
    };
  

  //front page
  const handleOpenURL = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Don't know how to open URL: " + url);
    }
  };

  const navigateToPestScreen = (pestScreen) => {
    navigation.navigate('Pest Stream', { pestScreen });
  };
  const navigateToDiseaseScreen = (DiseaseScreen) => {
    navigation.navigate('Disease Stream', { DiseaseScreen });
  };
  
    
  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <View style={styles.box_con}>
          <View style={[styles.box, { backgroundColor: temp<30 ? 'lightgreen' : '#F23A3A' }]}>
            <Text>Temperature</Text>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={[styles.textT,{fontSize:30 }]}>{temp} °C</Text>
            </View>
          </View>
          <View style={[styles.box,{backgroundColor:'rgb(151, 212, 250)'}]}>
            <Text>No of Sprinklers</Text>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontSize:30,}}>{counter}</Text>
            </View>
          </View>
        </View>
        <View style={styles.box_con}>
          <View style={[styles.box,{backgroundColor:condition=='SAFE'?'lightgreen':'#F23A3A'}]}>
            <Text>Current Condition</Text>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontSize:30}}>{condition}</Text>
            </View>
          </View>
          <View style={[styles.box,{backgroundColor:status=='ON'?'lightgreen':'#F23A3A'}]}>
            <Text>Status</Text>
            <View style={{flex:1,justifyContent:'center'}}>
              <Text style={{fontSize:30}}>{status}</Text>

            </View>
          </View>
        </View>
        
        <View style={[styles.co,{flex:.45,backgroundColor:'rgb(151, 212, 250)',alignItems:'center',justifyContent:'center'}]}>
          <Text style={{fontSize:28}}>CO2 Level : {co} </Text>
        </View>
        <View style={[styles.button, {flexDirection: 'row' ,justifyContent:'center',alignContent:'center'}]}>
          <Button title="start Sprinkler" color="#2d51a5" onPress={statuson}/>
          <View style={{marginTop:18,marginLeft:5}}></View>
          <Button title="stop Sprinkler" color="#2d51a5" onPress={statusoff}/>

        </View>
        <View style={styles.box_con}>
        <TouchableOpacity onPress={() => navigateToPestScreen(PestScreen)}>
        {/* <TouchableOpacity onPress={openChrome}> */}
        
          <View style={styles.boxStream}><Text style={styles.textStream}>Pest Stream</Text></View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToDiseaseScreen(DiseaseScreen)}>
          <View style={styles.boxStream}><Text style={styles.textStream}>Disease Stream</Text></View>
        </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: 'https://saptharishi-aibot.hf.space/' })}>
        <View style={styles.bot}>
          <Text style={{color:'white',fontSize:20,padding:5}}>Zhagaram GPT</Text>
        </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}


function Logscreen({ navigation }) {
  const [diseaseData, setDiseaseData] = useState([]);
  const [pestData, setPestData] = useState([]);
  const resetData = () => {
    // Reference to the database nodes you want to delete
    const diseaseRef = ref(db, 'Safety/disease');
    const pestRef = ref(db, 'Safety/pest');

  
    update(diseaseRef, {});
    update(pestRef, {});

    
    setDiseaseData([]);
    setPestData([]);

    Alert.alert('Data Reset', 'All data has been deleted from the database.');
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch disease data from Firebase
        const diseaseRef = ref(db, 'Safety/disease');
        onValue(diseaseRef, (snapshot) => {
          const diseases = snapshot.val();
          if (diseases) {
            const diseaseEntries = Object.entries(diseases);
            setDiseaseData(diseaseEntries);
          }
        });

        // Fetch pest data from Firebase
        const pestRef = ref(db, 'Safety/pest');
        onValue(pestRef, (snapshot) => {
          const pests = snapshot.val();
          if (pests) {
            const pestEntries = Object.entries(pests);
            setPestData(pestEntries);
          }
        });
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.logcontainer}>
      <View style={{flex:1,width:380,height:350}}>
      <Text>Disease Data:</Text>
      <View style={styles.disData}>
      
      <FlatList
        data={diseaseData}
        renderItem={({ item }) => (
          <View style={styles.logBox}>
            <Text>Camera : {item[0]}</Text>
            <Text>time : {item[1]}</Text> 
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      </View>
      </View>
      <Text style={{marginTop:20}}>Pest Data:</Text>
      <View style={{flex:1,width:380,height:350}}>
      <View style={styles.pestData}>
      
      <FlatList
        data={pestData}
        renderItem={({ item }) => (
          <View style={styles.logBox}>
            <Text>Camera : {item[0]}</Text>
            <Text>time : {item[1]}</Text> 
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      </View>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Reset Data" onPress={resetData} />
      </View>
    </View>
  );
}


export function PestScreen({ navigation }) {
  const openLink = (url) => {
    Linking.openURL(url); // Function to open the provided URL
  };
  const url = " http://192.168.190.238:5000";

  
  return (
    <ScrollView style={styles.pestcon}>
      <View style={styles.box_co}>
        {/* cam 1 */}
        <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/pcam1' })}>
        <View style={styles.cambox}>
          <View style={styles.circle}>
          <Ionicons name="camera" size={60} color="black"/>
          </View>
          <Text style={{marginTop:5,}}>CAM 1</Text>
        </View>
        </TouchableOpacity>
        {/* cam2  */}
        <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/pcam2' })}>

        <View style={styles.cambox}>
          <View style={styles.circle}>
          <Ionicons name="camera" size={60} color="black"/>
          </View>
          <Text style={{marginTop:5,}}>CAM 2</Text>
        </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.box_co}>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/pcam3' })}>

        <View style={styles.cambox}>
          <View style={styles.circle}>

          <Ionicons name="camera" size={60} color="black"/>
            
          </View>
          <Text style={{marginTop:5,}}>CAM 3</Text>
        </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/pcam4' })}>

        <View style={styles.cambox}>
          <View style={styles.circle}>
          <Ionicons name="camera" size={60} color="black"/>

            
          </View>
          <Text style={{marginTop:5,}}>CAM 4</Text>
        </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.box_co}>
        
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/pcam5' })}>

        <View style={styles.cambox}>
          <View style={styles.circle}>

          <Ionicons name="camera" size={60} color="black"/>
            
          </View>
          <Text style={{marginTop:5,}}>CAM 5</Text>
        </View>
        </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/pcam6' })}>
        

        <View style={styles.cambox}>

          <View style={styles.circle}>

          <Ionicons name="camera" size={60} color="black"/>
            
          </View>
          <Text style={{marginTop:5,}}>CAM 6</Text>
        </View>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}
export function DiseaseScreen({ navigation }) {
  const openLink = (url) => {
    Linking.openURL(url); // Function to open the provided URL
  };
  const url = " http://192.168.190.238:5000"
  return (
    <ScrollView style={styles.pestcon}>
      <View style={styles.box_co}>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam1'})}>

        <View style={styles.cambox}>
          <View style={styles.circle}>
            <Ionicons name="camera" size={60} color="black"/>
            
          </View>
          <Text style={{marginTop:5,}}>CAM 1</Text>
        </View>
        </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam2'})}>

        <View style={styles.cambox}>
          <View style={styles.circle}>
            <Ionicons name="camera" size={60} color="black"/>
            
          </View>
          <Text style={{marginTop:5,}}>CAM 2</Text>
        </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.box_co}>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam3'})}>

        <View style={styles.cambox}>
          <View style={styles.circle}>
          <Ionicons name="camera" size={60} color="black"/>

            
          </View>
          <Text style={{marginTop:5,}}>CAM 3</Text>
        </View>
        </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam4'})}>

        <View style={styles.cambox}>
          <View style={styles.circle}>
          <Ionicons name="camera" size={60} color="black"/>

            
          </View>
          <Text style={{marginTop:5,}}>CAM 4</Text>
        </View>
        </TouchableOpacity>
      </View>
      <View style={styles.box_co}>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam5'})}>
        
        <View style={styles.cambox}>
          <View style={styles.circle}>
          <Ionicons name="camera" size={60} color="black"/>

            
          </View>
          <Text style={{marginTop:5,}}>CAM 5</Text>
        </View>
        </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam6'})}>

        <View style={styles.cambox}>
          <View style={styles.circle}>
          <Ionicons name="camera" size={60} color="black"/>

            
          </View>
          <Text style={{marginTop:5,}}>CAM 6</Text>
        </View>
        </TouchableOpacity>
      </View>
      <View style={styles.box_co}>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam7'})}>

        <View style={styles.cambox}>
          <View style={styles.circle}>

          <Ionicons name="camera" size={60} color="black"/>
            
          </View>
          <Text style={{marginTop:5,}}>CAM 7</Text>
        </View>
        </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CameraView', { url: url+'/dcam8'})}>

        <View style={styles.cambox}>
          <View style={styles.circle}>

          <Ionicons name="camera" size={60} color="black"/>
            
          </View>
          <Text style={{marginTop:5,}}>CAM 8</Text>
        </View>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'black',
        },
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen
        name="DashBoard"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <Ionicons
              name="document-text"
              size={40}
              color="white"
              style={{ marginRight: 10 }}
              onPress={() => navigation.navigate('Logs')}
            />
          ),
        })}
      />
      <Stack.Screen
        name="Logs"
        component={Logscreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ marginRight: 15, fontSize: 17 }}>Back</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Pest Stream"
        component={PestScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ marginRight: 15, fontSize: 17 }}>Back</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Disease Stream"
        component={DiseaseScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ marginRight: 15, fontSize: 17 }}>Back</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};
const CameraView = ({ route }) => {
  const { url } = route.params;

  return (
    <View style={styles.camera}>
      <WebView source={{ uri: url }} />
    </View>
  );
};
export default function App() {
  const navigateToLogScreen = (navigation,Logscreen) => {
    navigation.navigate('Logs', { Logscreen });
  };
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DashBoard"
        screenOptions={{
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTintColor: 'white',
        }}
      >
        <Stack.Screen
          name="DashBoard"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <Ionicons
                name="document-text"
                size={40}
                color="white"
                style={{ marginRight: 10 }}
                onPress={() => navigation.navigate('Logs')} // Navigate to Logs screen
              />
            ),
          })}
        />
        
        <Stack.Screen
          name="Logs"
          component={Logscreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ marginRight: 15, fontSize: 17 }}>Back</Text>
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name="Pest Stream"
          component={PestScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ marginRight: 15, fontSize: 17 }}>Back</Text>
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen
          name="Disease Stream"
          component={DiseaseScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ marginRight: 15, fontSize: 17 }}>Back</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
        name="CameraView"
        component={CameraView} // Add this line
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  nav:{
    flexDirection:'row',
    backgroundColor:"#EC7505",
    
    alignItems:'center',
    justifyContent:'space-between',

  },content:{
    flex:1,
    // backgroundColor:'#FFB169',
    backgroundColor:'white',

    paddingTop:1,
    // justifyContent:'space-between',
    paddingLeft:37,
    paddingRight:37,

  },box:{
    backgroundColor:'white',
    width:150,
    height:150,
    borderRadius:20,
    borderWidth:3,
    borderColor:'black',
    padding:10,
    alignItems:'center',
    
  },box_con:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingTop:25,
  },co:{
    backgroundColor:'black',
    width:337,height:60,borderRadius:20,marginTop:35,borderWidth:3,
    borderColor:'black',
  },button:{
    paddingLeft:5,paddingTop:20,paddingRight:20
  },boxStream:{
    backgroundColor:'#D43725',
    width:160,
    height:70,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center'
  },textStream:{
    fontSize:18,
    color:'white',

  },textT:{
    fontSize:16,
  },
  //pest screen styles
  pestcon:{
    flex:1,
    // backgroundColor:'#FFB169',
    backgroundColor:'white',


    paddingTop:15,
  },box_co:{
    justifyContent:'space-between',
    flexDirection:'row',
    padding:30,
    
  },
  cambox:{
    width:150,
    height:150,
    backgroundColor:'#6987c9',
    borderRadius:20,
    
    justifyContent:'center',
    alignItems:'center',
    
  },
  circle:{
    backgroundColor:'#F4AC45',
    width:100,
    height:100,
    borderRadius:50,
    justifyContent:'center',
    alignItems:'center',
  },
  // logscreen
  logcontainer:{
    padding:15,
    flex:1,

  },
  disData:{
    borderColor:'black',
    borderWidth:3,
    padding:5,
    margin:5,
  },
  pestData:{
    borderColor:'black',
    borderWidth:3,
    padding:5,
    margin:5,

  },
  logBox:{
    backgroundColor:'#d3d3d3',
    margin:3,
    padding:6,
    borderRadius:8,
    paddingLeft:10,
  },bot:{
    backgroundColor:'purple',
    marginTop:25,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:5,

    
  },camera:{
    flex:1,
  }



});