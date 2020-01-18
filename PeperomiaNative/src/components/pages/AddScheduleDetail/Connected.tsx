import React, {
  memo,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Alert } from 'react-native';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import uuidv1 from 'uuid/v1';
import getKind from '../../../lib/getKind';
import { SuggestItem } from '../../../lib/suggest';
import { ItemDetail, SelectItemDetail } from '../../../domain/itemDetail';
import { createItemDetail } from '../../../lib/itemDetail';
import { useDidMount } from '../../../hooks/index';
import {
  Context as ItemsContext,
  ContextProps as ItemContextProps,
} from '../../../containers/Items';
import Page from '../../templates/CreateScheduleDetail/Page';

type State = ItemDetail & {
  iconSelected: boolean;
  suggestList: SuggestItem[];
};

type Props = ItemDetail & {
  navigation: NavigationScreenProp<NavigationRoute>;
};

type PlanProps = Props & Pick<ItemContextProps, 'itemDetails' | 'refreshData'>;

export default (props: Props) => {
  const { refreshData, itemDetails } = useContext(ItemsContext);

  return (
    <Plan {...props} refreshData={refreshData} itemDetails={itemDetails} />
  );
};

const Plan = memo((props: PlanProps) => {
  const [state, setState] = useState<State>({
    title: props.title || '',
    place: props.place || '',
    url: props.url || '',
    memo: props.memo || '',
    moveMinutes: props.moveMinutes || 0,
    kind: props.kind,
    priority: props.priority,
    iconSelected: false,
    suggestList: [],
  });

  useDidMount(() => {
    const suggestList = (props.itemDetails || []).map(itemDetail => ({
      title: itemDetail.title,
      kind: itemDetail.kind,
    }));

    setState(s => ({
      ...s,
      suggestList,
    }));
  });

  useEffect(() => {
    const kind = props.navigation.getParam('kind', '');

    if (!kind) {
      return;
    }

    if (state.kind !== kind) {
      setState(s => ({
        ...s,
        kind,
        iconSelected: true,
      }));
    }
  }, [props.navigation, state.kind]);

  const onDismiss = useCallback(() => {
    props.navigation.goBack();
  }, [props.navigation]);

  const save = useCallback(() => {
    const itemId = props.navigation.getParam('itemId', '1');

    props.navigation.navigate('Schedule', {
      itemId,
      refresh: uuidv1(),
    });

    if (props.refreshData) {
      props.refreshData();
    }
  }, [props]);

  const onSave = useCallback(
    async (
      title: string,
      kind: string,
      place: string,
      url: string,
      m: string,
      moveMinutes: number
    ) => {
      const itemId = props.navigation.getParam('itemId', '1');
      const priority = props.navigation.getParam('priority', '1');

      const itemDetail: SelectItemDetail = {
        itemId,
        title,
        place,
        url,
        memo: m,
        kind,
        moveMinutes,
        priority: Number(priority),
      };

      const insertID = await createItemDetail(null, itemDetail);
      if (!insertID) {
        Alert.alert('保存に失敗しました');
        return;
      }

      save();
    },
    [props.navigation, save]
  );

  const onIcons = useCallback(
    (title: string) => {
      props.navigation.navigate('Icons', {
        kind: getKind(title),
        onSelectIcon: (kind: string) => {
          props.navigation.navigate('AddScheduleDetail', {
            kind: kind,
          });
        },
        onDismiss: () => {
          props.navigation.navigate('AddScheduleDetail');
        },
        photo: false,
      });
    },
    [props.navigation]
  );

  return (
    <Page
      title={state.title}
      kind={state.kind}
      place={state.place}
      url={state.url}
      memo={state.memo}
      moveMinutes={state.moveMinutes}
      suggestList={state.suggestList}
      iconSelected={state.iconSelected}
      onDismiss={onDismiss}
      onSave={onSave}
      onIcons={onIcons}
    />
  );
});
