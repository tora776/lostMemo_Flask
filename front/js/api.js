/**
 * @type {HTMLFormElement}
 */

// 検索ボタン押下処理
document.getElementById("searchBtn").addEventListener('click', searchText)

async function searchText(ev){
    ev.preventDefault();

    const form = document.getElementById("inquiry");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

        try {
            // APIコール
            const response = await window.fetch("http://127.0.0.1:5000/PostSortItem", {
                method: "POST",
                body: JSON.stringify(data, ["items", "places", "detailed_places"]),
            });

            const json = await response.json()
            makeTable(json)

        } catch (e) {
            console.log(e);
        }
    };

// 追加ボタン押下処理
document.getElementById("insertBtn").addEventListener('click', insertText)

async function insertText(ev){
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
document.getElementById("deleteBtn").addEventListener('click', deleteText)

async function deleteText(ev){
    ev.preventDefault();
    checkedRows = getCheckedRows();

    try {
        // APIコール
        const response = await window.fetch("http://127.0.0.1:5000/DeleteItem", {
            method: "POST",
            body: JSON.stringify(checkedRows),
        });

        window.alert("送信しました。");

        const json = await response.json()
        makeTable(json)

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
  /*
    if (window.location.pathname.endsWith('update.html')) {
      const checkedRows = sessionStorage.getItem('checkedRows');
      console.log(checkedRows);
      // セッションストレージに保存された値を整形
      if (checkedRows) {
          const checkedArr = checkedRows.split(',');
          const transformedArray = transformArray(checkedArr);
          makeForm(transformedArray);
      }
  }
  */
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

function makeForm(json) {
  // table要素を生成
  var table = document.createElement('table');

  // ヘッダーを作成
  var tr = document.createElement('tr');

  var th = document.createElement('th');

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
            form = document.createElement('input');
            form.setAttribute("value", json[i][key])
            td.appendChild(form);
        
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

function makeUpdateJson(){
  var table = document.getElementById('Formtable');
  var rows = table.getElementsByTagName('tr');
  var checkedRows = [];

  for (var i = 1; i < rows.length; i++) { 
          var rowData = [];
          var cells = rows[i].getElementsByTagName('td');
          for (var j = 0; j < cells.length; j++) { 
              if(cells[j].innerHTML.indexOf('input') != -1) {
                rowData.push(cells[j].firstElementChild.value);
              } else if(cells.textContent!="")  {
                rowData.push(cells[j].textContent);
              }
          }
          checkedRows.push(rowData);
  }

  return checkedRows;
}

// update.htmlにてindexに戻るボタンを押した際の処理
document.getElementById("indexBtn").addEventListener('click', indexBack())

function indexBack(){
        indexBtn.addEventListener("click", async ev => {
            ev.preventDefault();
            window.location.href='index.html'
        });
};

function updateSendServer(){
  const changeBtn = document.getElementById("changeBtn");

  changeBtn.addEventListener("click", async ev => {
      ev.preventDefault();

      checkedRows = makeUpdateJson();

      try {
          // APIコール
          const response = await window.fetch("http://127.0.0.1:5000/UpdateItem", {
              method: "POST",
              body: JSON.stringify(checkedRows),
          });

          window.alert("送信しました。");

          const json = await response.json()
        
          sessionStorage.setItem('json', json);
          window.location.href = 'index.html';

          const allQuery = sessionStorage.getItem('json');
          
          // document.addEventListener('DOMContentLoaded', () => {
          //  if (window.location.pathname.endsWith('index.html')) {

          makeTable(allQuery);
          //  });

      } catch (e) {
          console.log(e);
      }
  });
};

