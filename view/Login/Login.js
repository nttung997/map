import React, { Component } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar
} from "react-native";

import Map from "../Map/Map";
import CONST from "../CONST/CONST";

function parseJson(response) {
  return response.text().then(text => {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Server did not return JSON");
    }
  });
}

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      password: "",
      username: "",
      loggedIn: false,
      error: "",
      sessionid: null,
      keyboardVisible: false
    };
  }
  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => this.setState({ keyboardVisible: true })
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => this.setState({ keyboardVisible: false })
    );
  }
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  updateValue(text, field) {
    if (field == "username") {
      this.setState({ username: text });
    } else if (field == "password") {
      this.setState({ password: text });
    }
  }
  submit() {
    this.setState({ error: "" });

    if (!CONST.USE_BACKEND) {
      this.setState({ loggedIn: true, sessionid: "demo" });
      return;
    }

    const collection = {
      usr_name: this.state.username,
      usr_pwd: this.state.password,
      device_type: "web",
      app: "sdes"
    };

    fetch(CONST.URL + "/user/login", {
      method: "POST",
      body: JSON.stringify(collection),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then(parseJson)
      .then(response => {
        if (response.code == 200) {
          this.setState({
            sessionid: response.sessionid,
            loggedIn: true,
            error: ""
          });
        } else {
          this.setState({
            error: response.description || "Login failed"
          });
        }
      })
      .catch(error => {
        console.error("Error:", error);
        this.setState({ error: "Không kết nối được máy chủ" });
      });
  }
  render() {
    if (!this.state.loggedIn) {
      return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          {!this.state.keyboardVisible && (
            <View style={styles.logo_container}>
              <Image
                style={styles.logo}
                source={require("../../Image/anh.png")}
              />
            </View>
          )}
          <View style={styles.login_form}>
            <View style={styles.login_form_container}>
              <StatusBar barStyle="light-content" />
              <TextInput
                style={styles.input}
                placeholder="username"
                onChangeText={text => this.updateValue(text, "username")}
                returnKeyType="next"
                onSubmitEditing={() => this.passwordInput.focus()}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="password"
                onChangeText={text => this.updateValue(text, "password")}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={() => this.submit()}
                ref={input => (this.passwordInput = input)}
              />
              <TouchableOpacity
                onPress={() => this.submit()}
                style={styles.buttonContainer}
              >
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>
              {!!this.state.error && (
                <Text style={styles.errorText}>{this.state.error}</Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      );
    } else {
      return <Map sessionid={this.state.sessionid} />;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db"
  },
  logo_container: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16
  },
  logo: {
    width: "50%",
    aspectRatio: 2.2,
    resizeMode: "contain"
  },
  login_form: {
    flex: 1,
    justifyContent: "flex-end"
  },
  login_form_container: {
    padding: 20
  },
  input: {
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 20,
    color: "#FFF",
    paddingHorizontal: 10
  },
  buttonContainer: {
    backgroundColor: "rgba(41, 128, 185,1.0)",
    paddingVertical: 15
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700"
  },
  errorText: {
    marginTop: 12,
    color: "#fff",
    textAlign: "center"
  }
});
