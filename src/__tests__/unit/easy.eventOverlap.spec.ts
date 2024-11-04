import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { assertDate } from '../utils';

beforeEach(() => {});

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    // given
    const date = '2024-07-01';
    const time = '14:30';
    // when
    const result = parseDateTime(date, time);
    // then
    assertDate(result, new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    // given
    const date = '2024-13-01';
    const time = '12:30';
    // when
    const result = parseDateTime(date, time);
    // then
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    // given
    const date = '2024-07-01';
    const time = '25:30';
    // when
    const result = parseDateTime(date, time);
    // then
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    // given
    const date = '';
    const time = '14:30';
    // when
    const result = parseDateTime(date, time);
    // then
    expect(result.toString()).toBe('Invalid Date');
  });

  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    // given
    const date = '2024-07-01';
    const time = '';
    // when
    const result = parseDateTime(date, time);
    // then
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜와 시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    // given
    const date = '';
    const time = '';
    // when
    const result = parseDateTime(date, time);
    // then
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
    id: '1',
    title: '팀 미팅',
    date: '2024-03-20',
    startTime: '10:00',
    endTime: '11:30',
    description: '주간 팀 미팅 - 프로젝트 진행상황 논의',
    location: '회의실 A',
    category: '회의',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-06-20',
    },
    notificationTime: 30, // 30분 전 알림
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    // given
    // when
    const result = convertEventToDateRange(event);
    // then
    assertDate(result.start, parseDateTime(event.date, event.startTime));
    assertDate(result.end, parseDateTime(event.date, event.endTime));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    // given
    const wrongDateEvent: Event = {
      ...event,
      date: '2024-13-01',
    };
    // when
    const result = convertEventToDateRange(wrongDateEvent);
    // then
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    // given
    const wrongTimeEvent: Event = {
      ...event,
      startTime: '25:30',
      endTime: '26:30',
    };
    // when
    const result = convertEventToDateRange(wrongTimeEvent);
    // then
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    // given
    const event1: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:30',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-06-20',
      },
      notificationTime: 30,
    };

    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '11:00', // event1의 종료 시간(11:30)과 겹침
      endTime: '12:00',
    };

    // when
    const result = isOverlapping(event1, event2);

    // then
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    // given
    const event1: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:30',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-06-20',
      },
      notificationTime: 30,
    };

    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '14:00',
      endTime: '15:00',
    };

    // when
    const result = isOverlapping(event1, event2);

    // then
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    // given
    const newEvent: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:30',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-06-20',
      },
      notificationTime: 30,
    };

    const existingEvents: Event[] = [
      {
        ...newEvent,
        id: '2',
        startTime: '11:00',
        endTime: '12:00',
      },
      {
        ...newEvent,
        id: '3',
        startTime: '14:00',
        endTime: '15:00',
      },
    ];

    // when
    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    // then
    expect(overlappingEvents).toHaveLength(1);
    expect(overlappingEvents[0].id).toBe('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    // given
    const newEvent: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-06-20',
      },
      notificationTime: 30,
    };

    const existingEvents: Event[] = [
      {
        ...newEvent,
        id: '2',
        startTime: '12:00',
        endTime: '13:00',
      },
      {
        ...newEvent,
        id: '3',
        startTime: '14:00',
        endTime: '15:00',
      },
    ];

    // when
    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    // then
    expect(overlappingEvents).toHaveLength(0);
  });
});
