import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';
import React, { useState, useCallback } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EStyleSheet from 'react-native-extended-stylesheet';
import { AppearanceProvider } from 'react-native-appearance';
import { StatusBar, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
  BottomTabBar,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sentry from 'sentry-expo';
import uuidv4 from 'uuid/v4';
import { useDidMount } from 'hooks/index';
import app from '../app.json';
import AppInfo from './components/pages/AppInfo/Page';
import { db, init } from './lib/db';
import { RootStackParamList } from './lib/navigation';
import theme from './config/theme';
import CreateCalendar from 'components/pages/CreateCalendar';
import Setting from './components/pages/Setting/Connected';
import Calendars from './components/pages/Calendars/index';
import { setDebugMode } from './lib/auth';
import { setDeviceType } from './lib/responsive';
import {
  select1st as selectUser1st,
  insert as insertUser,
  User,
} from './lib/db/user';
import EditPlan from './components/pages/EditPlan';
import CreatePlan from './components/pages/CreatePlan';
import CreateSchedule from './components/pages/CreateSchedule';
import ScheduleDetail from './components/pages/ScheduleDetail';
import AddScheduleDetail from './components/pages/AddScheduleDetail';
import CreateScheduleDetail from './components/pages/CreateScheduleDetail';
import Icons, { IconsNavigationOptions } from 'components/pages/Icons';
import WithProvider from './WithProvider';

Sentry.setRelease(String(Constants.manifest.revisionId));
Sentry.init({
  dsn: String(process.env.SENTRY_URL),
  debug: true,
  enableInExpoDevelopment: Constants.appOwnership === 'expo',
});

StatusBar.setBarStyle('light-content', true);
StatusBar.setBackgroundColor(theme().color.main, true);

const Tab = createBottomTabNavigator();

type State = {
  guide: boolean;
  loading: boolean;
};

const tabNames = [
  {
    name: 'Calendars',
    screenName: 'カレンダー',
  },
  {
    name: 'Create',
    screenName: '今日の予定',
  },
  {
    name: 'Setting',
    screenName: '設定',
  },
];

type NavigationOptions = {
  route: any;
  navigation: any;
};

const tabOption = ({
  route,
}: NavigationOptions): BottomTabNavigationOptions => ({
  tabBarLabel: ({ focused }) => {
    const routeName = route.name;

    const item = tabNames.find((v) => v.name === routeName);

    return (
      <Text style={focused ? styles.tabTitleFold : styles.tabTitle}>
        {item?.screenName || 'home'}
      </Text>
    );
  },
  tabBarVisible: route.name !== 'Create',
});

const tabNavigationOptions = ({
  route,
}: NavigationOptions): BottomTabNavigationOptions => ({
  tabBarIcon: ({ focused }) => {
    const routeName = route.name;

    if (routeName === 'Create') {
      return (
        <MaterialIcons
          name="add-circle-outline"
          size={30}
          color={
            focused
              ? theme().mode.tabBar.activeTint
              : theme().mode.tabBar.inactiveTint
          }
        />
      );
    } else if (routeName === 'Calendars') {
      return (
        <MaterialIcons
          name="date-range"
          size={30}
          color={
            focused
              ? theme().mode.tabBar.activeTint
              : theme().mode.tabBar.inactiveTint
          }
        />
      );
    } else if (routeName === 'Setting') {
      return (
        <MaterialCommunityIcons
          name="settings-outline"
          size={30}
          color={
            focused
              ? theme().mode.tabBar.activeTint
              : theme().mode.tabBar.inactiveTint
          }
        />
      );
    }

    return null;
  },
});

const RootStack = createStackNavigator<RootStackParamList>();

const RootStackScreen = () => {
  return (
    <RootStack.Navigator initialRouteName="Main" mode="modal">
      <RootStack.Screen
        name="Main"
        component={MainStackScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="EditPlan"
        component={EditPlan}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="ScheduleDetail"
        component={ScheduleDetail}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CreatePlan"
        component={CreatePlan}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AddScheduleDetail"
        component={AddScheduleDetail}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CreateScheduleDetail"
        component={CreateScheduleDetail}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Icons"
        component={Icons}
        options={IconsNavigationOptions}
      />
      <RootStack.Screen
        name="CreateSchedule"
        component={CreateSchedule}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CreateCalendar"
        component={CreateCalendar}
        options={{ animationEnabled: true, headerShown: false }}
      />
    </RootStack.Navigator>
  );
};

const MyTabBar = (props: BottomTabBarProps) => {
  return <BottomTabBar {...props} labelPosition="below-icon" />;
};

const CreatePlaceholder = () => <View style={styles.new} />;

const MainStackScreen = () => (
  <Tab.Navigator screenOptions={tabNavigationOptions} tabBar={MyTabBar}>
    <Tab.Screen name="Calendars" component={Calendars} options={tabOption} />
    <Tab.Screen
      name="Create"
      component={CreatePlaceholder}
      options={tabOption}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          navigation.navigate('CreateCalendar');
        },
      })}
    />
    <Tab.Screen name="Setting" component={Setting} options={tabOption} />
  </Tab.Navigator>
);

const initState = {
  guide: false,
  loading: true,
};

const App = () => {
  const [state, setState] = useState<State>(initState);

  const setUser = useCallback((_: number, error: SQLite.SQLError | null) => {
    if (error) {
      return;
    }

    setState((s) => ({
      ...s,
      guide: true,
      loading: false,
    }));
  }, []);

  const checkUser = useCallback(
    (data: User | null, error: SQLite.SQLError | null) => {
      if (error) {
        return;
      }

      if (!data) {
        const uuid = Constants.installationId + uuidv4();
        const user: User = {
          uuid,
        };
        db.transaction((tx: SQLite.SQLTransaction) => {
          insertUser(tx, user, setUser);
        });

        AsyncStorage.setItem('userID', user.uuid);
        // 現在のバージョンを設定
        AsyncStorage.setItem('APP_VERSION', app.expo.version);
      } else {
        AsyncStorage.setItem('userID', data.uuid);
        setState((s) => ({
          ...s,
          loading: false,
        }));
      }
    },
    [setUser]
  );

  const onDoneGuide = useCallback(() => {
    setState((s) => ({
      ...s,
      guide: false,
    }));
  }, []);

  useDidMount(() => {
    const setup = async () => {
      await setDeviceType();

      db.transaction((tx: SQLite.SQLTransaction) => {
        init(tx);
        selectUser1st(tx, checkUser);
      });

      if (!Constants.isDevice) {
        const debugMode = await AsyncStorage.getItem('DEBUG_MODE');
        await setDebugMode(Boolean(debugMode));
      }
    };

    setup();
  });

  if (state.loading) {
    return null;
  }

  if (state.guide) {
    return <AppInfo onDone={onDoneGuide} />;
  }

  return (
    <AppearanceProvider>
      <WithProvider>
        <RootStackScreen />
      </WithProvider>
    </AppearanceProvider>
  );
};

export default App;

const styles = EStyleSheet.create({
  tabTitle: {
    fontSize: 12,
    color: '$tabTitleColor',
  },
  tabTitleFold: {
    fontSize: 12,
    fontWeight: '600',
    color: '$tabTitleActiveColor',
  },
  tab: {
    backgroundColor: '$background',
  },
  tabForWide: {
    height: 120,
    backgroundColor: '$background',
  },
  new: { flex: 1, backgroundColor: 'blue' },
});
