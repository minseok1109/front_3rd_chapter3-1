import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    setupMockHandlerCreation();
    await saveSchedule(user, {
      title: '회의',
      date: '2024-10-31',
      startTime: '10:00',
      endTime: '11:15',
      category: '업무',
      description: '설명',
      location: '회의실',
    });

    expect(within(eventList).getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(within(eventList).getByText('회의')).toBeInTheDocument();
    expect(within(eventList).getByText('2024-10-31')).toBeInTheDocument();
    expect(within(eventList).getByText(/10:00/)).toBeInTheDocument();
    expect(within(eventList).getByText(/11:15/)).toBeInTheDocument();
    expect(within(eventList).getByText('설명')).toBeInTheDocument();
    expect(within(eventList).getByText('회의실')).toBeInTheDocument();
    expect(within(eventList).getByText(/업무/)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '수정할 프로젝트',
        date: '2024-10-31',
        startTime: '09:00',
        endTime: '10:30',
        category: '업무',
        description: '프로젝트 설명',
        location: '오피스',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    setupMockHandlerCreation(initialEvents);

    const user = setup(<App />).user;

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => expect(within(eventList).getByText('수정할 프로젝트')).toBeInTheDocument());

    const editButtons = within(eventList).getAllByLabelText(/Edit event/i);
    expect(editButtons.length).toBeGreaterThan(0);

    await user.click(editButtons[0]);

    const titleInput = screen.getByLabelText(/제목/i) as HTMLInputElement;
    const startTimeInput = screen.getByLabelText(/시작 시간/i) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText(/종료 시간/i) as HTMLInputElement;

    expect(titleInput.value).toBe('수정할 프로젝트');
    expect(startTimeInput.value).toBe('09:00');
    expect(endTimeInput.value).toBe('10:30');

    await user.clear(titleInput);
    await user.type(titleInput, '수정된 프로젝트');

    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:00');

    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:00');

    setupMockHandlerUpdating();

    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(within(eventList).getByText('수정된 프로젝트')).toBeInTheDocument();
    });

    expect(within(eventList).queryByText('수정할 프로젝트')).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const user = setup(<App />).user;

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => expect(within(eventList).getByText('삭제할 이벤트')).toBeInTheDocument());

    const deleteButtons = within(eventList).getAllByLabelText(/Delete event/i);
    expect(deleteButtons.length).toBeGreaterThan(0);

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(within(eventList).queryByText('삭제할 이벤트')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]);

    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    const viewOptions = screen.getByRole('combobox', { name: /view/i });
    await user.selectOptions(viewOptions, 'week');

    await waitFor(() => {
      expect(within(eventList).getByText(/검색 결과가 없습니다./i)).toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2024-11-08');

    setupMockHandlerCreation([
      {
        title: '생일',
        date: '2024-11-09',
        startTime: '10:00',
        endTime: '11:00',
        category: '개인',
        description: '야호',
        location: '집',
        id: '1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    const user = setup(<App />).user;
    const viewOptions = screen.getByRole('combobox', { name: /view/i });
    await user.selectOptions(viewOptions, 'week');

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('생일')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);

    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    const viewOptions = screen.getByRole('combobox', { name: /view/i });
    await user.selectOptions(viewOptions, 'month');

    await waitFor(() => {
      expect(within(eventList).getByText(/검색 결과가 없습니다./i)).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime('2024-11-08');

    setupMockHandlerCreation([
      {
        title: '생일',
        date: '2024-11-09',
        startTime: '10:00',
        endTime: '11:00',
        category: '개인',
        description: '야호',
        location: '집',
        id: '1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    const viewOptions = screen.getByRole('combobox', { name: /view/i });
    await user.selectOptions(viewOptions, 'month');

    await waitFor(() => {
      expect(within(eventList).getByText('생일')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2024-01-01');

    setupMockHandlerCreation([]);

    const user = setup(<App />).user;

    const viewOptions = screen.getByRole('combobox', { name: /view/i });
    await user.selectOptions(viewOptions, 'month');

    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    const newYear = screen.getByRole('cell', { name: /1 신정/i });
    expect(newYear).toBeInTheDocument();
    expect(newYear).toHaveTextContent('신정');
    expect(newYear).toHaveStyle('color: red.500');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([
      {
        title: '아무 제목이나 써',
        date: '2024-11-08',
        startTime: '10:00',
        endTime: '11:00',
        category: '업무',
        description: '아무 설명이나 써',
        location: '아무 위치나 써',
        id: '1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ]);

    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    expect(within(eventList).getByText(/검색 결과가 없습니다./i)).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '프로젝트 회의',
        date: '2024-10-29',
        startTime: '10:00',
        endTime: '11:15',
        category: '업무',
        description: '프로젝트 진행 상황 점검',
        location: '회의실 A',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '개발팀 회의',
        date: '2024-10-30',
        startTime: '10:00',
        endTime: '11:15',
        category: '업무',
        description: '개발 이슈 논의',
        location: '회의실 B',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '점심 모임',
        date: '2024-10-31',
        startTime: '12:00',
        endTime: '13:15',
        category: '개인',
        description: '동료들과 점심',
        location: '식당',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '고객 미팅',
        date: '2024-10-31',
        startTime: '14:00',
        endTime: '15:15',
        category: '개인',
        description: '고객 요구사항 수집',
        location: '회의실 C',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    setupMockHandlerCreation(initialEvents);

    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('프로젝트 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('개발팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('점심 모임')).toBeInTheDocument();
      expect(within(eventList).getByText('고객 미팅')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.clear(searchInput);
    await user.type(searchInput, '프로젝트 회의');

    expect(within(eventList).getByText('프로젝트 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개발팀 회의')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('점심 모임')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('고객 미팅')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '프로젝트 회의',
        date: '2024-10-29',
        startTime: '10:00',
        endTime: '11:15',
        category: '업무',
        description: '프로젝트 진행 상황 점검',
        location: '회의실 A',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '개발팀 회의',
        date: '2024-10-30',
        startTime: '10:00',
        endTime: '11:15',
        category: '업무',
        description: '개발 이슈 논의',
        location: '회의실 B',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '3',
        title: '점심 모임',
        date: '2024-10-31',
        startTime: '12:00',
        endTime: '13:15',
        category: '개인',
        description: '동료들과 점심',
        location: '식당',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '4',
        title: '고객 미팅',
        date: '2024-10-31',
        startTime: '14:00',
        endTime: '15:15',
        category: '개인',
        description: '고객 요구사항 수집',
        location: '회의실 C',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    setupMockHandlerCreation(initialEvents);

    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('프로젝트 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('개발팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('점심 모임')).toBeInTheDocument();
      expect(within(eventList).getByText('고객 미팅')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /일정 검색/i });

    // 검색어 입력 후 해당 이벤트만 보이는지 확인
    await user.clear(searchInput);
    await user.type(searchInput, '프로젝트 회의');

    expect(within(eventList).getByText('프로젝트 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개발팀 회의')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('점심 모임')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('고객 미팅')).not.toBeInTheDocument();

    // 검색어를 지운 후 모든 일정이 다시 표시되는지 확인
    await user.clear(searchInput);

    await waitFor(() => {
      expect(within(eventList).getByText('프로젝트 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('개발팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('점심 모임')).toBeInTheDocument();
      expect(within(eventList).getByText('고객 미팅')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const initialEvents: Event[] = [
      {
        id: '1',
        title: '기존 일정',
        date: '2024-10-31',
        startTime: '14:00',
        endTime: '15:00',
        category: '업무',
        description: '기존 일정 설명',
        location: '회의실 A',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    setupMockHandlerCreation(initialEvents);

    const user = setup(<App />).user;
    const addButton = screen.getByRole('button', { name: /일정 추가/i });

    expect(addButton).toBeInTheDocument();

    await saveSchedule(user, {
      title: '겹치는 일정',
      date: '2024-10-31',
      startTime: '13:30',
      endTime: '15:00',
      category: '업무',
      description: '설명',
      location: '회의실',
    });

    // 경고 메시지 확인
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const user = setup(<App />).user;
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });

    const editButtons = within(eventList).getAllByLabelText(/Edit event/i);
    await user.click(editButtons[0]);

    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    const endTimeInput = screen.getByLabelText(/종료 시간/i);

    expect(startTimeInput).toHaveValue('09:00');
    expect(endTimeInput).toHaveValue('10:00');

    await user.clear(startTimeInput);
    await user.type(startTimeInput, '11:30');

    await user.clear(endTimeInput);
    await user.type(endTimeInput, '12:30');

    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2024-11-09T13:50:00'));

  const initialEvents: Event[] = [
    {
      id: '1',
      title: '생일 10분 전',
      date: '2024-11-09',
      startTime: '14:00',
      endTime: '15:00',
      category: '개인',
      description: '알람 테스트용 일정',
      location: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  setupMockHandlerCreation(initialEvents);

  setup(<App />);
  await screen.findByTestId('event-list');

  await waitFor(() => {
    expect(screen.getByText(/일정이 시작됩니다/i)).toBeInTheDocument();
  });
});
