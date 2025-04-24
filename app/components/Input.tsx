import { TextInput, View } from "react-native";

interface InputProps {
  placeholder: string;
  secureTextEntry?: boolean;
  className? :string
}

export default function Input({ placeholder, secureTextEntry = false,className }: InputProps) {
  return (
    <View className={`border border-purple-600 rounded-3xl pl-2 ${className} `}>
      <TextInput 
        className="text-black" 
        placeholder={placeholder} 
        secureTextEntry={secureTextEntry} 
        placeholderTextColor="gray"
      />
    </View>
  );
}
