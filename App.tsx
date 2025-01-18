import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import MapView, {Marker, Polygon, Circle} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [fenceCoordinates, setFenceCoordinates] = useState([]);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const mapRef = useRef<MapView>(null);

  const defaultLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Get user's current location
  const getUserLocation = () => {
    Geolocation.getCurrentPosition(position => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    });
  };

  // Request location permissions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getUserLocation();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getUserLocation();
    }
  };

  // Center map on current location
  const centerLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Toggle drawing mode
  const toggleDrawing = () => {
    if (isDrawing) {
      if (fenceCoordinates.length < 3) {
        Alert.alert('Error', 'Please draw at least 3 points for the fence');
        return;
      }
    }
    setIsDrawing(!isDrawing);
  };

  // Handle map press for drawing
  const handleMapPress = event => {
    if (isDrawing) {
      const {coordinate} = event.nativeEvent;
      setFenceCoordinates([...fenceCoordinates, coordinate]);
    }
  };

  // Clear drawn fence
  const clearFence = () => {
    setFenceCoordinates([]);
    setIsDrawing(false);
  };

  // Check if point is inside polygon
  const isPointInPolygon = (point, polygon) => {
    if (polygon.length < 3) return false;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].latitude;
      const yi = polygon[i].longitude;
      const xj = polygon[j].latitude;
      const yj = polygon[j].longitude;

      const intersect =
        yi > point.longitude !== yj > point.longitude &&
        point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Monitor location and check geofence
  useEffect(() => {
    requestLocationPermission();

    const watchId = Geolocation.watchPosition(
      position => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setLocation(newLocation);

        // Check if user is inside geofence
        if (fenceCoordinates.length >= 3) {
          const inside = isPointInPolygon(
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            fenceCoordinates,
          );

          if (inside !== isInsideGeofence) {
            setIsInsideGeofence(inside);
            Alert.alert(
              'Geofence Alert',
              inside ? 'Entered geofence area!' : 'Left geofence area!',
            );
          }
        }
      },
      error => console.log(error),
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    return () => Geolocation.clearWatch(watchId);
  }, [fenceCoordinates, isInsideGeofence]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={location || defaultLocation}
        showsUserLocation={true}
        onPress={handleMapPress}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
        )}
        {fenceCoordinates.length >= 3 && (
          <Polygon
            coordinates={fenceCoordinates}
            fillColor="rgba(255, 0, 0, 0.2)"
            strokeColor="rgba(255, 0, 0, 0.8)"
            strokeWidth={2}
          />
        )}
        {fenceCoordinates.map((coord, index) => (
          <Circle
            key={index}
            center={coord}
            radius={5}
            fillColor="rgba(0, 0, 255, 0.7)"
            strokeColor="rgba(0, 0, 255, 0.9)"
          />
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={centerLocation}>
          <Text style={styles.buttonText}>Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isDrawing && styles.activeButton]}
          onPress={toggleDrawing}>
          <Text style={styles.buttonText}>
            {isDrawing ? 'Finish Drawing' : 'Start Drawing'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={clearFence}>
          <Text style={styles.buttonText}>Clear Fence</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {fenceCoordinates.length >= 3
            ? isInsideGeofence
              ? 'Inside Geofence'
              : 'Outside Geofence'
            : 'No Geofence Set'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 80,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  statusBar: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default App;
