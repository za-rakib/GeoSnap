# GeoSnap

A mobile app that displays an interactive map where users can explore and view geographic data, search for locations, and access details about specific points of interest (POIs). The app supports offline map caching, real-time geolocation, and routing.

This has been developed using `React Native` for both `iOS` and `Android`.
Currently using Node v18.16.0 , java 20.0.2 and Ruby version 3.0.0p0 to build.

## Features

Load Current Location

Displays the user's current location on an interactive map.
Includes a button to recenter the map to the user's location.
Initiate Geofencing

Enables users to create geofences on the map by defining specific areas.
Draw Geofences on the Map

Allows users to draw polygons or circles on the map to represent geofenced areas.
Highlights selected areas with custom colors (e.g., semi-transparent blue or green).

## Technologies Used

- **React Native**
- **React Native Maps**
- **React Native Geolocation**

## Installation

1. Clone the repo:

   ```bash
   git@github.com:za-rakib/GeoSnap.git
   ```

2. Install dependencies:

   ```bash
   npm install

   cd ios
   pod install
   ```

3. Run the app:

### using npm

```bash
npm start
```

4: Start Application

### For Android

```bash
# using npm
npm run android
```

## Apk

[![Download Apk]](https://drive.google.com/file/d/1gcWHZDmlY9cc4k9gingF72xir1YGyAvR/view?usp=sharing)
