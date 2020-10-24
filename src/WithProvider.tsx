import * as Linking from 'expo-linking';
import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native-appearance';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { NavigationContainer, useLinking } from '@react-navigation/native';
import * as Analytics from 'expo-firebase-analytics';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Version from './containers/Version';
import AuthProvider from './containers/Auth';
import FetchProvider from './containers/Fetch';
import ItemsProvider from './containers/Items';
import ThemeProvider from './containers/Theme';
import AppStateStatus from './containers/AppStateStatus';
import NotificationProvider from './containers/Notification';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import { NavigationDefaultTheme, NavigationDarkTheme } from './config/theme';
import makeApolloClient from './lib/apollo';
import useIsFirstRender from 'hooks/useIsFirstRender';
import './lib/firebase';

type Props = {};
type CacheShape = any;

const WithProvider: React.FC<Props> = (props) => {
  const isFirstRender = useIsFirstRender();
  const prefix = Linking.makeUrl('/');
  const scheme = useColorScheme();
  const routeNameRef = React.useRef<any>();
  const navigationRef = React.useRef<any>();
  const [client, setClient] = useState<ApolloClient<CacheShape> | null>(null);

  const { getInitialState } = useLinking(navigationRef, {
    prefixes: [
      prefix,
      'https://link.peperomia.info',
      'exps://link.peperomia.info',
    ],
    config: {
      screens: {
        Schedule: {
          path: 'schedule/:itemId',
          parse: {
            itemId: String,
          },
        },
      },
    },
  });

  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<any>();

  useEffect(() => {
    getInitialState().then((state: any) => {
      if (state !== undefined) {
        setInitialState(state);
      }

      setIsReady(true);
    });
  }, [getInitialState]);

  const fetchSession = async () => {
    const apolloClient = await makeApolloClient();
    setClient(apolloClient);
  };

  useEffect(() => {
    if (isFirstRender) return;

    fetchSession();
  }, [isFirstRender]);

  if (!isReady) {
    return null;
  }

  if (!client) {
    return null;
  }

  return (
    <NavigationContainer
      initialState={initialState}
      theme={
        scheme === 'dark' ? NavigationDarkTheme() : NavigationDefaultTheme()
      }
      ref={navigationRef}
      onReady={() =>
        (routeNameRef.current = navigationRef?.current?.getCurrentRoute?.()?.name)
      }
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef?.current?.getCurrentRoute?.()
          ?.name;

        if (previousRouteName !== currentRouteName) {
          Analytics.setCurrentScreen(currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      <SafeAreaProvider>
        <ActionSheetProvider>
          <ApolloProvider client={client}>
            <ApolloHooksProvider client={client}>
              <Version>
                <AuthProvider>
                  <FetchProvider>
                    <NotificationProvider>
                      <AppStateStatus>
                        <ItemsProvider>
                          <ThemeProvider>{props.children}</ThemeProvider>
                        </ItemsProvider>
                      </AppStateStatus>
                    </NotificationProvider>
                  </FetchProvider>
                </AuthProvider>
              </Version>
            </ApolloHooksProvider>
          </ApolloProvider>
        </ActionSheetProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
};

export default WithProvider;