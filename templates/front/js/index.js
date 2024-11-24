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
};


