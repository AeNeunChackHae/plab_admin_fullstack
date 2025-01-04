const super_admin_yn = localStorage.getItem("super_admin_yn")
console.log("super_admin_yn: ", super_admin_yn)

const aside_admin_menu = document.getElementById("aside_admin_menu")
console.log("aside_admin_menu: ", aside_admin_menu)

// 존재할 시 
if (super_admin_yn && super_admin_yn == 'Y') {
    aside_admin_menu.hidden = false
    console.log("if (super_admin_yn && super_admin_yn == 'Y'): 진입")
} 
// 존재하지 않을 시
else {
    aside_admin_menu.hidden = true
    console.log("else (super_admin_yn && super_admin_yn == 'Y'): 진입")
}