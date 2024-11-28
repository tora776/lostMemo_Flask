from flask import Flask, request, jsonify
from flask_cors import CORS
from sql import DB
from data import createLostJson, formGetValue, sortColumn, CheckGetValue, CheckGetColumn
import secrets

app = Flask(__name__)
CORS(app)

# login処理
@app.route('/login', methods=['POST', 'GET'])
def login():
    db = DB()
    result = request.get_data()
    dataList = sortColumn(result)
    user_id = dataList[1][0]
    ret = db.userCheck(dataList)
    if not ret:
        return "ユーザーIDかパスワードが異なります"
    token = secrets.token_hex()
    db.tokenRegister(user_id, token)
    return token

# 最終ログイン日時確認
@app.route('/lastLoginCheck', methods=['POST', 'GET'])
def lastLoginCheck():
    db = DB()
    result = request.get_data()
    dataList = sortColumn(result)
    ret = db.lastLoginCheckQuery(dataList)
    # クエリ結果が存在しない場合、Falseを返す。Noneの想定。
    if not ret[0][0]:
        return jsonify({'result': False})
    # トークン発行から24時間以上経っている場合、Falseを返す。

    return jsonify({'result': True})

# 全検索
@app.route('/GetItem')
def GetItems():
    db = DB()
    ret = db.selectAll()
    return createLostJson(ret)

# 部分検索
@app.route('/PostSortItem', methods=['POST', 'GET'])
def GetSelectItems():
    db = DB()
    result = request.get_data()
    columnList = sortColumn(result)
    ret = db.select_data(columnList)
    return createLostJson(ret) 

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
    return createLostJson(ret) 

# データ更新
@app.route('/UpdateItem', methods=['POST', 'GET'])
def UpdateItems():
    db = DB()
    result = request.get_data()
    dataList = CheckGetColumn(result)
    print(dataList, flush=True)
    db.update_data(dataList[0], dataList[1], dataList[2], dataList[3])
    ret = db.selectAll()
    return createLostJson(ret) 



# Webサーバを起動する。ポートはiisで指定。
if __name__ == '__main__':
    app.run(debug=True)