from flask import Flask, request
from flask_cors import CORS
from sql import DB
from data import createJson, formGetValue, sortColumn, CheckGetValue, CheckGetColumn

app = Flask(__name__)
CORS(app)

# 全検索
@app.route('/GetItem')
def GetItems():
    db = DB()
    ret = db.selectAll()
    return createJson(ret)

# 部分検索
@app.route('/PostSortItem', methods=['POST', 'GET'])
def GetSelectItems():
    db = DB()
    result = request.get_data()
    columnList = sortColumn(result)
    ret = db.select_data(columnList)
    return createJson(ret) 

# データ追加
@app.route('/InsertItem', methods=['POST'])
def InsertItems():
    result = request.get_data()
    dataList = formGetValue(result)
    db = DB()
    db.insert_data(dataList[0], dataList[1], dataList[2])
    return dataList

# データ削除
@app.route('/DeleteItem', methods=['POST', 'GET'])
def DeleteItems():
    db = DB()
    result = request.get_data()
    idList_str = CheckGetValue(result)
    db.delete_data(idList_str)
    ret = db.selectAll()
    return createJson(ret) 

# データ更新
@app.route('/UpdateItem', methods=['POST', 'GET'])
def UpdateItems():
    db = DB()
    result = request.get_data()
    dataList = CheckGetColumn(result)
    print(dataList, flush=True)
    db.update_data(dataList[0], dataList[1], dataList[2], dataList[3])
    ret = db.selectAll()
    return createJson(ret) 



# Webサーバを起動する。ポートはiisで指定。
if __name__ == '__main__':
    app.run(debug=True)