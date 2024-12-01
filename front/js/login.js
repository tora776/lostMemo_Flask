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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, ["user_id", "password"]),
            });
           
            // tokenをサーバから受け取りリダイレクトする。
            const res = await response.json();
            if(res != null){
                window.location.href = 'index.html' + '?user_id=' + res.user_id + "&token=" + res.token;
            }
            

        } catch (e) {
            console.log(e);
        }
    };


document.getElementById("createUserBtn").addEventListener('click', createUser)

async function createUser(ev){
    ev.preventDefault();

    const form = document.getElementById("inquiry");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

        try {
            // APIコール
            const response = await window.fetch("http://127.0.0.1:5000/createUser", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, ["user_id", "password"]),
            });
            

            // tokenをサーバから受け取りリダイレクトする。
            const res = await response.json();
            if(res.result == True){
                window.alert("ユーザーを作成しました");
            }
            else {
                window.alert("ユーザー作成に失敗しました");
            }
            
            

        } catch (e) {
            console.log(e);
        }
    };