import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import CONST from "../CONST/CONST";

const MARKER_IMAGE = require("../../Image/36722673_1023944331106468_2782270902291660800_n.png");

const { width, height } = Dimensions.get("window");

const SCREEN_WIDTH = width;
const SCREEN_HEIGHT = height;
const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
const LATITUDE_DELTA = 1;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

function parseJson(response) {
  return response.text().then(text => {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Server did not return JSON");
    }
  });
}

function isPlacedMarker(marker) {
  return (
    marker &&
    marker.coordinates &&
    !isNaN(marker.coordinates.latitude) &&
    !isNaN(marker.coordinates.longitude)
  );
}

function regionContaining(markers) {
  const PADDING = 1.3;
  const MIN_DELTA = 0.05;

  let minLat = markers[0].coordinates.latitude;
  let maxLat = minLat;
  let minLng = markers[0].coordinates.longitude;
  let maxLng = minLng;

  for (let i = 1; i < markers.length; i++) {
    const { latitude, longitude } = markers[i].coordinates;
    if (latitude < minLat) minLat = latitude;
    if (latitude > maxLat) maxLat = latitude;
    if (longitude < minLng) minLng = longitude;
    if (longitude > maxLng) maxLng = longitude;
  }

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  let latitudeDelta = Math.max((maxLat - minLat) * PADDING, MIN_DELTA);
  let longitudeDelta = Math.max((maxLng - minLng) * PADDING, MIN_DELTA);

  if (longitudeDelta < latitudeDelta * ASPECT_RATIO) {
    longitudeDelta = latitudeDelta * ASPECT_RATIO;
  } else {
    latitudeDelta = longitudeDelta / ASPECT_RATIO;
  }

  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      userLocation: null,
      selectedMarker: null,
      initialPosition: {
        latitude: 15.082304,
        longitude: 108.095521,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    };
  }
  /* gps các thứ các thứ
  watchID = null;

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        var lat = parseFloat(position.coordinate.latitude);
        var long = parseFloat(position.coordinate.longitude);

        var initialRegion = {
          latitude: lat,
          longitude: long,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        };

        this.setState({ initialPosition: initialRegion });
        this.setState({ markerPosition: initialRegion });
      },

      error => alert(JSON.stringify(error)),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lat = parseFloat(position.coordinate.latitude);
      var long = parseFloat(position.coordinate.longitude);

      var lastRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      };

      this.setState({ initialPosition: lastRegion });
      this.setState({ markerPosition: lastRegion });
    });
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }
*/

  locationSubscription = null;

  componentDidMount() {
    this.startLocationUpdates();

    if (!CONST.USE_BACKEND) {
      const markers = CONST.DEMO_MARKERS;
      this.setState({ markers }, () => {
        this.fitToMarkers(markers);
      });
      return;
    }

    let collection = {};
    (collection.sessionid = this.props.sessionid),
      (collection.are_parent = "R.1"),

      fetch(CONST.URL + "/area/getareabranchbyparent", {
        method: "POST", // or 'PUT'
        body: JSON.stringify(collection), // data can be `string` or {object}!
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      })
        .then(parseJson)
        .then(response => {
          if (response.code == 200) {
            for (let i = 0; i < response.result.length; i++) {
              this.myFunction(response.result[i].obj_id,response.result[i].are_name,i);
            }
          } else {
            console.log(response);
          }
        })
        .catch(error => console.error("Error:", error));
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    if (this.locationSubscription) {
      this.locationSubscription.remove();
    }
  }

  startLocationUpdates() {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") {
          return null;
        }
        return Location.getCurrentPositionAsync({}).then(location => {
          this.setUserLocation(location);
          return Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 10
            },
            loc => this.setUserLocation(loc)
          );
        });
      })
      .then(subscription => {
        if (this.isUnmounted) {
          if (subscription) {
            subscription.remove();
          }
          return;
        }
        if (subscription) {
          this.locationSubscription = subscription;
        }
      })
      .catch(error => console.error("Location:", error));
  }

  setUserLocation(location) {
    this.setState({
      userLocation: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    });
  }

  fitToMarkers(markers) {
    const placed = markers.filter(isPlacedMarker);
    if (!placed.length || !this.mapRef) {
      return;
    }
    this.mapRef.animateToRegion(regionContaining(placed));
  }

  myFunction(obj_id, are_name, index) {
    // get 1 địa điểm
    fetch(CONST.URL + "/property/getpropertybyobjid", {
      method: "POST", // or 'PUT'
      body: JSON.stringify({
        sessionid: this.props.sessionid,
        obj_id: obj_id
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then(parseJson)
      .then(response => {
        if (response.code == 200) {
          var lat;
          var long;
          for (let i = 0; i < response.property.length; i++) {
            if (response.property[i].name == "Latitude") {
              lat = response.property[i].value;
            }
            if (response.property[i].name == "Longitude") {
              long = response.property[i].value;
            }
          }

          var x = {
            coordinates: {
              latitude: parseFloat(lat),
              longitude: parseFloat(long)
            },
            index: index + 1,
            title: are_name
          };
          const markers = this.state.markers.slice();
          markers[index] = x;

          this.setState({ markers }, () => {
            this.fitToMarkers(markers);
          });
        }
      })
      .catch(error => console.error("myError:", error));
  }

  onMapPress(event) {
    if (event.nativeEvent.action === "marker-press") {
      return;
    }
    this.setState({ selectedMarker: null });
  }

  render() {
    const { selectedMarker } = this.state;

    return (
      <View style={styles.container} pointerEvents="box-none">
        <MapView
          ref={ref => {
            this.mapRef = ref;
          }}
          style={styles.map}
          initialRegion={this.state.initialPosition}
          showsUserLocation
          onPress={event => this.onMapPress(event)}
        >
          {this.state.markers.filter(isPlacedMarker).map((marker, index) => (
            <Marker
              key={index}
              coordinate={marker.coordinates}
              image={MARKER_IMAGE}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => this.setState({ selectedMarker: marker })}
            />
          ))}
        </MapView>
        {selectedMarker && (
          <View style={styles.detailsCard}>
            <TouchableOpacity
              style={styles.detailsClose}
              onPress={() => this.setState({ selectedMarker: null })}
            >
              <Text style={styles.detailsCloseText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.detailsTitle}>{selectedMarker.title}</Text>
            <Text style={styles.detailsCoords}>
              {selectedMarker.coordinates.latitude.toFixed(6)},{" "}
              {selectedMarker.coordinates.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  detailsCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  detailsClose: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
    zIndex: 1
  },
  detailsCloseText: {
    color: "rgba(41, 128, 185, 1.0)",
    fontWeight: "700",
    fontSize: 16
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    paddingRight: 24,
    marginBottom: 8
  },
  detailsCoords: {
    fontSize: 14,
    color: "#555"
  }
});
