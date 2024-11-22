/**
 * @type {HTMLFormElement}
 */
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
