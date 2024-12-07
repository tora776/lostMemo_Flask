/**
 * @type {HTMLFormElement}
 */


// tokenの発行日付を確認する
async function checkToken(){
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

// 社員データを取得し、テーブルに表示する
function select_data(url) {
    fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function (json) {
     makeTable(json);
     setupRowClickEvent();
    });
  }
  
function makeTable(json){
  
    // maintable要素の中身をクリア
    const container = document.getElementById("maintable");
    container.innerHTML = '';
  
    // table要素を生成
    var table = document.createElement('table');
  
    // ヘッダーを作成
    var tr = document.createElement('tr');
  
    var th = document.createElement('th');
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
      // var tr=document.createElement('tr');
      var td=document.createElement('td');
      // document.querySelector('#maintable').appendChild(tr);
      td.appendChild(ch);
      tr.appendChild(td); 
  
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

// テーブル行をクリックすると、チェックボックスのチェックを切り替える
function setupRowClickEvent(){
    // テーブル要素を取得
    const table = document.getElementById("maintable");
    const rows = table.getElementsByTagName('tr');

    // テーブル内の各行にクリックイベントリスナーを追加
    for (const row of rows) {
        row.addEventListener("click", function (event) {

        console.log(event.target.type)
        // 行の先頭にあるチェックボックスを取得
        const checkbox = this.cells[0].querySelector("input[type='checkbox']");
        
        // チェックボックスがあればチェック状態を切り替える
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
        }
      });
    }
}

  
// チェックした行を取得する
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

// 紛失物のテキストボックスの書式をチェックする
function checkLostTextFormat(input_id, error_id){
    let bool = true;
    var pattern = /^[a-zA-Z0-9\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf-･_]+$/;
    const maxLength = 100; // 最大文字数
    const input = document.getElementById(input_id);
    // 初期化処理
    document.getElementById(error_id).textContent = '';

    if (input.value.length > maxLength) {
        input.style.backgroundColor = '#fcc'; // 背景色を赤に設定
        document.getElementById(error_id).textContent = `※入力文字数は最大${maxLength}文字です。`;
        bool = false;
        return bool;
    }

    
    if (input.value === ""){
        // 入力値が空の場合
        bool = false;
        input.style.backgroundColor = '#fcc';
        document.getElementById(error_id).textContent = '※入力値が空です';
        bool = false;
    } else {
        // 入力値が空でない場合
        if (pattern.test(input.value)){
            // 入力値に「-」「･」「_」以外の記号が含まれている場合
            input.style.backgroundColor = '#fff';
        } else {
            // 入力値に「-」「･」「_」以外の記号が含まれていない場合
            input.style.backgroundColor = '#fcc';
            document.getElementById(error_id).textContent = `※入力値に「-」「･」「_」以外の記号は使えません（${maxLength}文字以内）`;
            bool = false;
        }
    }

    return bool;
}