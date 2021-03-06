import React from 'react';
import { View, Text, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from 'config/theme';

type Props = {
  text: string;
  width: number;
  icon: string;
};

export default (props: Props) => (
  <View
    style={[
      styles.container,
      {
        width: props.width,
      },
    ]}
  >
    <MaterialCommunityIcons
      name={props.icon}
      color={theme().color.secondary.main}
      size={24}
      style={styles.icon}
    />
    <Text style={styles.text}>{props.text}</Text>
  </View>
);

const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme().color.base.pale,
    backgroundColor: '$chip',
    paddingHorizontal: theme().space(1),
    paddingTop: Platform.OS === 'ios' ? theme().space(0) : 0,
    paddingBottom: 0,
    borderRadius: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '$chipText',
  },
  icon: {
    paddingRight: theme().space(0),
    paddingLeft: theme().space(0),
  },
});
