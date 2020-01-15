import React, { Component } from 'react';
import { Alert } from 'react-native';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import theme from '../../../config/theme';
import {
  Consumer as AuthConsumer,
  ContextProps as AuthContextProps,
} from '../../../containers/Auth';
import {
  Consumer as FetchConsumer,
  ContextProps as FetchContextProps,
} from '../../../containers/Fetch';
import Page from './Page';

type Props = {
  navigation: NavigationScreenProp<NavigationRoute>;
};

export default class extends Component<Props> {
  static navigationOptions = () => {
    return {
      title: 'ユーザー登録 / ログイン',
      headerBackTitle: '',
      headerTitleStyle: {
        color: theme().mode.header.text,
      },
      headerTintColor: theme().mode.header.text,
      headerStyle: {
        backgroundColor: theme().mode.header.backgroundColor,
      },
    };
  };

  render() {
    return (
      <AuthConsumer>
        {({ onGoogleLogin, logout }: AuthContextProps) => (
          <FetchConsumer>
            {({ post }: FetchContextProps) => (
              <Connected
                {...this.props}
                onGoogleLogin={onGoogleLogin}
                logout={logout}
                post={post}
              />
            )}
          </FetchConsumer>
        )}
      </AuthConsumer>
    );
  }
}

type ConnectedProps = Pick<AuthContextProps, 'onGoogleLogin' | 'logout'> &
  Pick<FetchContextProps, 'post'> & {
    navigation: NavigationScreenProp<NavigationRoute>;
  };

class Connected extends Component<ConnectedProps> {
  onGoogleLogin = async () => {
    if (!this.props.onGoogleLogin) {
      return;
    }

    try {
      await this.props.onGoogleLogin();
      const ok = await this.saveUser();
      if (ok) {
        const onLogin = this.props.navigation.getParam('onLogin', () => {});
        onLogin();

        this.props.navigation.goBack();
      } else {
        // 保存に失敗した時はログアウトさせる
        if (this.props.logout) {
          this.props.logout();
        }
      }
    } catch (err) {
      console.log('err:', err);
    }
  };

  saveUser = async () => {
    if (!this.props.post) {
      return;
    }

    const response = await this.props.post('CreateUser', null);

    if (response.error) {
      Alert.alert('ユーザーの保存に失敗しました。');
      return false;
    }

    return true;
  };

  render() {
    return <Page onGoogleLogin={this.onGoogleLogin} />;
  }
}
