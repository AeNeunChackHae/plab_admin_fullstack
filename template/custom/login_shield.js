
const authToken = localStorage.getItem("authToken");

if (authToken == null || authToken == undefined) {
    location.href = "/auth/login";
}

function logout_confirm(){
    if(confirm('로그아웃 하시겠습니까?')){
        localStorage.removeItem('authToken');
        location.href = '/auth/login';
    }
}