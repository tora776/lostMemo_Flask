// セッションストレージの値を取得する
function getSessionStorageValue(){
        if (window.location.pathname.endsWith('update.html')) {
            const checkedRows = sessionStorage.getItem('checkedRows');
            // セッションストレージに保存された値を整形
            if (checkedRows) {
                const checkedArr = checkedRows.split(',');
                const transformedArray = transformArray(checkedArr);
                makeForm(transformedArray);
            }
        }
    };

// チェックボックスの文字列を二次元配列に整形
function transformArray(arr) {
    let result = [];
    
    // 1回に処理する要素数
    const chunkSize = 6;
    
    for (let i = 0; i < arr.length; i += chunkSize) {
        let chunk = arr.slice(i, i + chunkSize);
        let obj = {
            lost_id: chunk[0],
            id:chunk[1],
            date: chunk[2],
            items: chunk[3],
            places: chunk[4],
            detailed_places: chunk[5]
        };
        result.push(obj);
    }
    
    return result;
  }

  function makeForm(json) {
    // table要素を生成
    var table = document.createElement('table');
    // テーブル行を生成
    var tr = document.createElement('tr');

    // 非表示にする列のキー
    const hiddenKey = "id";
    let hiddenColumnIndex = -1; // 非表示にする列のインデックスを保持
    let columnIndex = 0; // 列のインデックス

    // ヘッダーを生成
    for (let key in json[0]) {
        // th要素を生成
        var th = document.createElement('th');
        th.textContent = key;
        tr.appendChild(th);

        // 非表示にする列のインデックスを取得
        if (key === hiddenKey) {
            hiddenColumnIndex = columnIndex;
        }
        columnIndex++;
    }
    // ヘッダー行をtableに追加
    table.appendChild(tr);

    // テーブル本体を作成
    for (let i = 0; i < json.length; i++) {
        var tr = document.createElement('tr');
        columnIndex = 0;

        for (let key in json[i]) {
            // td要素を生成
            var td = document.createElement('td');

            if (key == "items" || key == "places" || key == "detailed_places") {
                // テキストボックスを作成
                let form = document.createElement('input');
                form.setAttribute("value", json[i][key]);
                form.className = "input";

                // エラーメッセージを作成
                var errorMessage = document.createElement("span");
                errorMessage.className = "error-message";

                // テキストボックス・エラーメッセージを追加
                td.appendChild(form);
                td.appendChild(errorMessage);
            } else {
                // td要素内にテキストを追加
                td.textContent = json[i][key];
            }

            // 非表示列の場合、スタイルを設定
            if (columnIndex === hiddenColumnIndex) {
                td.style.display = "none";
            }

            // td要素をtr要素の子要素に追加
            tr.appendChild(td);
            columnIndex++;
        }
        // tr要素をtable要素の子要素に追加
        table.appendChild(tr);
    }

    // ヘッダー行の非表示列もスタイルを設定
    if (hiddenColumnIndex > -1) {
        table.rows[0].cells[hiddenColumnIndex].style.display = "none";
    }

    // 生成したtable要素を追加する
    document.getElementById('Formtable').appendChild(table);
}

// update.htmlにてindexに戻るボタンを押した際の処理
document.getElementById("indexBtn").addEventListener('click', indexBack)

function indexBack(ev){
    ev.preventDefault();
    // 現在のページのクエリパラメータを取得
    const params = new URLSearchParams(window.location.search);
    // パラメータを取得
    const user_id = params.get("user_id"); 
    const token = params.get("token");
    // index.htmlへ遷移
    window.location.href = 'index.html' + '?user_id=' + user_id + "&token=" + token;
};

// 更新対象のjsonを作成する
function makeUpdateJson(){
    var table = document.getElementById('Formtable');
    var rows = table.getElementsByTagName('tr');
    var checkedRows = [];
    let isValid = true;
  
    for (var i = 1; i < rows.length; i++) { 
            var rowData = [];
            var cells = rows[i].getElementsByTagName('td');
            // id_a列は含まないので、j = 1となる。
            for (var j = 1; j < cells.length; j++) { 
                if(cells[j].innerHTML.indexOf('input') != -1) {
                  // テキストボックスの場合
                  // テーブル内のHTML要素を取得
                  var input = cells[j].getElementsByClassName("input")[0];
                  var errorMessage = cells[j].getElementsByClassName("error-message")[0];
                  // 入力値の書式確認
                  if (!checkLostTextFormat(input, errorMessage)) isValid = false;
                  rowData.push(cells[j].firstElementChild.value);
                } else if(cells.textContent!="")  {
                  // id・dateの場合
                  rowData.push(cells[j].textContent);
                }
            }
            checkedRows.push(rowData);
    }
    // 入力値にエラーがある場合、nullを返す
    if(isValid === false){
        return null;
    }

    return checkedRows;
  }


// update.htmlにて送信ボタンを押した際の処理
document.getElementById("changeBtn").addEventListener('click', updateSendServer)

async function updateSendServer(ev){
      ev.preventDefault();

      checkedRows = makeUpdateJson();
      console.log(checkedRows);
      // テキストにエラーがある場合、処理を終了する
      if(checkedRows === null){
        return;
      }
      
      try {
          // APIコール
          const response = await window.fetch("http://127.0.0.1:5000/UpdateItem", {
              method: "POST",
              body: JSON.stringify(checkedRows),
              credentials: "include",
          });

          window.alert("送信しました。");

          const json = await response.json()
        
          sessionStorage.setItem('json', json);
          // index.htmlに遷移する
          indexBack(ev);

          //const allQuery = sessionStorage.getItem('json');
          //makeTable(allQuery);
          //  });

      } catch (e) {
          console.log(e);
      }
          
  };
