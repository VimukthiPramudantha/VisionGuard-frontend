// components/ui/AuthInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';

interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  icon?: 'email' | 'password';
}

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon = 'email',
}: AuthInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputForm}>
        {icon === 'email' ? (
          <Mail size={20} color="#666" />
        ) : (
          <Lock size={20} color="#666" />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: '#151717',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 4,
  },
  inputForm: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ecedec',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#151717',
  },
});