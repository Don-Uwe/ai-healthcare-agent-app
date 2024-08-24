import {useState, type RefObject} from 'react';
import {TextInput, View, StyleSheet} from 'react-native';
import {hp} from '../helper/Metric';

interface OTPInputProps {
  codes: string[];
  refs: RefObject<TextInput>[];
  errorMessages: string[] | undefined;
  onChangeCode: (text: string, index: number) => void;
  config: OTPInputConfig;
}

export type OTPInputConfig = {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  errorColor: string;
  focusColor: string;
};

export function OTPInput({
  codes,
  refs,
  errorMessages,
  onChangeCode,
  config, // Receive the configuration object as a prop
}: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '80%',
      justifyContent: 'space-around',
      marginVertical: hp(2),
    },
    input: {
      fontSize: 16,
      height: 48,
      width: 48,
      borderRadius: 8,
      textAlign: 'center',
      backgroundColor: config.backgroundColor,
      color: config.textColor,
      borderColor: config.borderColor,
      borderWidth: 2,
    },
    errorInput: {
      borderColor: config.errorColor,
      color: config.errorColor,
    },
    focusedInput: {
      borderColor: config.focusColor,
    },
  });

  const handleFocus = (index: number) => setFocusedIndex(index);
  const handleBlur = () => setFocusedIndex(null);

  return (
    <View style={styles.container}>
      {codes.map((code, index) => (
        <TextInput
          key={index}
          autoComplete="one-time-code"
          enterKeyHint="next"
          style={[
            styles.input,
            errorMessages && styles.errorInput,
            focusedIndex === index && styles.focusedInput,
          ]}
          inputMode="numeric"
          onChangeText={text => onChangeCode(text, index)}
          value={code}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          maxLength={index === 0 ? codes.length : 1}
          ref={refs[index]}
          onKeyPress={({nativeEvent: {key}}) => {
            if (key === 'Backspace' && index > 0) {
              onChangeCode('', index - 1);
              refs[index - 1]!.current!.focus();
            }
          }}
        />
      ))}
    </View>
  );
}
