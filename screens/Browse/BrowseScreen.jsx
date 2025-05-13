import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'


const BrowseScreen = () => {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#9C3141' }}>
        <Text style={{ color: '#fff', fontSize: 24, padding: 20 }}>Browse</Text>
      </View>
    <View>
    </View>
    </SafeAreaProvider>
  )
}

export default BrowseScreen