import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    // given
    const year = 2024;
    const month = 1;

    // when
    const daysInMonth = getDaysInMonth(year, month);

    // then
    expect(daysInMonth).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    // given
    const year = 2024;
    const month = 4;

    // when
    const daysInMonth = getDaysInMonth(year, month);

    // then
    expect(daysInMonth).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    // given
    const year = 2024;
    const month = 2;

    // when
    const daysInMonth = getDaysInMonth(year, month);

    // then
    expect(daysInMonth).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    // given
    const year = 2023;
    const month = 2;

    // when
    const daysInMonth = getDaysInMonth(year, month);

    // then
    expect(daysInMonth).toBe(28);
  });

  it('월이 12월이 넘어가면 해당 차이만큼의 다음해 월로 계산한다.', () => {
    // given
    const year = 2024;
    const month = 13;
    // when
    const daysInMonth = getDaysInMonth(year, month);
    // then
    expect(daysInMonth).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    //given
    const date = new Date('2024-11-02');
    //when
    const weekDates = getWeekDates(date);
    //then
    expect(weekDates).toEqual([
      new Date('2024-10-27'), // 일요일
      new Date('2024-10-28'), // 월요일
      new Date('2024-10-29'), // 화요일
      new Date('2024-10-30'), // 수요일
      new Date('2024-10-31'), // 목요일
      new Date('2024-11-01'), // 금요일
      new Date('2024-11-02'), // 토요일
    ]);
  });

  it('주의 시작(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // given
    const date = new Date('2024-11-02');
    // when
    const weekDates = getWeekDates(date);
    // then
    expect(weekDates).toEqual([
      new Date('2024-10-27'),
      new Date('2024-10-28'),
      new Date('2024-10-29'),
      new Date('2024-10-30'),
      new Date('2024-10-31'),
      new Date('2024-11-01'),
      new Date('2024-11-02'),
    ]);
  });

  it('주의 끝(토요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-11-02');
    // when
    const weekDates = getWeekDates(date);
    // then
    expect(weekDates[weekDates.length - 1]).toEqual(
      new Date('2024-11-02') // 토요일
    );
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    // given
    const date = new Date('2024-12-31');
    // when
    const weekDates = getWeekDates(date);
    // then
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    // given
    const date = new Date('2024-01-01');
    // when
    const weekDates = getWeekDates(date);
    // then
    expect(weekDates).toEqual([
      new Date('2023-12-31'), // 일요일
      new Date('2024-01-01'), // 월요일
      new Date('2024-01-02'), // 화요일
      new Date('2024-01-03'), // 수요일
      new Date('2024-01-04'), // 목요일
      new Date('2024-01-05'), // 금요일
      new Date('2024-01-06'), // 토요일
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // given
    const date = new Date('2024-02-29');
    // when
    const weekDates = getWeekDates(date);
    // then
    expect(weekDates).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // given
    const date = new Date('2024-03-31');
    // when
    const weekDates = getWeekDates(date);
    // then
    expect(weekDates).toEqual([
      new Date('2024-03-31'),
      new Date('2024-04-01'),
      new Date('2024-04-02'),
      new Date('2024-04-03'),
      new Date('2024-04-04'),
      new Date('2024-04-05'),
      new Date('2024-04-06'),
    ]);
  });
  it('계산 된 주는 총 7일을 반환한다.', () => {
    // given
    const date = new Date('2024-03-31');
    // when
    const weekDates = getWeekDates(date);
    // then
    expect(weekDates).toHaveLength(7);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    // given
    const date = new Date('2024-07-01');
    // when
    const weeks = getWeeksAtMonth(date);
    // then
    expect(weeks).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    // given
    const events: Event[] = [
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2024-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'event-2',
        title: '점심 약속',
        date: '2024-07-02',
        startTime: '12:00',
        endTime: '13:00',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
      {
        id: 'event-3',
        title: '가족 모임',
        date: '2024-07-03',
        startTime: '18:00',
        endTime: '20:00',
        description: '월간 가족 저녁 식사',
        location: '부모님 댁',
        category: '가족',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 60,
      },
      {
        id: 'event-4',
        title: '운동',
        date: '2024-07-04',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 1,
      },
      {
        id: 'event-5',
        title: '프로젝트 미팅',
        date: '2024-07-05',
        startTime: '14:00',
        endTime: '15:30',
        description: '신규 프로젝트 킥오프',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];

    // when
    const eventsForDay = getEventsForDay(events, 1);
    // then
    expect(eventsForDay).toEqual([
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2024-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('하루에 여러 이벤트가 있는 경우, 모든 이벤트를 반환한다', () => {
    // given
    const events: Event[] = [
      {
        id: 'event-1',
        title: '팀 회의',
        date: '2024-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'event-2',
        title: '점심 약속',
        date: '2024-07-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
      {
        id: 'event-3',
        title: '가족 모임',
        date: '2024-07-01',
        startTime: '18:00',
        endTime: '20:00',
        description: '월간 가족 저녁 식사',
        location: '부모님 댁',
        category: '가족',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 60,
      },
      {
        id: 'event-4',
        title: '운동',
        date: '2024-07-04',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 1,
      },
      {
        id: 'event-5',
        title: '프로젝트 미팅',
        date: '2024-07-05',
        startTime: '14:00',
        endTime: '15:30',
        description: '신규 프로젝트 킥오프',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ];
    // when
    const eventsForDay = getEventsForDay(events, 1);
    // then
    expect(eventsForDay).toHaveLength(3);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    // given
    const events: Event[] = [];
    // when
    const eventsForDay = getEventsForDay(events, 11);
    // then
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    // given
    const events: Event[] = [];
    // when
    const eventsForDay = getEventsForDay(events, 0);
    // then
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    // given
    const events: Event[] = [];
    // when
    const eventsForDay = getEventsForDay(events, 32);
    // then
    expect(eventsForDay).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    // given
    const date = new Date('2024-11-15');
    // when
    const week = formatWeek(date);
    // then
    expect(week).toBe('2024년 11월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    // given
    const date = new Date('2024-11-01');
    // when
    const week = formatWeek(date);
    // then
    expect(week).toBe('2024년 10월 5주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // given
    const date = new Date('2024-11-30');
    // when
    const week = formatWeek(date);
    // then
    expect(week).toBe('2024년 11월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    // given
    const date = new Date('2024-12-31');
    // when
    const week = formatWeek(date);
    // then
    expect(week).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // given
    const date = new Date('2024-02-29');
    // when
    const week = formatWeek(date);
    // then
    expect(week).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    // given
    const date = new Date('2023-02-28');
    // when
    const week = formatWeek(date);
    // then
    expect(week).toBe('2023년 3월 1주');
  });
});

describe('formatMonth', () => {
  it('2024년 7월 10일을 "2024년 7월"로 반환한다', () => {
    // given
    const date = new Date('2024-07-10');
    // when
    const month = formatMonth(date);
    // then
    expect(month).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    // given
    const date = new Date('2024-07-10');
    // when
    const isInRange = isDateInRange(date, rangeStart, rangeEnd);
    // then
    expect(isInRange).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    // given
    const date = new Date('2024-07-01');
    // when
    const isInRange = isDateInRange(date, rangeStart, rangeEnd);
    // then
    expect(isInRange).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    // given
    const date = new Date('2024-07-31');
    // when
    const isInRange = isDateInRange(date, rangeStart, rangeEnd);
    // then
    expect(isInRange).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    // given
    const date = new Date('2024-06-30');
    // when
    const isInRange = isDateInRange(date, rangeStart, rangeEnd);
    // then
    expect(isInRange).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    // given
    const date = new Date('2024-08-01');
    // when
    const isInRange = isDateInRange(date, rangeStart, rangeEnd);
    // then
    expect(isInRange).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    // given
    const date = new Date('2024-08-01');
    // when
    const isInRange = isDateInRange(date, rangeEnd, rangeStart);
    // then
    expect(isInRange).toBe(false);
  });
});

describe('fillZero', () => {
  test('5를 2자리로 변환하면 "05"를 반환한다', () => {
    // given
    const value = 5;
    // when
    const filledZero = fillZero(value);
    // then
    expect(filledZero).toBe('05');
  });

  test('10을 2자리로 변환하면 "10"을 반환한다', () => {
    // given
    const value = 10;
    // when
    const filledZero = fillZero(value);
    // then
    expect(filledZero).toBe('10');
  });

  test('3을 3자리로 변환하면 "003"을 반환한다', () => {
    // given
    const value = 3;
    const size = 3;
    // when
    const filledZero = fillZero(value, size);
    // then
    expect(filledZero).toBe('003');
  });

  test('100을 2자리로 변환하면 "100"을 반환한다', () => {
    // given
    const value = 100;
    // when
    const filledZero = fillZero(value);
    // then
    expect(filledZero).toBe('100');
  });

  test('0을 2자리로 변환하면 "00"을 반환한다', () => {
    // given
    const value = 0;
    // when
    const filledZero = fillZero(value);
    // then
    expect(filledZero).toBe('00');
  });

  test('1을 5자리로 변환하면 "00001"을 반환한다', () => {
    // given
    const value = 1;
    const size = 5;
    // when
    const filledZero = fillZero(value, size);
    // then
    expect(filledZero).toBe('00001');
  });

  test('소수점이 있는 3.14를 5자리로 변환하면 "03.14"를 반환한다', () => {
    // given
    const value = 3.14;
    const size = 5;
    // when
    const filledZero = fillZero(value, size);
    // then
    expect(filledZero).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    // given
    const value = 1;
    // when
    const filledZero = fillZero(value);
    // then
    expect(filledZero).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    // given
    const value = 12345;
    const size = 2;
    // when
    const filledZero = fillZero(value, size);
    // then
    expect(filledZero).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {});

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {});

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {});
});
