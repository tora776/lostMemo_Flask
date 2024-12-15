/**
 * @type {HTMLFormElement}
 */

// 検索ボタン押下処理
document.getElementById("searchBtn").addEventListener('click', searchItem)

async function searchItem(ev){
    ev.preventDefault();
    // トークンと最終ログイン日時をチェックする
    checkToken();

    const sendDataJson = makeSendJson();

        try {
            // APIコール
            const response = await window.fetch("http://127.0.0.1:5000/SortItem", {
                method: "POST",
                // body: JSON.stringify(data, ["items", "places", "detailed_places"]),
                body: sendDataJson,
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
    // トークンと最終ログイン日時をチェックする
    checkToken();

    // エラーチェック
    var ret = indexErrorCheck();
    if(ret == false){
        return;
    }

    // 追加するデータを作成する
    const sendDataJson = makeSendJson();

    try {
        // APIコール
        await window.fetch("http://127.0.0.1:5000/InsertItem", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: sendDataJson,
        });

        window.alert("送信しました。");

        // 完了時に入力値をクリア
        // form.reset();
        document.getElementById("item").value = "";
        document.getElementById("place").value = "";
        document.getElementById("detailed_place").value = "";
        // テーブル作成
        searchItem(ev);

    } catch (e) {
        console.log(e);
    }
};

// 削除ボタン押下処理
document.getElementById("deleteBtn").addEventListener('click', deleteItem)

async function deleteItem(ev){
    ev.preventDefault();
    // トークンと最終ログイン日時をチェックする
    checkToken();
    // チェックボックスの行を取得する
    var checkedRows = getCheckedRows();
    if(checkedRows.length === 0){
        window.alert("チェックボックスを入力してください");
        return;
    }

    try {
        // APIコール
        const response = await window.fetch("http://127.0.0.1:5000/DeleteItem", {
            method: "POST",
            body: JSON.stringify(checkedRows),
        });

        window.alert("送信しました。");

        const json = await response.json();
        searchItem(ev);

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
  if(checkedRows.length === 0){
    window.alert("チェックボックスを入力してください");
    return;
    }
  sessionStorage.setItem('checkedRows', checkedRows);
  // 現在のページのクエリパラメータを取得
  const params = new URLSearchParams(window.location.search);
  // パラメータを取得
  const user_id = params.get("user_id"); 
  const token = params.get("token");
  // update.htmlへ遷移
  window.location.href = 'update.html' + '?user_id=' + user_id + "&token=" + token;
};


function makeSendJson(){
    // 現在のページのクエリパラメータを取得
    const params = new URLSearchParams(window.location.search);
    // パラメータを取得
    const user_id = params.get("user_id"); 
    const item = document.getElementById("item").value;
    const place = document.getElementById("place").value;
    const detailed_place = document.getElementById("detailed_place").value;

    // JSONオブジェクト作成
    var obj = {
        "user_id": user_id,
        "items": item,
        "places": place,
        "detailed_places": detailed_place
    }
    const sendDataJson = JSON.stringify(obj, null);

    return sendDataJson;
}

// エラーチェック
function indexErrorCheck(){
    // テキストボックスに値が格納されているか確認する
    let isValid = true;
    // HTML要素を取得
    const item = document.getElementById("item");
    const place = document.getElementById("place");
    const detailed_place = document.getElementById("detailed_place");
    const error_item = document.getElementById("error_item");
    const error_place = document.getElementById("error_place");
    const error_detailed_place = document.getElementById("error_detailed_place");

    // 入力値の書式確認
    if (!checkLostTextFormat(item, error_item)) isValid = false;
    if (!checkLostTextFormat(place, error_place)) isValid = false;
    if (!checkLostTextFormat(detailed_place, error_detailed_place)) isValid = false;

    return isValid
}

function checkInputCheckBox(checkBox_id){ 
    var bool = true;

    // テーブル要素を取得
    const table = document.getElementById("maintable");
    const rows = table.getElementsByTagName('tr');
    // テーブル内の各行にクリックイベントリスナーを追加
    for (const row of rows) {
      // 行の先頭にあるチェックボックスを取得
      const checkbox = this.cells[0].querySelector("input[type='checkbox']");
      
      // チェックボックスがあればチェック状態を切り替える
      if (checkbox.checked == false) {
        bool = false;
      }
    }

    return bool
}

function makeTable(json) {
    // maintable要素の中身をクリア
    const container = document.getElementById("maintable");
    container.innerHTML = '';

    // table要素を生成
    var table = document.createElement('table');

    // テーブル行を作成
    var tr = document.createElement('tr');
    // テーブルヘッダーを作成
    var th = document.createElement('th');

    // jsonにデータが格納されていない場合、「検索結果なし」と表記する
    if (json.length === 0) {
        th.textContent = "検索結果なし";
        table.appendChild(th);
        // 生成したtable要素を追加する
        document.getElementById('maintable').appendChild(table);
        return;
    }

    // チェックボックス列を作成
    // th要素内にテキストを追加
    th.textContent = "check";
    // th要素をtr要素の子要素に追加
    tr.appendChild(th);

    // テーブルに表示するid列を作成
    var th = document.createElement('th');
    th.textContent = "id_a";
    tr.appendChild(th);

    // 最初のkeyを記録
    let firstKey = Object.keys(json[0])[0];
    let hiddenColumnIndex = -1; // 非表示にする列のインデックス
    let columnIndex = 2; // チェック列と id_a 列を考慮して 2 からスタート

    for (let key in json[0]) {
        var th = document.createElement('th');
        th.textContent = key;
        tr.appendChild(th);

        // 最初のkeyのインデックスを記録
        if (key === firstKey) {
            hiddenColumnIndex = columnIndex;
        }
        columnIndex++;
    }
    // tr要素をtable要素の子要素に追加
    table.appendChild(tr);

    // テーブル本体を作成
    for (var i = 0; i < json.length; i++) {
        var tr = document.createElement('tr');

        // チェックボックス列
        var ch = Object.assign(document.createElement('input'), { type: "checkbox", name: "ch" });
        var td = document.createElement('td');
        td.appendChild(ch);
        tr.appendChild(td);

        // id_a列
        var td = document.createElement('td');
        td.textContent = i + 1;
        tr.appendChild(td);

        // データ列
        let colIndex = 2;
        for (let key in json[i]) {
            var td = document.createElement('td');
            td.textContent = json[i][key];
            tr.appendChild(td);

            // 最初のkeyの場合、非表示にする
            if (colIndex === hiddenColumnIndex) {
                td.style.display = 'none';
            }
            colIndex++;
        }

        // イベントリスナーを付与
        tr.addEventListener("click", function (event) {
            if (event.target.type !== "checkbox") {
                const checkbox = this.cells[0].querySelector("input[type='checkbox']");
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            }
        });

        table.appendChild(tr);
    }

    // 生成したtable要素を追加する
    document.getElementById('maintable').appendChild(table);

    // ヘッダー行の最初のkey列を非表示にする
    if (hiddenColumnIndex > -1) {
        table.rows[0].cells[hiddenColumnIndex].style.display = 'none';
    }
}
  
// index.htmlでチェックした行を取得する
function getCheckedRows() {

    var table = document.getElementById('maintable');
    var rows = table.getElementsByTagName('tr');
    var checkedRows = [];
    
    for (var i = 1; i < rows.length; i++) { 
        // ヘッダー行をスキップ
        var checkbox = rows[i].getElementsByTagName('input')[0];
        if (checkbox && checkbox.checked) {
            var rowData = [];
            var cells = rows[i].getElementsByTagName('td');
            for (var j = 1; j < cells.length; j++) { 
                // チェックボックス・テーブル行のセルをスキップ
                rowData.push(cells[j].textContent);
            }
            checkedRows.push(rowData);
        }
    }
    // 必要に応じてここで取得したデータを処理する
    return checkedRows;
}