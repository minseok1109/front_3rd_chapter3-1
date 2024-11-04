import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '팀 미팅',
    date: '2024-03-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // given
    const events = [baseEvent];
    const now = new Date('2024-03-20T09:50:00'); // 이벤트 시작 10분 전
    const notifiedEvents: string[] = [];

    // when
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    // then
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0]).toEqual(baseEvent);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    // given
    const events = [baseEvent];
    const now = new Date('2024-03-20T09:50:00');
    const notifiedEvents = [baseEvent.id];

    // when
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    // then
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // given
    const events = [baseEvent];
    const now = new Date('2024-03-20T09:40:00'); // 이벤트 시작 20분 전
    const notifiedEvents: string[] = [];

    // when
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    // then
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // given
    const events = [baseEvent];
    const now = new Date('2024-03-20T10:00:00'); // 이벤트 시작 시간
    const notifiedEvents: string[] = [];

    // when
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    // then
    expect(upcomingEvents).toHaveLength(0);
  });

  it('여러 이벤트 중 알림 조건에 맞는 이벤트만 반환한다', () => {
    // given
    const events: Event[] = [
      baseEvent,
      {
        ...baseEvent,
        id: '2',
        startTime: '11:00',
        notificationTime: 15,
      },
      {
        ...baseEvent,
        id: '3',
        startTime: '12:00',
        notificationTime: 5,
      },
    ];
    const now = new Date('2024-03-20T10:45:00');
    const notifiedEvents: string[] = [];

    // when
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    // then
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].id).toBe('2');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    // given
    const event: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // when
    const message = createNotificationMessage(event);

    // then
    expect(message).toBe('10분 후 팀 미팅 일정이 시작됩니다.');
  });

  it('다양한 알림 시간에 대해 올바른 메시지를 생성한다', () => {
    // given
    const event: Event = {
      id: '1',
      title: '점심 약속',
      date: '2024-03-20',
      startTime: '12:00',
      endTime: '13:00',
      description: '동료와 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    // when
    const message = createNotificationMessage(event);

    // then
    expect(message).toBe('30분 후 점심 약속 일정이 시작됩니다.');
  });
});
