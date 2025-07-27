import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  mode = 'datetime',
  disabled = false,
  error = false,
  helperText,
}) => {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  
  const formatDisplay = (date: Date) => {
    if (mode === 'date') {
      return format(date, 'MMM d, yyyy');
    } else if (mode === 'time') {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || value;
    setShowPicker(Platform.OS === 'ios');
    onChange(currentDate);
  };

  const showMode = () => {
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && { color: theme.colors.error }]}>{label}</Text>
      
      <Button
        mode="outlined"
        onPress={showMode}
        disabled={disabled}
        style={[styles.button, error && { borderColor: theme.colors.error }]}
        contentStyle={styles.buttonContent}
      >
        <Text style={[styles.buttonText, disabled && { color: theme.colors.disabled }]}>
          {formatDisplay(value)}
        </Text>
      </Button>
      
      {helperText && (
        <Text 
          style={[
            styles.helperText, 
            error && { color: theme.colors.error }
          ]}
        >
          {helperText}
        </Text>
      )}

      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <>
              <View style={styles.modalOverlay} />
              <View style={styles.iosPickerContainer}>
                <View style={styles.iosHeader}>
                  <Button onPress={() => setShowPicker(false)}>Done</Button>
                </View>
                <DateTimePicker
                  value={value}
                  mode={mode}
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  themeVariant="light"
                />
              </View>
            </>
          ) : (
            <DateTimePicker
              value={value}
              mode={mode}
              display="default"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  button: {
    backgroundColor: '#fff',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 4,
    justifyContent: 'flex-start',
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'left',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  iosPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
    zIndex: 1000,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default CustomDateTimePicker;
