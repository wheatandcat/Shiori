import React, { memo } from 'react';
import CreateCalendar from 'components/templates/CreateCalendar/Page';
import { QueryProps } from './Plain';
import { ConnectedType } from './Connected';

export type Props = ConnectedType & {
  mutationData: QueryProps['mutationData'];
};

const CreateCalendarPage: React.FC<Props> = (props) => {
  return (
    <CreateCalendar
      loading={props.mutationData.loading}
      {...props}
      itemDetail={null}
    />
  );
};

export default memo(CreateCalendarPage);
