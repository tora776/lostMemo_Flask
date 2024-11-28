/**
 * @type {HTMLFormElement}
 */

// ログインボタン押下処理
document.getElementById("loginBtn").addEventListener('click', loginCheck)

async function loginCheck(ev){
    ev.preventDefault();

    const form = document.getElementById("inquiry");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

        try {
            // APIコール
            const response = await window.fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                body: JSON.stringify(data, ["user_id", "password"]),
            });

            const user_id = document.getElementById("user_id").value;

            // tokenをサーバから受け取りリダイレクトする。
            const token = await response.text();
            if(token != null){
                window.location.href = 'index.html' + '?user_id=' + user_id + "&token=" + token;
            }

        } catch (e) {
            console.log(e);
        }
    };
