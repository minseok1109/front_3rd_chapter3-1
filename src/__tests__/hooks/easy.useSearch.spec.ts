import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  // given
  const events: Event[] = [
    {
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
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2024-03-21',
      startTime: '12:00',
      endTime: '13:00',
      description: '클라이언트와 점심 미팅',
      location: '서울 강남구 레스토랑',
      category: '미팅',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 15, // 15분 전 알림
    },
    {
      id: '3',
      title: '월간 보고서 작성',
      date: '2024-03-25',
      startTime: '14:00',
      endTime: '16:00',
      description: '3월 월간 보고서 작성 및 검토',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 60, // 60분 전 알림
    },
  ];

  const { result } = renderHook(() => useSearch(events,));
  const { filteredEvents } = result.current;
  // then
  expect(filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {});
