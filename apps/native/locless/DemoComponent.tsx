import { useMemo, useState } from 'react';
import { Animated, Alert, StyleSheet } from 'react-native';
import CustomButton from '../src/components/CustomButton';

interface ILocProps {
  name?: string;
}

export default function ServerComponent({ name = 'world' }: ILocProps) {
  const message = useMemo(() => `Hey, ${name}!`, [name]);

  const [state, setState] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const onPressCallback = () => {
    Alert.alert('You clicked the button! Congratulations!');
    setState(s => (s === 'red' ? 'yellow' : 'red'));
    setCount(s => s + 1);
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: state ?? 'yellow' }]}>
      <Animated.Text>{message}</Animated.Text>
      <CustomButton onPressCallback={onPressCallback} count={count} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
