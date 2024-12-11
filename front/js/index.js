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

// テーブルを作成する
function makeTable(json){
  
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
    if(json.length === 0){
        th.textContent = "検索結果なし"
        table.appendChild(th);
        // 生成したtable要素を追加する
        document.getElementById('maintable').appendChild(table);
        return;
    }
    // th要素内にテキストを追加
    th.textContent = "check";
    // th要素をtr要素の子要素に追加
    tr.appendChild(th);
  
    for (key in json[0]) {
          // th要素を生成
          var th = document.createElement('th');
          // th要素内にテキストを追加
          th.textContent = key;
          // th要素をtr要素の子要素に追加
          tr.appendChild(th);
          }
      // tr要素をtable要素の子要素に追加
      table.appendChild(tr);
  
    // テーブル本体を作成
    for (var i = 0; i < json.length; i++) {
      // tr要素を生成
      var tr = document.createElement('tr');
  
      // チェックボックスを作成
      var ch=Object.assign(document.createElement('input'),{type:"checkbox",name:"ch",});
      // テーブルデータ要素を作成
      var td=document.createElement('td');
      // HTML要素を追加
      td.appendChild(ch);
      tr.appendChild(td); 
      // イベントリスナーを付与（行をクリックすると、行頭のチェックボックスを切り替える）
      tr.addEventListener("click", function (event) {
        // チェックボックスをクリックした際、２回選択されることを防ぐ
        if(event.target.type !== "checkbox"){
            // 行の先頭にあるチェックボックスを取得
            const checkbox = this.cells[0].querySelector("input[type='checkbox']");
            
            // チェックボックスがあればチェック状態を切り替える
            if (checkbox) {
            checkbox.checked = !checkbox.checked;
            };
        }
        
      });
  
      // th・td部分のループ
      for (key in json[0]) {
            // td要素を生成
            var td = document.createElement('td');
            // td要素内にテキストを追加
            td.textContent = json[i][key];
            // td要素をtr要素の子要素に追加
            tr.appendChild(td);
          }
        // tr要素をtable要素の子要素に追加
        table.appendChild(tr);
      }
    // 生成したtable要素を追加する
    document.getElementById('maintable').appendChild(table);
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
                // チェックボックスのセルをスキップ
                rowData.push(cells[j].textContent);
            }
            checkedRows.push(rowData);
        }
    }
    // 必要に応じてここで取得したデータを処理する
    return checkedRows;
}