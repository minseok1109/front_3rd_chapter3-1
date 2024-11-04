import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    // given
    const startTime = '14:00';
    const endTime = '13:00';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    // given
    const startTime = '14:00';
    const endTime = '14:00';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    // given
    const startTime = '09:00';
    const endTime = '10:00';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    // given
    const startTime = '';
    const endTime = '10:00';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    // given
    const startTime = '09:00';
    const endTime = '';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    // given
    const startTime = '';
    const endTime = '';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('분 단위까지 정확하게 시간 비교가 이루어진다', () => {
    // given
    const startTime = '09:30';
    const endTime = '09:15';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('정상적인 시간 범위에서 분 단위 비교가 올바르게 동작한다', () => {
    // given
    const startTime = '09:00';
    const endTime = '09:01';

    // when
    const result = getTimeErrorMessage(startTime, endTime);

    // then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
