/**
 * @type {HTMLFormElement}
 */

// 検索ボタン押下処理
document.getElementById("searchBtn").addEventListener('click', searchItem)

async function searchItem(ev){
    ev.preventDefault();

    getURI();

    const form = document.getElementById("inquiry");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

        try {
            // APIコール
            const response = await window.fetch("http://127.0.0.1:5000/PostSortItem", {
                method: "POST",
                body: JSON.stringify(data, ["items", "places", "detailed_places"]),
            });

            const json = await response.json();
            makeTable(json);

        } catch (e) {
            console.log(e);
        }
    };

// 追加ボタン押下処理
document.getElementById("insertBtn").addEventListener('click', insertItem)

async function insertItem(ev){
    ev.preventDefault();

    const form = document.getElementById("inquiry");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        // APIコール
        await window.fetch("http://127.0.0.1:5000/InsertItem", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data, ["items", "places", "detailed_places"]),
        });

        window.alert("送信しました。");

        // 完了時に入力値をクリア
        form.reset();

        select_data('http://127.0.0.1:5000/GetItem');

    } catch (e) {
        console.log(e);
    }
};

// 削除ボタン押下処理
document.getElementById("deleteBtn").addEventListener('click', deleteItem)

async function deleteItem(ev){
    ev.preventDefault();
    checkedRows = getCheckedRows();

    try {
        // APIコール
        const response = await window.fetch("http://127.0.0.1:5000/DeleteItem", {
            method: "POST",
            body: JSON.stringify(checkedRows),
        });

        window.alert("送信しました。");

        const json = await response.json();
        makeTable(json);

    } catch (e) {
        console.log(e);
    }
};


// 更新ボタン押下処理
document.getElementById("updateBtn").addEventListener('click', moveUpdatePage)

async function moveUpdatePage(ev){
  ev.preventDefault();
  // チェックボックスの値をセッションストレージに保存。
  const checkedRows = getCheckedRows();
  sessionStorage.setItem('checkedRows', checkedRows);
  window.location.href = 'update.html';
};

async function getURI(){
    // 現在のページのクエリパラメータを取得
    const params = new URLSearchParams(window.location.search);
    // パラメータを取得
    const user_id = params.get("user_id"); 
    const token = params.get("token");
    // JSONオブジェクト作成
    var obj = {
        "user_id": user_id,
        "token": token
    }
    const loginJSON = JSON.stringify(obj, null);
    
    try {
        // APIコール
        const response = await window.fetch("http://127.0.0.1:5000/lastLoginCheck", {
            method: "POST",
            body: loginJSON,
        });

        // 処理結果を受け取る
        const result = await response.json();

        // bool値を取得
        const isValid = result.result;
        console.log("Result:", isValid);
        
        
        // 必要に応じて処理
        if (isValid == false) {
            alert("トークンの期限が切れています。再ログインしてください");
            window.location.href = 'login.html';
        }
        

    } catch (e) {
        console.log(e);
    }

};


