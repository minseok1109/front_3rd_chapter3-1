import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  //given
  const initEvents: Event[] = [
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
  ];

  setupMockHandlerCreation(initEvents);

  // when
  const { result } = renderHook(() => useEventOperations(false));

  // then
  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(initEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 되고 "일정이 추가되었습니다"라는 토스트가 노출된다', async () => {
  //given
  const initEvents: Event[] = [];
  setupMockHandlerCreation(initEvents);

  //when
  const { result } = renderHook(() => useEventOperations(false));

  //then
  await act(async () => {
    await result.current.saveEvent({
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
    });
  });

  expect(result.current.events).toEqual([expect.objectContaining({ title: '월간 보고' })]);

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
    })
  );
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 되고 '일정이 수정되었습니다'라는 토스트가 노출된다", async () => {
  //given
  const updateEvent: Event = {
    id: '1',
    title: '새로 업데이트 된 일정',
    date: '2024-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로 업데이트 된 일정',
    location: '회의실 B',
    category: '보고',
    repeat: {
      type: 'monthly',
      interval: 1,
      endDate: '2024-12-25',
    },
    notificationTime: 30,
  };

  setupMockHandlerUpdating();

  //when
  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  await act(async () => {
    await result.current.saveEvent(updateEvent);
  });

  expect(result.current.events).toEqual([
    expect.objectContaining({ title: '새로 업데이트 된 일정' }),
    expect.objectContaining({ title: '기존 회의2' }),
  ]);

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
    })
  );
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  //given
  setupMockHandlerDeletion();

  //when
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  //given
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json(null, { status: 500 });
    })
  );

  //when
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  //then
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '이벤트 로딩 실패',
    })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  //given
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];
  const nonExistentEvent: Event = {
    id: '100',
    title: '존재하지 않는 일정',
    date: '2024-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '존재하지 않는 일정',
    location: '회의실 B',
    category: '보고',
    repeat: {
      type: 'monthly',
      interval: 1,
      endDate: '2024-12-25',
    },
    notificationTime: 30,
  };

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    })
  );

  //when
  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.fetchEvents();
  });

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 저장 실패',
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  //given
  server.use(
    http.delete('/api/events/1', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  //when
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
    })
  );
});
