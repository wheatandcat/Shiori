import React from "react";
import { Image, View } from "react-native";
import {
  KIND_PARK,
  KIND_TRAIN,
  KIND_SHIP,
  KIND_FISHING
} from "../../lib/getKind";

export interface Props {
  src: string;
  kind: string;
  size: number;
  opacity?: number;
  image?: string;
  defaultIcon?: boolean;
}

export default (props: Props) => {
  return (
    <Frame size={props.size}>
      <Image
        source={{
          uri: props.src
        }}
        style={{
          opacity: props.opacity || 0.5,
          width: "100%",
          height: "100%"
        }}
      />
    </Frame>
  );
};

export interface Frame {
  children: any;
  size: number;
}

const Frame = (props: Frame) => (
  <View
    style={{
      width: props.size,
      height: props.size
    }}
  >
    {props.children}
  </View>
);