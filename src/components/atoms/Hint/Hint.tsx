import React, { FC, memo, useState, useCallback, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import EStyleSheet from 'react-native-extended-stylesheet';
import useIsFirstRender from 'hooks/useIsFirstRender';
import BottomRight from './BottomRight';

type Props = {
  onPress: () => void;
  testID: string;
};

type State = {
  visible: boolean;
};

const Hint: FC<Props> = memo((props) => {
  const [state, setState] = useState<State>({
    visible: false,
  });
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (!isFirstRender) return;
    const setup = async () => {
      const visible = await AsyncStorage.getItem('FIRST_CREATE_ITEM');

      setState({
        visible: !visible,
      });
    };

    setup();
  }, [isFirstRender]);

  const onPushPress = useCallback(() => {
    setState({
      visible: false,
    });

    AsyncStorage.setItem('FIRST_CREATE_ITEM', 'true');
    props.onPress();
  }, [props]);

  if (!state.visible) {
    return (
      <TouchableOpacity onPress={props.onPress} testID={props.testID}>
        {props.children}
      </TouchableOpacity>
    );
  }

  return (
    <>
      <BottomRight />
      <TouchableOpacity
        onPress={onPushPress}
        testID={props.testID}
        style={styles.tap}
      >
        {props.children}
      </TouchableOpacity>
    </>
  );
});

const styles = EStyleSheet.create({
  tap: { padding: 5 },
});

export default Hint;
