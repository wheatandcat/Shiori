import React, { FC, useCallback } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppIntroSlider from 'react-native-app-intro-slider';
import { whenIPhoneSE, isTablet } from 'lib/responsive';
import theme, { darkMode } from 'config/theme';

type Props = {
  onDone: () => void;
};

const AppInfo: FC<Props> = (props) => {
  const slides: Slide[] = [
    {
      key: 'step1',
      title: '予定を管理',
      text: 'ペペロミアは予定管理アプリです\n簡単な操作で予定を作成',
      image: require('img/intro_home.png'),
      imageWidth: isTablet ? 400 : 250,
      titleColor: theme().color.primary.main,
      textColor: theme().color.primary.main,
      backgroundColor: theme().color.secondary.main,
    },
    {
      key: 'step2',
      title: '予定を整理',
      text:
        'タイトルをつけると自動でアイコンを設定\n見やすい予定表を作成しよう！',
      image: require('img/intro_plan2.png'),
      imageWidth: isTablet ? 400 : 250,
      titleColor: theme().color.secondary.main,
      textColor: theme().color.secondary.main,
      backgroundColor: theme().color.primary.main,
    },
    {
      key: 'step3',
      title: '予定を共有',
      text: '作成した予定は\nブラウザから誰にでも共有可能',
      image: require('img/intro_share.png'),
      imageWidth: isTablet ? 500 : 300,
      titleColor: theme().color.primary.main,
      textColor: theme().color.primary.main,
      backgroundColor: theme().color.secondary.main,
    },
    {
      key: 'step4',
      title: 'ようこそ！！',
      text: 'ペペロミアを使って予定を作っていこう！',
      image: require('img/icon.png'),
      imageWidth: isTablet ? 300 : 200,
      titleColor: theme().color.background.main,
      textColor: theme().color.background.light,
      backgroundColor: theme().color.primary.main,
    },
  ];

  const renderNextButton = useCallback(() => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons
          name="arrow-forward-sharp"
          color={theme().color.background.main}
          size={24}
          style={styles.ionicons}
        />
      </View>
    );
  }, []);

  const renderDoneButton = useCallback(() => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons
          name="md-checkmark-sharp"
          color={theme().color.background.main}
          size={24}
          style={styles.ionicons}
        />
      </View>
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: Slide }) => {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: item.backgroundColor,
          },
        ]}
      >
        <StatusBar
          backgroundColor={item.backgroundColor}
          barStyle={darkMode() ? 'light-content' : 'dark-content'}
        />
        <View style={styles.image}>
          <Image
            source={item.image}
            style={{ width: item.imageWidth }}
            resizeMode="contain"
          />
        </View>
        <View
          style={isTablet ? styles.textContainerForWide : styles.textContainer}
        >
          <Text
            style={[
              isTablet ? styles.textForWide : styles.text,
              {
                color: item.titleColor,
              },
            ]}
          >
            {item.title}
          </Text>
        </View>
        <View style={styles.container}>
          {item.text.split('\n').map((val: string) => (
            <Text
              style={[
                isTablet ? styles.subTextForWide : styles.subText,
                {
                  color: item.textColor,
                },
              ]}
              key={val}
            >
              {val}
            </Text>
          ))}
        </View>
      </View>
    );
  }, []);

  const onDone = useCallback(() => {
    props.onDone();
  }, [props]);

  return (
    <AppIntroSlider
      data={slides}
      onDone={onDone}
      renderItem={renderItem}
      renderDoneButton={renderDoneButton}
      renderNextButton={renderNextButton}
    />
  );
};

export default AppInfo;

const styles = StyleSheet.create({
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: `${theme().color.background.dark}22`,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ionicons: {
    backgroundColor: theme().color.transparent,
  },
  root: {
    height: '100%',
    paddingTop: whenIPhoneSE(theme().space(4), theme().space(5)),
  },
  image: {
    paddingTop: theme().space(5),
    height: 300,
    paddingLeft: theme().space(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    paddingLeft: theme().space(4),
    paddingTop: theme().space(4),
  },
  textContainerForWide: {
    justifyContent: 'center',
    paddingLeft: theme().space(4),
    paddingTop: theme().space(6),
  },
  text: {
    fontSize: 25,
    fontWeight: '600',
  },
  textForWide: {
    fontSize: 40,
    fontWeight: '600',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: theme().space(4),
    paddingTop: theme().space(2),
  },
  subText: {
    fontSize: 16,
    paddingBottom: theme().space(1),
  },
  subTextForWide: {
    fontSize: 30,
    paddingBottom: theme().space(1),
  },
});

type Slide = {
  key: string;
  title: string;
  text: string;
  image: any;
  imageWidth: number;
  titleColor: string;
  textColor: string;
  backgroundColor: string;
};
