import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

/**
 * 리액트 앱이 시작되는 지점으로 App 컴포넌트를 렌더링한다.
 * - App 컴포넌트를 BrowserRouter로 감싸 라우팅 기능을 사용할 수 있도록 한다.[수정]
 */
createRoot(document.getElementById('root')).render(
        <App />
)
