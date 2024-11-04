import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    // given
    const date = new Date('2024-10-01');

    // when
    const holidays = fetchHolidays(date);

    // then
    expect(holidays).toEqual({
      '2024-10-03': '개천절',
      '2024-10-09': '한글날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    // given
    const date = new Date('2024-04-01');

    // when
    const holidays = fetchHolidays(date);

    // then
    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    // given
    const date = new Date('2024-09-01');

    // when
    const holidays = fetchHolidays(date);

    // then
    expect(holidays).toEqual({
      '2024-09-16': '추석',
      '2024-09-17': '추석',
      '2024-09-18': '추석',
    });
  });

  it('연초(1월)의 공휴일을 정확히 반환한다', () => {
    // given
    const date = new Date('2024-01-01');

    // when
    const holidays = fetchHolidays(date);

    // then
    expect(holidays).toEqual({
      '2024-01-01': '신정',
    });
  });

  it('연말(12월)의 공휴일을 정확히 반환한다', () => {
    // given
    const date = new Date('2024-12-01');

    // when
    const holidays = fetchHolidays(date);

    // then
    expect(holidays).toEqual({
      '2024-12-25': '크리스마스',
    });
  });

  it('설날과 같이 연속된 공휴일을 모두 반환한다', () => {
    // given
    const date = new Date('2024-02-01');

    // when
    const holidays = fetchHolidays(date);

    // then
    expect(holidays).toEqual({
      '2024-02-09': '설날',
      '2024-02-10': '설날',
      '2024-02-11': '설날',
    });
  });
});
