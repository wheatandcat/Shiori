import React from 'react';
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import styled from 'styled-components/native';
import Toast from 'react-native-root-toast';
import Header from 'components/molecules/ScheduleHeader/Header';
import { SelectItemDetail } from 'domain/itemDetail';
import theme from 'config/theme';
import Label from './Label';

type Props = SelectItemDetail & {
  onDismiss: () => void;
  onOpenActionSheet: () => void;
};

const handleClick = (url: string) => {
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      const { height } = Dimensions.get('window');

      const toast = Toast.show('無効なリンクです', {
        duration: Toast.durations.LONG,
        position: height - 150,
        shadow: true,
        animation: true,
        hideOnPress: true,
        textColor: theme().color.error.main,
        delay: 0,
      });

      setTimeout(function () {
        Toast.hide(toast);
      }, 3000);
    }
  });
};

export default (props: Props) => {
  return (
    <View style={styles.root}>
      <Header kind={props.kind}>
        <Title numberOfLines={1}>{props.title}</Title>
      </Header>

      <View>
        {Boolean(props.place) && (
          <View style={styles.container}>
            <Label text="集合場所" icon="map-marker-outline" width={95} />

            <View style={styles.memoContainer}>
              <Text style={estyles.memoText}>{props.place}</Text>
            </View>
          </View>
        )}

        {Boolean(props.url) && (
          <View style={styles.container}>
            <Label text="URL" icon="link" width={70} />

            <View style={styles.memoContainer}>
              <TouchableOpacity onPress={() => handleClick(props.url)}>
                <Text
                  style={[
                    estyles.memoText,
                    { color: theme().color.accent1.main },
                  ]}
                  numberOfLines={1}
                >
                  {props.url}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {Boolean(props.memo) && (
          <View style={styles.container}>
            <Label text="メモ" icon="file-document-box-outline" width={70} />

            <View style={styles.memoContainer}>
              <Text style={estyles.memoText}>{props.memo}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const Title = styled.Text`
  color: ${theme().color.base.main};
  font-weight: 600;
  font-size: 20;
`;

const estyles = EStyleSheet.create({
  timeText: {
    fontSize: 18,
    color: '$text',
    paddingHorizontal: theme().space(4),
  },
  memoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '$text',
  },
});

const styles = StyleSheet.create({
  root: {
    height: '100%',
  },
  memoContainer: {
    paddingTop: theme().space(1),
    paddingBottom: theme().space(2),
    paddingHorizontal: theme().space(0),
  },
  container: {
    paddingHorizontal: theme().space(3),
    paddingTop: theme().space(2),
  },
});
