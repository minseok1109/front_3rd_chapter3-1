import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '장소 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-02',
      startTime: '11:00',
      endTime: '12:00',
      description: '두 번째 이벤트',
      location: '장소 2',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '3',
      title: '미팅',
      date: '2024-07-31',
      startTime: '14:00',
      endTime: '15:00',
      description: '이벤트 관련 미팅',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '4',
      title: 'event 4',
      date: '2024-07-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '이벤트 관련 미팅',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    // given
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2024-07-01');
    // when
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, 'month');
    // then
    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    // given
    const currentDate = new Date('2024-07-01');
    // when
    const filteredEvents = getFilteredEvents(events, '', currentDate, 'week');
    const eventDates = filteredEvents.map((e) => e.date);
    // then
    expect(filteredEvents).toHaveLength(2);
    expect(eventDates).toEqual(['2024-07-01', '2024-07-02']);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    // given
    const currentDate = new Date('2024-07-15');
    // when
    const filteredEvents = getFilteredEvents(events, '', currentDate, 'month');
    // then
    expect(filteredEvents).toHaveLength(4);
    expect(filteredEvents.map((e) => e.date)).toEqual([
      '2024-07-01',
      '2024-07-02',
      '2024-07-31',
      '2024-07-21',
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    // given
    const searchTerm = '이벤트';
    const currentDate = new Date('2024-07-01');
    // when
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, 'week');
    const eventTitles = filteredEvents.map((e) => e.title);
    // then
    expect(filteredEvents).toHaveLength(2);
    expect(eventTitles).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    // given
    const currentDate = new Date('2024-07-15');
    // when
    const filteredEvents = getFilteredEvents(events, '', currentDate, 'month');
    // then
    expect(filteredEvents).toHaveLength(4);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    // given
    const searchTerm = 'EVENT';
    const currentDate = new Date('2024-07-15');
    // when
    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, 'month');
    // then
    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents.map((e) => e.title)).toEqual(['event 4']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    // given
    const currentDate = new Date('2024-07-31');
    // when
    const filteredEvents = getFilteredEvents(events, '', currentDate, 'week');
    // then
    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents[0].date).toBe('2024-07-31');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    // given
    const currentDate = new Date('2024-07-15');
    // when
    const filteredEvents = getFilteredEvents([], '', currentDate, 'month');
    // then
    expect(filteredEvents).toEqual([]);
  });
});
