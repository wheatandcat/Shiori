import React, { Component } from "react";
import { View } from "react-native";
import Cards, {
  Props as CardsProps
} from "../../organisms/SortableSchedule/Cards";

export interface Props extends CardsProps {}

export default class extends Component<Props> {
  render() {
    return (
      <View style={{ backgroundColor: "#ffffff" }}>
        <View style={{ height: "100%", width: "100%" }}>
          <Cards data={this.props.data} onChange={this.props.onChange} />
        </View>
      </View>
    );
  }
}