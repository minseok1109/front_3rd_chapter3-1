import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-10-01',
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
      date: '2024-10-02',
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
      date: '2024-10-03',
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

  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
  //when
  act(() => {
    result.current.setSearchTerm(() => '');
  });
  // then
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-10-01',
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
      date: '2024-10-02',
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
      date: '2024-10-03',
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

  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  //when
  act(() => {
    result.current.setSearchTerm(() => '팀');
  });
  //then
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-10-01',
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
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-10-01',
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
      date: '2024-10-02',
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
      date: '2024-10-03',
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

  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  //when
  act(() => {
    result.current.setSearchTerm(() => '보고서');
  });
  //then
  expect(result.current.filteredEvents).toEqual([
    {
      id: '3',
      title: '월간 보고서 작성',
      date: '2024-10-03',
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
  ]);

  act(() => {
    result.current.setSearchTerm(() => '회의');
  });
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-10-01',
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
  ]);

  act(() => {
    result.current.setSearchTerm(() => '클라이언트');
  });
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '점심 약속',
      date: '2024-10-02',
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
  ]);
});

it('현재 뷰(월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '월간 보고',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 실적 보고',
      location: '회의실 B',
      category: '보고',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '주간 1:1 미팅',
      date: '2024-10-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀원과 주간 미팅',
      location: '회의실 C',
      category: '미팅',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
    {
      id: '4',
      title: '11월 전략 회의',
      date: '2024-11-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '11월 전략 수립 회의',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '5',
      title: '주간 코드 리뷰',
      date: '2024-11-07',
      startTime: '15:00',
      endTime: '16:00',
      description: '팀 코드 리뷰 미팅',
      location: '회의실 B',
      category: '개발',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
  //when
  act(() => {
    result.current.setSearchTerm(() => '회의');
  });
  //then
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-25' },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '월간 보고',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 실적 보고',
      location: '회의실 B',
      category: '보고',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-12-25' },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '주간 1:1 미팅',
      date: '2024-10-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀원과 주간 미팅',
      location: '회의실 C',
      category: '미팅',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-25' },
      notificationTime: 15,
    },
  ]);
});
it('현재 뷰(주간)에 해당하는 이벤트만 반환해야 한다', () => {
  // given
  const events: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '월간 보고',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 실적 보고',
      location: '회의실 B',
      category: '보고',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '주간 1:1 미팅',
      date: '2024-10-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀원과 주간 미팅',
      location: '회의실 C',
      category: '미팅',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
    {
      id: '4',
      title: '11월 전략 회의',
      date: '2024-11-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '11월 전략 수립 회의',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '5',
      title: '주간 코드 리뷰',
      date: '2024-11-07',
      startTime: '15:00',
      endTime: '16:00',
      description: '팀 코드 리뷰 미팅',
      location: '회의실 B',
      category: '개발',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date(), 'week'));
  //when
  act(() => {
    result.current.setSearchTerm(() => '회의');
  });
  //then
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-25' },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '주간 1:1 미팅',
      date: '2024-10-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀원과 주간 미팅',
      location: '회의실 C',
      category: '미팅',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-25' },
      notificationTime: 15,
    },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  //given
  const events: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '월간 보고',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 실적 보고',
      location: '회의실 B',
      category: '보고',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '점심',
      date: '2024-10-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀원과 주간 미팅',
      location: '회의실 C',
      category: '미팅',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
    {
      id: '4',
      title: '11월 전략 회의',
      date: '2024-11-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '11월 전략 수립 회의',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '5',
      title: '주간 코드 리뷰',
      date: '2024-11-07',
      startTime: '15:00',
      endTime: '16:00',
      description: '팀 코드 리뷰 미팅',
      location: '회의실 B',
      category: '개발',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
  ];

  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  //when
  act(() => {
    result.current.setSearchTerm(() => '회의');
  });

  //then
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '월간 보고',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 실적 보고',
      location: '회의실 B',
      category: '보고',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '점심',
      date: '2024-10-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀원과 주간 미팅',
      location: '회의실 C',
      category: '미팅',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
  ]);

  act(() => {
    result.current.setSearchTerm(() => '점심');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: '3',
      title: '점심',
      date: '2024-10-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀원과 주간 미팅',
      location: '회의실 C',
      category: '미팅',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-25',
      },
      notificationTime: 15,
    },
  ]);
});
