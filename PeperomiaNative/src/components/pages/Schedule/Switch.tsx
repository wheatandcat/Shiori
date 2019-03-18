import React, { Component } from "react";
import { SQLite } from "expo";
import { NavigationScreenProp, NavigationRoute } from "react-navigation";
import { View, Share, AsyncStorage, Dimensions, Clipboard } from "react-native";
import {
  ActionSheetProps,
  connectActionSheet
} from "@expo/react-native-action-sheet";
import Toast from "react-native-root-toast";
import uuidv1 from "uuid/v1";
import EditSchedule from "../EditSchedule/Connected";
import SortableSchedule from "../SortableSchedule/Connected";
import { db } from "../../../lib/db";
import {
  update as updateItemDetail,
  ItemDetail,
  deleteByItemId as deleteItemDetailByItemId
} from "../../../lib/db/itemDetail";
import { save as saveFirestore } from "../../../lib/firebase";
import { select1st, delete1st, Item } from "../../../lib/db/item";
import getShareText from "../../../lib/getShareText";
import Schedule from "./Connected";
import HeaderLeft from "./HeaderLeft";
import HeaderRight from "./HeaderRight";

interface State {
  item: Item;
  itemId: number;
  title: string;
  items: ItemDetail[];
  saveItems: ItemDetail[];
  mode: string;
}

interface Props {
  navigation: NavigationScreenProp<NavigationRoute>;
}

class Switch extends Component<Props & ActionSheetProps, State> {
  static navigationOptions = ({ navigation }: { navigation: any }) => {
    const { params = {} } = navigation.state;
    return {
      title: params.title,
      headerLeft: (
        <View style={{ left: 5 }}>
          <HeaderLeft
            mode={params.mode}
            onShow={params.onShow}
            navigation={navigation}
          />
        </View>
      ),
      headerRight: (
        <View style={{ right: 10 }}>
          <HeaderRight
            mode={params.mode}
            onSave={params.onSave}
            onShare={() =>
              params.onShare(params.itemId, params.title, params.items)
            }
            onOpenActionSheet={() =>
              params.onOpenActionSheet(
                params.itemId,
                params.title,
                params.items
              )
            }
          />
        </View>
      )
    };
  };

  state = {
    item: {
      id: 0,
      title: "",
      kind: "",
      image: ""
    },
    itemId: 0,
    title: "",
    items: [],
    saveItems: [],
    mode: "show"
  };

  componentDidMount() {
    const itemId = this.props.navigation.getParam("itemId", "1");

    db.transaction((tx: SQLite.Transaction) => {
      select1st(tx, itemId, this.setItem);
    });

    this.props.navigation.setParams({
      onAdd: this.onAdd,
      onEdit: this.onEdit,
      onShow: this.onShow,
      onSort: this.onSort,
      onSave: this.onSave,
      onShare: this.onShare,
      onOpenActionSheet: this.onOpenActionSheet,
      mode: "show"
    });
  }

  setItem = (data: any, error: any) => {
    if (error) {
      return;
    }

    this.setState({
      item: data
    });
  };

  onOpenActionSheet = (itemId: string, title: string, items: ItemDetail[]) => {
    this.props.showActionSheetWithOptions(
      {
        options: ["リンクを取得する", "その他", "キャンセル"],

        cancelButtonIndex: 2
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          this.onCrateShareLink(items);
        } else if (buttonIndex === 1) {
          this.onShare(itemId, title, items);
        }
      }
    );
  };

  onCrateShareLink = async (items: ItemDetail[]) => {
    if (!this.state.item.id) {
      return;
    }

    const userID = await AsyncStorage.getItem("userID");
    if (userID === null) {
      return;
    }

    const linkID = await saveFirestore(userID, this.state.item, items);
    console.log(linkID);

    const shareHost = "https://peperomia-196da.firebaseapp.com";

    Clipboard.setString(`${shareHost}/${linkID}`);

    const { height } = Dimensions.get("window");

    let toast = Toast.show("リンクがコピーされました！", {
      duration: Toast.durations.LONG,
      position: height - 150,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0
    });

    // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
    setTimeout(function() {
      Toast.hide(toast);
    }, 3000);
  };

  onAdd = (items: ItemDetail[]) => {
    const itemId = this.props.navigation.getParam("itemId", "1");
    this.props.navigation.navigate("CreateScheduleDetail", {
      itemId,
      priority: items.length + 1
    });
  };

  onDelete = () => {
    const itemId = this.props.navigation.getParam("itemId", "1");

    db.transaction((tx: SQLite.Transaction) => {
      delete1st(tx, itemId, (data: any, error: any) => {
        if (error) {
          return;
        }
        deleteItemDetailByItemId(tx, itemId, this.onDeleteRefresh);
      });
    });
  };

  onDeleteRefresh = (_: any, error: any) => {
    if (error) {
      return;
    }

    this.props.navigation.navigate("Home", { refresh: uuidv1() });
  };

  onEdit = (items: ItemDetail[]): void => {
    const itemId = this.props.navigation.getParam("itemId", "1");

    this.setState({ itemId, items, mode: "edit" });

    this.props.navigation.setParams({
      mode: "edit"
    });
  };

  onShow = (): void => {
    this.setState({ mode: "show" });

    this.props.navigation.setParams({
      mode: "show"
    });
  };

  onSort = (items: ItemDetail[]): void => {
    this.setState({ mode: "sort", items });

    this.props.navigation.setParams({
      mode: "sort"
    });
  };

  onSave = () => {
    this.setState({
      items: this.state.saveItems
    });
    this.onShow();
  };

  onChangeItems = (data: ItemDetail[]): void => {
    console.log(data);

    db.transaction((tx: SQLite.Transaction) => {
      data.forEach(async (item, index) => {
        item.priority = index + 1;
        await updateItemDetail(tx, item, this.save);
      });
    });

    this.setState({ saveItems: data });
  };

  save = (_: any) => {};

  onShare = async (itemId: string, title: string, items: ItemDetail[]) => {
    try {
      const message = getShareText(items);

      const result: any = await Share.share({
        title,
        message
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  render() {
    if (this.state.mode === "edit") {
      return (
        <EditSchedule
          title={this.state.title}
          items={this.state.items}
          navigation={this.props.navigation}
          onShow={this.onShow}
        />
      );
    }

    if (this.state.mode === "sort") {
      return (
        <SortableSchedule
          items={this.state.items}
          onChangeItems={this.onChangeItems}
        />
      );
    }

    return (
      <Schedule
        navigation={this.props.navigation}
        onAdd={this.onAdd}
        onSort={this.onSort}
        onDelete={() => this.onDelete()}
      />
    );
  }
}

export default connectActionSheet(Switch);
