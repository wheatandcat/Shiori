import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { IconImage } from 'primitive';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SuggestItem, uniqueSuggests } from '../../../lib/suggest';
import { KINDS } from '../../../lib/getKind';
import { darkMode } from '../../../config/theme';

interface Props {
  title: string;
  items: SuggestItem[];
  onPress: (kind: string, name: string) => void;
}

export default (props: Props) => (
  <View style={styles.root}>
    {uniqueSuggests(props.items)
      .filter(item => {
        if (!props.title) {
          return true;
        }
        return item.title.includes(props.title);
      })
      .slice(0, 8)
      .map(item => (
        <TouchableOpacity
          style={styles.tap}
          onPress={() => props.onPress(item.kind, item.title)}
          key={item.title}
        >
          <View style={styles.container}>
            <View style={styles.iconImage}>
              <IconImage
                src={getImageSrc(item.kind, darkMode())}
                name=""
                size={25}
                opacity={1.0}
              />
            </View>
            <View
              style={[
                styles.titleContainer,
                {
                  borderColor: getImageColor(item.kind),
                },
              ]}
            >
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
  </View>
);

const getImageSrc = (kind: string, reversal?: boolean) => {
  const item = KINDS[kind];

  if (reversal) {
    return item.reversal.src;
  }

  return item.src;
};

const getImageColor = (kind: string) => {
  const item = KINDS[kind];

  return item.backgroundColor;
};

const styles = EStyleSheet.create({
  root: {
    padding: 20,
    backgroundColor: '$background',
  },
  title: {
    color: '$text',
  },
  tap: {
    paddingVertical: 15,
  },
  container: {
    flexDirection: 'row',
    height: 30,
    alignItems: 'center',
  },
  iconImage: {
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 4,
    borderLeftWidth: 6,
    paddingLeft: 10,
  },
});
