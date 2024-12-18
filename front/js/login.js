/**
 * @type {HTMLFormElement}
 */

// ログインボタン押下処理
document.getElementById("loginBtn").addEventListener('click', loginCheck)

async function loginCheck(ev){
    ev.preventDefault();

    // エラーチェック
    let ret = loginErrorCheck();
    if(ret == false){
        return;
    }

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
                credentials: "include",
            });
            
            // tokenをサーバから受け取りリダイレクトする。
            const res = await response.json();
            if(res != null){
                window.location.href = 'index.html';
            }
        } catch (e) {
            console.log(e);
        }
    };


document.getElementById("createUserBtn").addEventListener('click', createUser)

async function createUser(ev){
    ev.preventDefault();

    // エラーチェック
    let ret = loginErrorCheck();
    if(ret == false){
        return;
    }

    const form = document.getElementById("inquiry");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

        try {
            // APIコール
            const response = await window.fetch("http://127.0.0.1:5000/registUser", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, ["user_id", "password"]),
                credentials: "include",
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

// ログイン時のエラーチェック
function loginErrorCheck(){
    let isValid = true;
    // HTML要素を取得
    const user_id = document.getElementById("user_id");
    const password = document.getElementById("password");
    const error_user_id = document.getElementById("error_user_id");
    const error_password = document.getElementById("error_password");

    // 入力値の書式チェック
    if (!checkLoginFormat(user_id, error_user_id)) isValid = false;
    if (!checkLoginFormat(password, error_password)) isValid = false;

    return isValid;
}

// ログイン時のテキストボックスの書式をチェックする
function checkLoginFormat(input, error){
    let bool = true;
    var pattern = /[a-zA-Z0-9]+$/;
    const minLength = 5;  // 最小文字数
    const maxLength = 30; // 最大文字数
    // 初期化処理
    error.textContent = '';

    if (input.value === ""){
        // 入力値が空の場合
        bool = false;
        input.style.backgroundColor = '#fcc';
        error.textContent = '※入力値が空です';
    } else {
        // 入力値が空でない場合

        // 入力値が最小文字数を下回った場合
        if (input.value.length < minLength) {
            input.style.backgroundColor = '#fcc'; // 背景色を赤に設定
            error.textContent = `※${minLength}文字以上入力してください`;
            bool = false;
            return bool;
        }

        // 入力値が最大文字数を超えた場合
        if (input.value.length > maxLength) {
            input.style.backgroundColor = '#fcc'; // 背景色を赤に設定
            error.textContent = `※入力文字数は最大${maxLength}文字です`;
            bool = false;
            return bool;
        }

        if (pattern.test(input.value)){
            // 入力値がアルファベット大文字・小文字・数字のみの場合
            input.style.backgroundColor = '#fff';
        } else {
            // 入力値がアルファベット大文字・小文字・数字のみでない場合
            input.style.backgroundColor = '#fcc';
            error.textContent = `※入力値はアルファベット大文字・小文字・数字です（${maxLength}文字以内）`;
            bool = false;
        }
    }

    return bool;
}