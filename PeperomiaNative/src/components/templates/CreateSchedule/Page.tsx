import React, { Component } from "react";
import { View, Text } from "react-native";
import { whenIPhoneSE } from "../../../lib/responsive";
import EditButton from "../../atoms/EditButton";
import Cards, { Props as CardsProps } from "../../organisms/Schedule/Cards";

export interface Props extends CardsProps {
  onCreateScheduleDetail: () => void;
}

export default class extends Component<Props> {
  render() {
    if (this.props.data.length === 0) {
      return (
        <View style={{ backgroundColor: "#ffffff" }}>
          <View
            style={{ height: "100%", alignItems: "center", paddingTop: 50 }}
          >
            <Text>まだ予定がありません</Text>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: whenIPhoneSE(50, 80),
              width: "100%",
              padding: 45
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: "#8492A6",
                paddingHorizontal: whenIPhoneSE(10, 40),
                paddingVertical: whenIPhoneSE(15, 30),
                borderRadius: 20
              }}
            >
              <Text
                style={{ color: "#ffffff", fontSize: whenIPhoneSE(14, 18) }}
              >
                まずは、予定を追加しよう
              </Text>
            </View>
            <View
              style={{
                width: 0,
                height: 0,
                marginLeft: whenIPhoneSE(180, 230),
                backgroundColor: "transparent",
                borderStyle: "solid",
                borderLeftWidth: 20,
                borderRightWidth: 0,
                borderTopWidth: 20,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: "#8492A6"
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              right: 0,
              position: "absolute",
              alignItems: "flex-end",
              paddingRight: 25,
              bottom: 30
            }}
          >
            <EditButton onPress={this.props.onCreateScheduleDetail} />
          </View>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: "#ffffff" }}>
        <View style={{ height: "100%", width: "100%" }}>
          <Cards
            data={this.props.data}
            onScheduleDetail={this.props.onScheduleDetail}
          />
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 10,
            width: "100%",
            padding: 45
          }}
        >
          <View
            style={{
              flex: 1,
              right: 0,
              position: "absolute",
              alignItems: "flex-end",
              paddingRight: 25,
              bottom: 30
            }}
          >
            <EditButton onPress={this.props.onCreateScheduleDetail} />
          </View>
        </View>
      </View>
    );
  }
}
