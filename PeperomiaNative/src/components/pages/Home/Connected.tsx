import { SQLite } from "expo";
import React, { Component } from "react";
import {
  createStackNavigator,
  NavigationScreenProp,
  NavigationRoute
} from "react-navigation";
import { TouchableOpacity, View, Image, AsyncStorage } from "react-native";
import { Feather } from "@expo/vector-icons";
import uuidv1 from "uuid/v1";
import { db } from "../../../lib/db";
import { Item } from "../../../lib/db/item";
import { delete1st } from "../../../lib/db/item";
import { deleteByItemId as deleteItemDetailByItemId } from "../../../lib/db/itemDetail";
import { Consumer as ItemsConsumer } from "../../../containers/Items";
import Hint from "../../atoms/Hint/Hint";
import Schedule from "../Schedule/Switch";
import EditPlan from "../EditPlan/Connected";
import Page from "./Page";

interface ItemAbout {
  itemId: number;
  about: string;
}

interface Props {
  navigation: NavigationScreenProp<NavigationRoute>;
}

interface State {
  refresh: string;
}

interface PlanProps {
  items: Item[];
  about: ItemAbout[];
  refreshData: () => void;
  refresh: string;
  onSchedule: (id: string, title: string) => void;
  onCreate: () => void;
}

interface PlanState {
  refresh: string;
}

class LogoTitle extends Component {
  render() {
    return (
      <Image
        source={require("../../../img/title_logo.png")}
        style={{ height: 35 }}
        resizeMode="contain"
      />
    );
  }
}

class HomeScreen extends Component<Props, State> {
  static navigationOptions = ({
    navigation
  }: {
    navigation: NavigationScreenProp<NavigationRoute>;
  }) => {
    const { params = {} } = navigation.state;

    return {
      headerTitle: <LogoTitle />,
      headerRight: (
        <View style={{ right: 12 }}>
          <Hint onPress={params.onPushCreatePlan}>
            <Feather name="plus" size={28} />
          </Hint>
        </View>
      )
    };
  };

  state = {
    refresh: ""
  };

  async componentDidMount() {
    this.props.navigation.setParams({
      onPushCreatePlan: async () => {
        await AsyncStorage.setItem("FIRST_CRAEATE_ITEM", "true");
        this.props.navigation.navigate("CreatePlan");
      }
    });
  }

  onSchedule = (id: string, title: string) => {
    this.props.navigation.navigate("Schedule", { itemId: id, title });
  };

  onCreate = () => {
    this.props.navigation.navigate("CreatePlan");
  };

  render() {
    const refresh = this.props.navigation.getParam("refresh", "");

    return (
      <ItemsConsumer>
        {({ items, about, refreshData }: any) => (
          <HomeScreenPlan
            items={items}
            about={about}
            refresh={refresh}
            refreshData={refreshData}
            onSchedule={this.onSchedule}
            onCreate={this.onCreate}
          />
        )}
      </ItemsConsumer>
    );
  }
}

class HomeScreenPlan extends Component<PlanProps, PlanState> {
  state = {
    refresh: ""
  };

  componentDidUpdate() {
    if (this.state.refresh === this.props.refresh) {
      return;
    }

    this.setState({ refresh: this.props.refresh });
    this.props.refreshData();
  }

  onDelete = (scheduleId: string) => {
    db.transaction((tx: SQLite.Transaction) => {
      delete1st(tx, scheduleId, (data: any, error: any) => {
        if (error) {
          return;
        }
        deleteItemDetailByItemId(tx, scheduleId, this.onRefresh);
      });
    });
  };

  onRefresh = () => {
    this.setState({ refresh: uuidv1() });
  };

  render() {
    const items: any = this.props.items.map((item: Item) => {
      const about: any = this.props.about.find(
        (val: ItemAbout) => val.itemId === item.id
      );

      return { ...item, id: String(item.id), about: about ? about.about : "" };
    });

    return (
      <Page
        data={items}
        loading={false}
        onSchedule={this.props.onSchedule}
        onCreate={this.props.onCreate}
        onDelete={this.onDelete}
      />
    );
  }
}

const MainCardNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen
  },
  Schedule: {
    screen: Schedule
  },
  EditPlan: {
    screen: EditPlan
  }
});

export default createStackNavigator(
  {
    MainCardNavigator: {
      screen: MainCardNavigator
    }
  },
  {
    initialRouteName: "MainCardNavigator",
    mode: "modal",
    headerMode: "none"
  }
);
