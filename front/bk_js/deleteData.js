/**
 * @type {HTMLFormElement}
 */

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
        console.log(JSON.stringify(checkedRows));

        const json = await response.json()
        makeTable(json)

    } catch (e) {
        console.log(e);
    }
};