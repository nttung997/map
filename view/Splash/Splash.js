import React, {Component} from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class Splash extends Component {
  
    render() {
      return (
        <View style={styles.container}>
          <Text style={{fontSize:20}}>LOADING ...</Text>       
        </View>
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#3498db',
      alignItems: 'center',
      justifyContent: 'center',
      
    },
  });
  