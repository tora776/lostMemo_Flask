function readCheckedRows_Update(){
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
    };
