/**
 * src/common/fetchWithAuth.js
 * - API 요청 시 JWT 액세스 토큰을 헤더에 포함하여 요청시 사용
 * - fetch API를 사용하여 API 요청을 보내고, 응답을 반환
 * - fetch API의 두 번째 인자로 옵션 객체를 받아서 사용
 * - 기본 Content-Type은 application/json으로 설정
 * - 액세스 토큰은 저장시 "/"로 저장해서 모든 요청에 포함되며 리프레시 토큰은 "/refresh"로 저장해서 "/refresh" 요청에만 포함됨
 * - 401 UnAuthroized 상태 발생 시 "/refresh" 요청을 서버에 하게 되면 액세스 토큰+리프레시 토큰이 함께 서버로 전성됨.
 *   전송된 리프레시 토큰은 서버에서 검증 후 새로운 액세스 토큰을 발급하고 이를 응답으로 클라이언트에 전송함.
 */

import {SERVER_URL} from "@/utils/constants"; // "/refresh" 요청 시 사용
console.log('SERVER_URL:', SERVER_URL);

/**
 * 액세스 토큰 갱신 함수
 * - 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받는 함수
 * - API_URL/auth/refresh 엔드포인트로 POST 요청을 보내서 새로운 액세스 토큰을 발급받음
 * - 응답이 성공하면 새로운 액세스 토큰을 반환
 *
 * @returns {Promise<boolean>} 토큰 갱신 성공 여부
 */
export const refreshAccessToken = async () => {
    try {
        const response = await fetch(`${SERVER_URL}refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("refreshAccessToken /refresh 요청후 받은 응답 response: ", response);

        if (!response.ok) {
            console.log("리프레시 토큰 갱신 실패", response.status);
            throw new Error(`리프레시 토큰 갱신 실패: ${response.status}`);
        }

        console.log("refreshAccessToken 리프레시 토큰 발급 성공");
        return true; // 성공 시 true 반환

    } catch (error) {
        console.error("리프레시 토큰 처리 오류:", error.message);
        return false; // 실패 시 false 반환
    }
};

/**
 * API 요청을 보내는 함수
 * - 요청을 보낼 때 헤더와 JWT 토큰을 포함하여 요청
 * - options 객체에 method, body 등을 객체 형태로 만들어서 보내기 때문에 options = {}로 초기화
 * - credentials: "include" : 요청할 때 HttpOnly 쿠키를 포함해서 요청, 이게 있어야 서버에서 인증.
 *   서버에서는 이걸 받아서 토큰을 디코딩 해서 사용자 정보를 추출하고 그것을 SecurityContext 에 저장한다.
 *   그리고 저장된 정보에서 권한을 조회해서 요청한 메뉴에 대한 권한이 있는지 확인한다.
 * @param {string} url 요청할 URL
 * @param {Object} options fetch API의 두 번째 인자로 전달할 옵션 객체
 * @returns {Promise<Response>} fetch 응답 객체
 */
export const fetchWithAuth = async (url, options = {}) => {
  console.log('fetchWithAuth called with:', { url, options });
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  if (config.method) {
    config.method = config.method.toUpperCase();
  }

  console.log('Sending request with config:', config);

  try {
    const response = await fetch(url, config);
    console.log('Response received:', response);

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.status === 401) {
                //const errorData = await response.json(); // 이 부분을 제거
                //console.warn(`401 Error: ${errorData.message}`);

                //if (errorData.message.includes("만료")) { // 이 부분을 수정
                console.log("fetchWithAuth.js: 액세스 토큰 만료되어 refreshAccessToken() 호출 - 1");
                const refreshSuccess = await refreshAccessToken();

                if (refreshSuccess) {
                    console.log("리프레시 토큰 성공, 기존 요청 재시도");
                    const newResponse = await fetch(url, config); // 기존 요청 재시도
                    return newResponse;
                } else {
                    console.error("리프레시 토큰 갱신 실패");
                    throw new Error("Unauthorized: 리프레시 토큰 갱신 실패");
                }
                //} else {
                //    throw new Error(`Unauthorized: ${errorData.message}`);
                //}
            }


        return response;
    } catch (error) {
        console.error("API 요청 실패:", error.message);
        throw error;
    }
};

/**
 * 인증이 필요 없는 API 요청을 보내는 함수
 * - JWT 토큰을 포함하지 않고 요청
 * - 예를들면 회원가입, 로그인 등
 * @param {string} url 요청할 URL
 * @param {Object} options fetch API의 두 번째 인자로 전달할 옵션 객체
 * @returns {Promise<Response>} fetch 응답 객체
 */
export const fetchWithoutAuth = async (url, options = {}) => {
    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers, // 기존 헤더 유지
        },
        credentials: "include",
    };

    // HTTP 메소드를 대문자로 변환
    if (config.method) {
        config.method = config.method.toUpperCase();
    }

    console.log('Request config:', config);

    try {
        const response = await fetch(url, config); // 비동기 요청
        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status}`);
        }
        return response; // 서버 응답 반환
    } catch (error) {
        console.error("API 요청 실패:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw error;
    }
};
