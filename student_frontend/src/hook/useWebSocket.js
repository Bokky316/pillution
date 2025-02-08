import { Client } from "@stomp/stompjs"; // stomp는 webSoket을 사용하는 프로토콜 중 하나
import SockJS from "sockjs-client"; // SocketJS 는 WebSoket을 사용하기 위해 쉽게 만들어주는 라이브러리
//import { showSnackbar } from "../redux/snackbarSlice"; // ✅ Snackbar 액션 추가
import { useDispatch } from "react-redux"; // 역할 : 아래에 주석
import { useEffect } from "react"; // 유저가 바뀌었을 때
import { API_URL, SERVER_URL } from "@/constant";
import { fetchWithAuth, fetchWithoutAuth } from "@features/auth/utils/fetchWithAuth";
import { setMessages, addMessage } from "@/redux/messageSlice"; // ✅ Redux 액션 가져오기

/**
 * WebSocket을 사용하는 커스텀 훅
 * - WebSocket을 사용하여 실시간 채팅을 구현할 때 사용합니다.
 * - 사용자가 로그인하면 WebSocket을 통해 새로운 메시지를 받아옵니다.
 * - 새로운 메시지가 도착하면 스낵바로 알림을 표시합니다.
 * - 새로운 메시지가 도착하면 메시지 목록을 즉시 갱신합니다.
 *
 * @type {null}
 */
let stompClient = null; // ✅ 전역 변수로 설정 (중복 연결 방지)
const useWebSocket = (user) => {
    const dispatch = useDispatch(); // dispatch 함수 가져오기 , 가져온 dispatch 함수를 사용하여 Redux 상태를 변경 (데이터변경은 Reducer 함수로 해야한다 맘대로 하면안댐 / 데이터를 변경하는걸 디스패치 한다라고 함)

    /**
     * user, dispatch, setUnreadCount, setMessages 에서 변화가 있을 경우 내부 구조를 재실행
     * 1. user
     * - 사용자가 로그인하거나 로그아웃할 때 user 상태가 변경됨.
     * - user.id를 기반으로 WebSocket을 연결하므로, user가 변경되면 WebSocket 연결을 재설정해야 함.
     * - user가 로그인됨 → WebSocket 연결 시작, user가 로그아웃됨 → WebSocket 연결 해제
     * 2. dispatch (Redux의 액션 디스패치 함수)
     * - WebSocket에서 새로운 메시지를 수신하면 dispatch(showSnackbar(...))를 호출하여 Redux 상태를 변경함.
     * - showSnackbar 기능이 변경되거나, dispatch가 새로운 인스턴스로 교체되었을 경우 useEffect가 이를 감지하고 재실행.
     * 3. setUnreadCount 함수(안 읽은 메시지 개수 업데이트)
     * - WebSocket에서 새로운 메시지를 수신하면, 읽지 않은 메시지 개수를 업데이트해야 함.
     * - setUnreadCount를 최신 상태로 유지해야 하므로, useEffect가 setUnreadCount를 최신 상태로 감지할 수 있도록 의존성 배열에 포함.
     * 4. setMessages (메시지 목록 업데이트)
     * - 새로운 메시지가 오면 setMessages를 사용하여 메시지 목록을 즉시 업데이트해야 함.
     * - setMessages의 상태가 변경될 때 useEffect가 이를 감지하고 동작을 보장해야 함.
     * - WebSocket에서 메시지가 오면 setMessages(fetchMessages(user.id))를 호출하여 최신 메시지 목록을 반영.
     * - // 사용자가 바뀌거나 화면이 최초 마운트될때 유즈 이펙트 실행됨
     * 유저가 있고
     */
    useEffect(() => { // 사용자가 바뀌거나 화면이 최초 마운트될때 유즈 이펙트 실행됨
        if (!user?.id || stompClient) return; // ✅ 중복 연결 방지, user.id 없거나 stompClient가 이미 연결되어 있으면 return
        //  유저가 없고 (아이디가 없고 = 로그인안함/ 리액트가 화면새로고침할때 일시적으로 사용자 아이디 사라질 수 있다 근데 리덕스에는 보관되어 있다. 그럴경우에도  메세지 받을 수 있도록 하기 위한 조건)

        console.log("🛠 WebSocket 연결 시도 - user ID:", user?.id);

        const socket = new SockJS(`${SERVER_URL}ws`); // WebSoket 연결, ws: //localhost:8080/ws, SocketJS로 서버에 WebSoket 연결
        stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(`🔍 WebSocket Debug: ${str}`),
            reconnectDelay: 5000, // ✅ 5초 후 자동 재연결

            // onConnect : 연결 성공 시 실행할 콜백 함수
            onConnect: async () => { // 비동기 : async
                console.log("📡 WebSocket 연결 성공!");

                // ✅ 기존 메시지 가져오기 (Redux 사용)
                await fetchMessages(user.id, dispatch);  // ✅ dispatch 전달 (fetchMessages : 메세지 조회해 오는 것) 아래에 있음

                // ✅ 구독 실행 이 작업이 중요 @SendTo/topic/chat 요청한게 우리쪽으로 들어온다고 생각
                stompClient.subscribe(`/topic/chat/${user.id}`, async (message) => {
                    console.log("📨 useWebSocket > stompClient.subscribe 새로운 메시지 도착! message.body : ", message.body);

                    const parsedMessage = JSON.parse(message.body);

                    // ✅ Redux 상태에 새 메시지 추가 // 그걸 받아서 디스패치 애드메세지해서 리덕스에 하나 추가하는 것
                    dispatch(addMessage(parsedMessage));

                    // ✅ DB에서 최신 메시지 목록 불러오기 // 이 기능은 아직 미구현
                    await fetchMessages(user.id, dispatch);  // ✅ dispatch 전달
                });
            },

            onStompError: (frame) => {
                console.error("❌ STOMP 오류 발생:", frame);
            },
        });

        stompClient.activate(); // ✅ WebSocket 활성화

        return () => {
            if (stompClient) {
                stompClient.deactivate();
                stompClient = null;
            }
        };
    }, [user, dispatch]);
};

// ✅ 메시지 목록 가져오기 (dispatch 추가)
const fetchMessages = async (userId, dispatch) => {
    try {
        const response = await fetchWithAuth(`${API_URL}messages/${userId}`);
        if (response.ok) {
            const data = await response.json(); // JSON 문자열 형태로 전달되 오는 결과를 자바스크립트 객체로 변환
            dispatch(setMessages(data)); // ✅ Redux에 저장
        }
    } catch (error) {
        console.error("🚨 메시지 목록 조회 실패:", error.message);
    }
};

export default useWebSocket;
