import * as SQLite from 'expo-sqlite';
import React, {
  useContext,
  useState,
  memo,
  useEffect,
  useCallback,
} from 'react';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { Alert } from 'react-native';
import {
  Context as ItemsContext,
  ContextProps as ItemContextProps,
} from '../../../containers/Items';
import { db } from '../../../lib/db';
import { update as updateItem, Item } from '../../../lib/db/item';
import {
  update as updateCalendar,
  insert as insertCalendar,
  Calendar,
} from '../../../lib/db/calendar';
import getKind from '../../../lib/getKind';
import { SuggestItem } from '../../../lib/suggest';
import { useDidMount } from '../../../hooks/index';
import Page from '../../templates/CreatePlan/Page';

type Props = {
  navigation: NavigationScreenProp<NavigationRoute>;
};

type ConnectedProps = Pick<
  ItemContextProps,
  'items' | 'refreshData' | 'calendars'
> & {
  navigation: NavigationScreenProp<NavigationRoute>;
};

type PlanProps = Pick<ItemContextProps, 'items' | 'refreshData'> & {
  navigation: NavigationScreenProp<NavigationRoute>;
  input: {
    title: string;
    date: string;
  };
  kind: string;
  onInput: (name: string, value: any) => void;
  onSave: () => void;
  onIcons: () => void;
  onHome: () => void;
};

type State = {
  input: {
    title: string;
    date: string;
  };
  image: string;
  kind: string;
  calendar: Calendar;
};

export default (props: Props) => {
  const { refreshData, items, calendars } = useContext(ItemsContext);

  return (
    <Connected
      navigation={props.navigation}
      items={items}
      refreshData={refreshData}
      calendars={calendars}
    />
  );
};

const Connected = memo((props: ConnectedProps) => {
  const [state, setState] = useState<State>({
    input: { title: '', date: '' },
    image: '',
    kind: '',
    calendar: {
      id: 0,
      itemId: 0,
      date: '',
    },
  });

  useDidMount(() => {
    const id = props.navigation.getParam('id', 0);
    let input: {
      date: string;
      title: string;
    } = {
      date: '',
      title: '',
    };

    const calendar = (props.calendars || []).find(
      item => Number(id) === Number(item.itemId)
    );

    if (calendar && calendar.date) {
      input.date = calendar.date;
      setState(s => ({
        ...s,
        ...state,
        calendar,
      }));
    }

    const schedule = (props.items || []).find(
      item => Number(id) === Number(item.id)
    );

    if (schedule && schedule.title) {
      input.title = schedule.title;
    }

    const image = props.navigation.getParam('image', '');
    const kind = props.navigation.getParam('kind', '');

    setState(s => ({
      ...s,
      input,
      image,
      kind,
    }));
  });

  useEffect(() => {
    const kind = props.navigation.getParam('kind', '');
    if (kind && kind !== state.kind) {
      setState(s => ({
        ...s,
        kind,
      }));
    }
  }, [props.navigation, state]);

  const onInput = useCallback(
    (name: string, value: any) => {
      const input = {
        ...state.input,
        [name]: value,
      };

      setState(s => ({
        ...s,
        input,
      }));
    },
    [state]
  );

  const save = useCallback(
    (_: Item[], error: SQLite.SQLError | null) => {
      if (error) {
        Alert.alert('保存に失敗しました');
        return;
      }

      const id = props.navigation.getParam('id', 0);

      props.navigation.navigate('Schedule', {
        itemId: id,
        title: state.input.title,
      });
    },
    [props.navigation, state.input.title]
  );

  const saveCalendar = useCallback(
    (_: Calendar | number, error: SQLite.SQLError | null) => {
      if (error) {
        return;
      }

      if (props.refreshData) {
        props.refreshData();
      }
    },
    [props]
  );

  const onSave = useCallback(async () => {
    if (state.input.date) {
      const check = (props.calendars || []).find(
        calendar => calendar.date === state.input.date
      );

      if (check) {
        Alert.alert('同じ日にスケジュールが既に登録されています');
        return;
      }
    }

    db.transaction((tx: SQLite.SQLTransaction) => {
      const id = props.navigation.getParam('id', 0);

      const item = {
        id,
        title: state.input.title,
        kind: state.kind || getKind(state.input.title),
      };

      updateItem(tx, item, save);

      if (!state.input.date) {
        return;
      }

      if (state.calendar.id) {
        updateCalendar(
          tx,
          {
            ...state.calendar,
            date: state.input.date,
          },
          saveCalendar
        );
      } else {
        insertCalendar(
          tx,
          {
            itemId: id,
            date: state.input.date,
          },
          saveCalendar
        );
      }
    });
  }, [
    props.calendars,
    props.navigation,
    save,
    saveCalendar,
    state.calendar,
    state.input.date,
    state.input.title,
    state.kind,
  ]);

  const onIcons = useCallback(() => {
    props.navigation.navigate('Icons', {
      kind: getKind(state.input.title),
      onSelectIcon: (kind: string) => {
        props.navigation.navigate('EditPlan', {
          kind: kind,
        });
      },
      onDismiss: () => {
        props.navigation.navigate('EditPlan');
      },
      photo: true,
    });
  }, [props.navigation, state.input.title]);

  const onHome = useCallback(() => {
    props.navigation.goBack();
  }, [props.navigation]);

  console.log(state);

  return (
    <Plan
      navigation={props.navigation}
      input={state.input}
      kind={state.kind}
      items={props.items}
      refreshData={props.refreshData}
      onInput={onInput}
      onSave={onSave}
      onIcons={onIcons}
      onHome={onHome}
    />
  );
});

type PlanState = {
  suggestList: SuggestItem[];
};

const Plan = memo((props: PlanProps) => {
  const [state, setState] = useState<PlanState>({
    suggestList: [],
  });

  useDidMount(() => {
    const suggestList = (props.items || []).map(item => ({
      title: item.title,
      kind: item.kind,
    }));

    setState(s => ({
      ...s,
      suggestList,
    }));
  });

  const onSave = useCallback(async () => {
    await props.onSave();

    if (props.refreshData) {
      props.refreshData();
    }
  }, [props]);

  return (
    <Page
      mode="edit"
      title={props.input.title}
      date={props.input.date}
      kind={props.kind}
      suggestList={state.suggestList}
      onInput={props.onInput}
      onSave={onSave}
      onIcons={props.onIcons}
      onHome={props.onHome}
    />
  );
});
