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

function setupRowClickEvent(){
  // テーブル要素を取得
  const table = document.getElementById("maintable");
  const rows = table.getElementsByTagName('tr');
  // テーブル内の各行にクリックイベントリスナーを追加
  for (const row of rows) {
    row.addEventListener("click", function (event) {
      // 行の先頭にあるチェックボックスを取得
      const checkbox = this.cells[0].querySelector("input[type='checkbox']");
      
      // チェックボックスがあればチェック状態を切り替える
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
      }
    });
  }
}


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