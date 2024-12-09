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
    const chunkSize = 5;
    
    for (let i = 0; i < arr.length; i += chunkSize) {
        let chunk = arr.slice(i, i + chunkSize);
        let obj = {
            id: chunk[0],
            date: chunk[1],
            items: chunk[2],
            places: chunk[3],
            detailed_places: chunk[4]
        };
        result.push(obj);
    }
    
    return result;
  }

// update.htmlにてテーブルを作成する
function makeForm(json) {
    // table要素を生成
    var table = document.createElement('table');
    // テーブル行を生成
    var tr = document.createElement('tr');
    // ヘッダーを生成
    var th = document.createElement('th');
    // テーブルに要素を追加
    for (let key in json[0]) {
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
    for (let i = 0; i < json.length; i++) {
        // tr要素を生成
        var tr = document.createElement('tr');
      
        for (let key in json[i]) {
            // td要素を生成
            var td = document.createElement('td');
            // 入力フォーム内にチェックボックスの値を入力
            if (key == "items" || key == "places" || key == "detailed_places"){
                // テキストボックスを作成
                form = document.createElement('input');
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
            };
            // td要素をtr要素の子要素に追加
            tr.appendChild(td);
        }
        // tr要素をtable要素の子要素に追加
        table.appendChild(tr);
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
            for (var j = 0; j < cells.length; j++) { 
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
      // テキストにエラーがある場合、処理を終了する
      if(checkedRows === null){
        return;
      }
      
      try {
          // APIコール
          const response = await window.fetch("http://127.0.0.1:5000/UpdateItem", {
              method: "POST",
              body: JSON.stringify(checkedRows),
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
