import {
    ColorSchemeName,
    useColorScheme as useRNColorScheme,
  } from "react-native";
  
  export default function useColorScheme(): ColorSchemeName {
    return useRNColorScheme();
  }
  