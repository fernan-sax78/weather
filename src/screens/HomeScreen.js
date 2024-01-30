
import  { useState , useCallback , useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image,
  Text, 
  TextInput, 
  View  , 
  TouchableOpacity , 
  ScrollView
} from 'react-native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapPinIcon , CalendarDaysIcon}from 'react-native-heroicons/solid';
import { debounce } from 'lodash';
import { theme } from '../theme';
import { weatherImages } from '../../constants/index';
import * as Progress from 'react-native-progress';
import { getData , storeData } from '../../utils/asyncStorage';
import { fetchLocations, fetchWeatherForecast } from '../../api/weather';



export default function App() {
  
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date().toLocaleString())



  const handleLocation = (loc) => {
    //console.log(`Location : ${loc}`);
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName : loc.name ,
      days : 7 ,
    }).then(data => {
      setWeather(data);
      setLoading(false);
      storeData('city' , loc.name);
      //console.log(data);
    })
  }

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({cityName : value}).then(data => {
        setLocations(data);
      })
    }
  }

  useEffect(() => {
   fetchMyWeatherData();
  }, []);

  useEffect(() => {
    let secTimer = setInterval( () => {
      setTime(new Date().toLocaleString())
    },1000)
    return () => clearInterval(secTimer)
  }, [])
  
  
  const fetchMyWeatherData = async () => {
      let myCity = await getData('city');
      let cityName = 'Havana';
      myCity ? cityName = myCity : '';
      fetchWeatherForecast({
        cityName : cityName,
        days : '7',
      }).then(data => {
        setWeather(data);
        setLoading(false);
      })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch , 1200) , []);

  const { location , current } = weather ; 

  const weatherInfo = [
  {
    id : 1 ,
    img : require('../../assets/icons/wind.png'),
    measure : `${current?.wind_kph} km`
  },
  {
    id : 2 ,
    img : require('../../assets/icons/drop.png'),
    measure : `${current?.humidity}%`
  },
  {
    id : 3 ,
    img : require('../../assets/icons/sun.png'),
    measure : `${weather?.forecast?.forecastday[0]?.astro?.sunrise}`
  },
]

  return (
    <View className = "flex-1 relative" >
      <StatusBar style="light" />
      <Image 
      blurRadius = {20}
      source = {require('../../assets/images/weather_img.png')}
      className = "absolute h-full w-full"
      />
          
          {loading ? (
            <View className = "flex-1 flex-row justify-center items-center ">
              <Progress.CircleSnail size={60} color = "#fff" thikness = {10} />                       
            </View>
          ):(
       <ScrollView contentContainerStyle = {{marginTop : 60}} bounces = {false}>
        
        <View className = "mx-4 relative z-50" style ={{height : '7%'}} contentContainerStyle = {{flex : 1}}>
          <View 
          className = "flex-row justify-end items-center rounded-full pt-0 pb-0" 
          style = {{backgroundColor : showSearch ? theme.bgWhite(0.2) : 'transparent'}}
          >
            {
              showSearch ? (
                <TextInput
                onChangeText = {handleTextDebounce}
                placeholder = "Search City"
                placeholderTextColor = {'lightgray'}
                className = "pl-6 h-10 pb-1 text-base text-white flex-1"
                />
              ) : null
            }
            <TouchableOpacity 
            onPress = {() => setShowSearch(!showSearch)}
            className="rounded-full p-3 m-1" 
            style={{backgroundColor: theme.bgWhite(0.3)}}
           
            >
            {/* search icon here */}
            < MagnifyingGlassIcon size="25" color="white" />
            </TouchableOpacity>
          </View>
          {
            locations.length > 0 && showSearch ? (
              <View className = "absolute w-full bg-gray-300 top-16 rounded-3xl">
                  {locations.map((loc , index) => {
                    let showBorder = index + 1 !== locations.length;
                    let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';
                    return (
                      <TouchableOpacity
                      onPress = {() => handleLocation(loc)}
                      key = {index}
                      className = {`flex-row items-center border-0 p-3 px-4 mb-1 ${borderClass}`}
                      >
                        <MapPinIcon size={20} color= "gray" />
                        <Text className = "text-black text-lg ml-2" >{loc?.name} , {loc?.country}</Text>
                      </TouchableOpacity>
                    )
                  })}
              </View>
            ) : null
          }
          </View>

        <View
        className = "mx-4 flex justify-around flex-1 mb-2 mt-5"
        >
          <Text className = "text-white text-center text-xl font-bold">
            { location?.name },
            <Text className = "text-lg text-gray-300 font-semibold">
              { ` ${location?.country}` }
            </Text>
          </Text>
                <View className="flex-row justify-center my-2">
                  <Image 
                    source={weatherImages[current?.condition?.text || 'other']}
                    className="w-52 h-52" />
                  
                </View>  

                <View className="space-y-2  mb-4">
                    <Text className="text-center font-bold text-white text-6xl ml-5">
                      {current?.temp_c}&#176;
                    </Text>
                    <Text className="text-center text-white text-xl tracking-widest">
                      {current?.condition?.text}
                    </Text>
                </View>  

                <View className="flex-row justify-between mx-4">
                 {weatherInfo.map((weather) => {
                  return (

                  <View key = {weather.id} className="flex-row space-x-2 items-center">
                    <Image source={weather.img} className="w-6 h-6" />
                    <Text className="text-white font-semibold text-base">{weather.measure}</Text>
                  </View>                    
                  )

                 }
                 )}                
                </View>      
        </View>

        <View className="mb-2 space-y-3">
                <View className="flex-row items-center mx-5 space-x-2 my-5">
                  <CalendarDaysIcon size="22" color="white" />
                  <Text className="text-white text-base">Daily forecast</Text>
                </View>  
                  <ScrollView   
                  horizontal
                  contentContainerStyle={{paddingHorizontal: 15}}
                  showsHorizontalScrollIndicator={false}
                >
                  {
                      weather?.forecast?.forecastday?.map((item,index)=>{
                      const date = new Date(item.date);
                      const options = { weekday: 'long' };
                      let dayName = date.toLocaleDateString('en-US', options);
                      dayName = dayName.split(',')[0];



                      return (
                        <View 
                          key={index} 
                          className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4" 
                          style={{backgroundColor: theme.bgWhite(0.15)}}
                        >
                          <Image 
                              source= {weatherImages[item?.day?.condition?.text || 'other'] }// {{uri: 'https:'+item?.day?.condition?.icon}}
                           
                              className="w-11 h-11" />
                          <Text className="text-white">{dayName}</Text>
                          <Text className="text-white text-xl font-semibold">
                            {item?.day?.avgtemp_c}&#176;
                          </Text>
                        </View>
                      )
                    })
                  }
                  
                </ScrollView>     
           
            </View>  
     
             <Text className = "text-lg text-yellow-400 font-semibold text-center mb-2 mt-5">
               {time}
             </Text>
             <Text 
                  className = "text-lg text-gray-300 font-semibold text-center mb-5">
                    WEATHER APP BY TITODEV.UK 
             </Text> 

       </ScrollView>
          )}

    </View>
  );
}

