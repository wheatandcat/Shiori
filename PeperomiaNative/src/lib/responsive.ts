import { Dimensions, PixelRatio } from 'react-native';

const devices = {
  iPhoneSe: { width: 640 },
};

// https://stackoverflow.com/questions/39211518/how-to-get-the-correct-screen-width-in-react-native-ios
const fetchDeviceWidth = () =>
  Dimensions.get('window').width * PixelRatio.get();

const maxWidth = (max: number, yes: number, no: number) =>
  max >= fetchDeviceWidth() ? yes : no;

const whenIPhoneSE = (yes: number, no: number) =>
  maxWidth(devices.iPhoneSe.width, yes, no);

export { whenIPhoneSE };
