/**
 * @type {HTMLFormElement}
 */


// tokenの発行日付を確認する
async function checkToken(){
    try {
        // APIコール
        const response = await window.fetch("http://127.0.0.1:5000/lastLoginCheck", {
            method: "POST",
            credentials: "include",
        });

        // 処理結果を受け取る
        const result = await response.json();
        
        // bool値を取得
        const message = result.message;
        if(message === "Welcome!"){
            console.log(result.message);
        } else {
            // エラーメッセージをコンソールへ表示
            const errorMessage = result.message;
            console.log("Result:", errorMessage);
        }
        /*
        // 必要に応じて処理
        if (isValid === false) {
            alert("トークンの期限が切れています。再ログインしてください");
            window.location.href = 'login.html';
        }
        */
        

    } catch (e) {
        console.log(e);
    }

};

// 社員データを取得し、テーブルに表示する
function select_data(url) {
    fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function (json) {
        makeTable(json);
    });
  }


// 紛失物のテキストボックスの書式をチェックする
function checkLostTextFormat(input, errorMessage){
    let bool = true;
    // アルファベット大文字・小文字・数字・日本語・「-」「･」「_」のみ許可
    var pattern = /^[a-zA-Z0-9\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf-･_]+$/;
    const maxLength = 100; // 最大文字数
    // エラー文言初期化処理
    errorMessage.textContent = '';
    // 最大文字数チェック
    if (input.value.length > maxLength) {
        input.style.backgroundColor = '#fcc'; // 背景色を赤に設定
        errorMessage.textContent = `※入力文字数は最大${maxLength}文字です。`;
        bool = false;
        return bool;
    }

    // 入力値が空かチェック
    if (input.value === ""){
        // 入力値が空の場合
        bool = false;
        input.style.backgroundColor = '#fcc';
        errorMessage.textContent = '※入力値が空です';
        bool = false;
    } else {
        // 入力値が空でない場合
        if (pattern.test(input.value)){
            // 入力値に「-」「･」「_」以外の記号が含まれている場合
            input.style.backgroundColor = '#fff';
        } else {
            // 入力値に「-」「･」「_」以外の記号が含まれていない場合
            input.style.backgroundColor = '#fcc';
            errorMessage.textContent = `※入力値に「-」「･」「_」以外の記号は使えません（${maxLength}文字以内）`;
            bool = false;
        }
    }

    return bool;
}