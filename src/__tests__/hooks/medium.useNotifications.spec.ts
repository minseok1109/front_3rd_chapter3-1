import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  // given
  const events: Event[] = [];

  // when
  const { result } = renderHook(() => useNotifications(events));

  // then
  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(new Date(Date.now() + 10 * 60 * 1000).getTime()),
      endTime: '12:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  // when
  const { result } = renderHook(() => useNotifications(events));

  // then
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: expect.stringContaining('테스트 이벤트'),
  });
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(new Date(Date.now() + 10 * 60 * 1000).getTime()),
      endTime: '12:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(new Date(Date.now() + 10 * 60 * 1000).getTime()),
      endTime: '12:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  // when
  const { result } = renderHook(() => useNotifications(events));

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });

  expect(result.current.notifications).toHaveLength(2);

  // then
  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(new Date(Date.now() + 10 * 60 * 1000).getTime()),
      endTime: '12:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  // when
  const { result } = renderHook(() => useNotifications(events));

  // then
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });

  expect(result.current.notifications).toHaveLength(1);

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);
});
