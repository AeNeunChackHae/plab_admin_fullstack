
const authToken = localStorage.getItem("authToken");

if (authToken == null || authToken == undefined) {
    location.href = "/auth/login";
} else {
    fetch("/auth/tokenVal", {
        method: "GET",
        headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
        if (!data.status) {
            localStorage.removeItem('authToken')  // expire 등의 이유로 invalid 된 경우 기존 token을 없애야 하니까
            location.href = "/auth/login";
        }
        })
        .catch((error) => console.error("Error:", error));
}