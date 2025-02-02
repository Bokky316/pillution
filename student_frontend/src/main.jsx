import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store'; // Redux 스토어 및 Persistor 가져오기
import { PersistGate } from 'redux-persist/integration/react'; // PersistGate 가져오기
/**
 * 리액트 앱이 시작되는 지점으로 App 컴포넌트를 렌더링한다.
 * - App 컴포넌트를 BrowserRouter로 감싸 라우팅 기능을 사용할 수 있도록 한다.[수정]
 * - Provider store={store} : 리덕스 스토어를 사용할 수 있도록 Provider 컴포넌트로 감싼다.[추가]
 *   이렇게 감싸면 하위 컴포넌트에서 store를 직접 import하지 않아도 store를 사용할 수 있게 된다.
 *   일반 컴포넌트에서 리덕스 스토어를 사용하려면 useSelector, useDispatch 등의 리덕스 훅을 사용 한다.
 * - PersistGate : Redux Persist를 활성화하고, 저장된 상태를 로드한 뒤 애플리케이션을 렌더링한다.
 * - PersistGate를 사용하여 Redux Persist가 상태를 로컬 스토리지에서 복원할 때까지 애플리케이션의 렌더링을 지연시킵니다.
 * - loading={null}은 로드 중일 때 표시할 UI를 지정합니다. 필요 시 로딩 스피너를 넣을 수 있습니다.
 */

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </PersistGate>
    </Provider>
)

persistor.subscribe(() => {
    console.log("main.jsx Persistor 상태:", store.getState());
});