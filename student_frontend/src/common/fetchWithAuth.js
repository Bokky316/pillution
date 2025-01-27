/**
 * src/common/fetchWithAuth.js
 * - API 요청 시 JWT 인증 토큰을 헤더에 포함하여 요청시 사용
 * - fetch API를 사용하여 API 요청을 보내고, 응답을 반환
 * - fetch API의 두 번째 인자로 옵션 객체를 받아서 사용
 * - 기본 Content-Type은 application/json으로 설정
 * - 인증 토큰은 localStorage에서 가져와서 헤더에 추가
 * - 401 상태 발생 시 리프레시 토큰으로 새로운 액세스 토큰 발급 및 요청 재시도
 */

import { API_URL } from "../constant";

// 리프레시 토큰을 사용해 새로운 액세스 토큰 발급
const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken"); // 리프레시 토큰 가져오기
        if (!refreshToken) throw new Error("리프레시 토큰 없음");

        const response = await fetch(`${API_URL}auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error("리프레시 토큰 갱신 실패");
        }

        const data = await response.json();
        localStorage.setItem("token", data.accessToken); // 새 액세스 토큰 저장
        return data.accessToken;
    } catch (error) {
        console.error("리프레시 토큰 처리 오류:", error.message);
        return null;
    }
};

/**
 * API 요청을 보내는 함수
 * 요청을 보낼 때 헤더와 JWT 토큰을 포함하여 요청
 * options 객체에 method, body 등을 설정하여 전달
 * @param {string} url 요청할 URL
 * @param {object} options fetch API의 두번 째 인자로 전달할 옵션 객체
 */
export const fetchWithAuth = async (url, options = {}) => {
    // 1. 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem("token");
    // 2. 서버로 보낼 때 전달할 헤더 설정(사용자 정의 헤더)
    const headers = {
        ...options.headers,     // ...options.headers : options 객체의 headers 속성을 복사
        Authorization: `Bearer ${token}`,  // "Authorization" : 'Bearer 토큰값' 형태로 설정
        "Content-Type": "application/json", // 기본 Content-Type
    };
    // 3. options 객체와 headers 객체를 합쳐서 새로운 config 객체 생성
    const config = { ...options, headers }; // 기본 설정과 사용자 설정 합치기
    // 4. fetch API로 요청 보내기
    try {
        let response = await fetch(url, config); // fetch API로 요청 보내기(response : 학생 한명 정보)

        if (response.status === 401) {
            console.warn("401 Unauthorized: Access token might be expired.");

            const newToken = await refreshAccessToken(); // 리프레시 토큰 사용
            if (newToken) {
                headers.Authorization = `Bearer ${newToken}`; // 새 토큰으로 헤더 갱신
                response = await fetch(url, { ...options, headers }); // 요청 재시도
            } else {
                throw new Error("토큰 갱신 실패로 요청 중단");
            }
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 오류: ${errorData.message || response.status}`);
        }

        //return await response.json(); // JSON 데이터 반환

        // 응답 본문이 있는 경우에만 JSON으로 파싱
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json(); // 서버에서 받은 JSON 데이터를 자바스크립트 객체로 변환
        } else {
            return response; // JSON이 아닌 경우 response 객체 그대로 반환
        }
    } catch (error) {
        console.error("API 요청 실패:", error.message);
        throw error;
    }
};

