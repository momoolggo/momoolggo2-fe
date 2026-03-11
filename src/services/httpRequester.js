import axios from 'axios';
axios.defaults.baseURL = '/api';
//권한 설정까지 다되면 주석제거 코드일부수정해야됨

// axios.defaults.withCredentials = true; //보안쿠키 내용이 서버에 전달, 보안쿠키에 AT, RT 저장

// axios.interceptors.response.use(
//     (res) => {
//         return res;
//     },
//     async (err) => {
//         console.log('err: ', err);
//         if (err.response) {
//             console.log('err.response : ', err.response);
//             const authenticationStore = useAuthenticationStore();
//             if (err.config.url === '/user/reissue' && err.response.status === 500) {
//                 authenticationStore.signOut();
//             } 
//             else if (err.response.status === 401 && authenticationStore.state.isSigned) {
//                 //401 UnAuthorized 에러인데 FE 로그인 처리 되어 있다면

//                 await reissue(); //AccessToken 재발행 시도

//                 // 중단된 요청을(에러난 요청)을 토큰 갱신 후 재요청
//                 return await axios.request(err.config);
//             } 
//             else {
//                 const message = err.response.data?.message
//                 ? err.response.data?.message
//                 : err.response.data;

//                 const messageModalStore = useMessageModalStore();
//                 messageModalStore.setMessage(message);
//             }
//         }

//         return Promise.reject(err);
//     }
// );

export default axios;