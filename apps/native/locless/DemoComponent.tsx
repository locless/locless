import { useMemo, useState, useEffect } from 'react';
import { Animated, Alert, StyleSheet } from 'react-native';
import CustomButton from '../src/components/CustomButton';

interface ILocProps {
  name?: string;
}

export default function ServerComponent({ name = 'world' }: ILocProps) {
  const message = useMemo(() => `Hi, ${name}!`, [name]);

  const [state, setState] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const onPressCallback = () => {
    Alert.alert('You clicked the button!');
    setState(s => (s === 'green' ? 'red' : 'green'));
    setCount(s => s + 1);
  };

  useEffect(() => {
    Alert.alert('Component mounted!');
  }, []);

  return (
    <Animated.View style={[styles.container, { backgroundColor: state ?? 'red' }]}>
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
