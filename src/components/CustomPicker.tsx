import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Picker as RNPicker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PickerItem {
  label: string;
  value: string | number;
}

interface CustomPickerProps {
  label: string;
  selectedValue: string | number;
  onValueChange: (itemValue: string | number) => void;
  items: PickerItem[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  icon?: string;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  disabled = false,
  error = false,
  helperText,
  placeholder = 'Select an option',
  icon,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState(selectedValue);

  const selectedItem = items.find(item => item.value === selectedValue);
  const displayValue = selectedItem ? selectedItem.label : placeholder;

  const handleConfirm = () => {
    onValueChange(pickerValue);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setPickerValue(selectedValue);
    setModalVisible(false);
  };

  const renderPicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          isVisible={modalVisible}
          onBackdropPress={handleCancel}
          onBackButtonPress={handleCancel}
          style={styles.modal}
          backdropTransitionOutTiming={0}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <RNPicker
                selectedValue={pickerValue}
                onValueChange={(itemValue) => setPickerValue(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {items.map((item) => (
                  <RNPicker.Item
                    key={item.value.toString()}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </RNPicker>
            </View>
          </View>
        </Modal>
      );
    }

    // Android
    return (
      <RNPicker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.picker, styles.androidPicker]}
        dropdownIconColor={theme.colors.primary}
        dropdownIconRippleColor={theme.colors.primary + '33'}
        mode="dropdown"
        enabled={!disabled}
      >
        {items.map((item) => (
          <RNPicker.Item
            key={item.value.toString()}
            label={item.label}
            value={item.value}
          />
        ))}
      </RNPicker>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && { color: theme.colors.error }]}>{label}</Text>
      
      {Platform.OS === 'ios' ? (
        <TouchableOpacity
          style={[
            styles.pickerButton,
            disabled && styles.disabledButton,
            error && { borderColor: theme.colors.error },
          ]}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
        >
          <View style={styles.buttonContent}>
            {icon && (
              <Icon
                name={icon}
                size={20}
                color={disabled ? theme.colors.disabled : theme.colors.primary}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.buttonText,
                { color: disabled ? theme.colors.disabled : theme.colors.text },
                !selectedItem && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {displayValue}
            </Text>
          </View>
          <Icon
            name="chevron-down"
            size={20}
            color={disabled ? theme.colors.disabled : theme.colors.primary}
          />
        </TouchableOpacity>
      ) : (
        <View style={[styles.androidContainer, disabled && styles.disabledButton]}>
          {renderPicker()}
        </View>
      )}
      
      {helperText && (
        <Text style={[
          styles.helperText,
          error && { color: theme.colors.error }
        ]}>
          {helperText}
        </Text>
      )}
      
      {renderPicker()}
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: 'rgba(0, 0, 0, 0.38)', // Material Design disabled text color
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  confirmButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
  },
  androidContainer: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  androidPicker: {
    height: 50,
  },
});

export default CustomPicker;
