import React, { Component } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import CONST from "../CONST/CONST";

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

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [
      ],
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

  componentDidMount() {
    if (!CONST.USE_BACKEND) {
      this.setState({ markers: CONST.DEMO_MARKERS });
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
          this.state.markers[index] = x;

          this.setState({ markers: this.state.markers });
        }
      })
      .catch(error => console.error("myError:", error));
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView style={styles.map} region={this.state.initialPosition}>
          {this.state.markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={marker.coordinates}
              title={marker.title}
            />
          ))}
        </MapView>
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
  }
});
