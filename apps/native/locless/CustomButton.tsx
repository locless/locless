import { Animated, TouchableOpacity } from 'react-native';

interface Props {
  count: number;
  onPressCallback: () => void;
}

function CustomButton({ count, onPressCallback }: Props) {
  return (
    <TouchableOpacity onPress={() => onPressCallback()}>
      <Animated.Text children={`Click here! Clicks: ${count}`} />
    </TouchableOpacity>
  );
}

export default CustomButton;
